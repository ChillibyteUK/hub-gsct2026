<?php
/**
 * Pure-PHP PDF text extraction.
 *
 * No third-party libraries or binaries: it parses the PDF object structure
 * itself (classic and compressed object streams), walks the page tree, and
 * interprets the text-showing operators in each page's content stream,
 * decoding glyph codes through the font's ToUnicode map where there is one.
 * zlib (gzuncompress) is the only PHP extension relied on, plus mbstring
 * for the legacy-encoding fallback.
 *
 * Deliberately limited — it exists to feed the document library search, not
 * to reproduce a document faithfully:
 *  - FlateDecode, ASCIIHexDecode and ASCII85Decode streams only.
 *  - Encrypted PDFs, and scanned PDFs (no text layer), yield an empty string.
 *  - Fonts with no ToUnicode map are read as Windows-1252 if they are
 *    single-byte; composite (Type0) fonts without a map are skipped.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Indirect reference (e.g. "12 0 R") inside a parsed PDF structure.
 */
class Hub_GSCT2026_PDF_Ref {
	/**
	 * Object number.
	 *
	 * @var int
	 */
	public $id;

	/**
	 * Constructor.
	 *
	 * @param int $id Object number.
	 */
	public function __construct( $id ) {
		$this->id = $id;
	}
}

/**
 * Raw string (literal or hex) inside a parsed PDF structure.
 */
class Hub_GSCT2026_PDF_Str {
	/**
	 * Raw bytes.
	 *
	 * @var string
	 */
	public $b;

	/**
	 * Constructor.
	 *
	 * @param string $b Raw bytes.
	 */
	public function __construct( $b ) {
		$this->b = $b;
	}
}

/**
 * Extracts plain text from a PDF file.
 */
class Hub_GSCT2026_PDF_Text {

	const MAX_FILE_BYTES = 52428800; // 50 MB.
	const MAX_TEXT_CHARS = 600000;

	/**
	 * Raw file contents.
	 *
	 * @var string
	 */
	private $data = '';

	/**
	 * Parsed objects: id => array( 'v' => value, 'stream' => raw|null ).
	 *
	 * @var array
	 */
	private $objs = array();

	/**
	 * Font info cache keyed by object id.
	 *
	 * @var array
	 */
	private $font_cache = array();

	/**
	 * Extract text from a PDF on disk.
	 *
	 * @param string $path Absolute path.
	 * @return string Whitespace-normalised UTF-8 text, '' if none/unreadable.
	 */
	public static function extract( $path ) {
		if ( ! is_readable( $path ) || filesize( $path ) > self::MAX_FILE_BYTES ) {
			return '';
		}

		$data = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local file.

		if ( false === $data || 0 !== strpos( ltrim( substr( $data, 0, 1024 ) ), '%PDF' ) && false === strpos( substr( $data, 0, 1024 ), '%PDF' ) ) {
			return '';
		}

		try {
			$parser       = new self();
			$parser->data = $data;

			return $parser->run();
		} catch ( \Throwable $e ) {
			return '';
		}
	}

	/**
	 * Parse the file and return its text.
	 *
	 * @return string
	 */
	private function run() {
		if ( false !== strpos( $this->data, '/Encrypt' ) ) {
			return '';
		}

		$this->scan_objects();
		$this->expand_object_streams();

		$text = '';

		foreach ( $this->page_list() as $page ) {
			$text .= ' ' . $this->page_text( $page['dict'], $page['resources'] );

			if ( strlen( $text ) > self::MAX_TEXT_CHARS * 2 ) {
				break;
			}
		}

		$text = str_replace(
			array( "\u{FB00}", "\u{FB01}", "\u{FB02}", "\u{FB03}", "\u{FB04}", "\u{00AD}" ),
			array( 'ff', 'fi', 'fl', 'ffi', 'ffl', '' ),
			$text
		);
		$text = preg_replace( '/[\x00-\x08\x0B-\x1F\x7F]+/', ' ', $text );
		$text = preg_replace( '/\s+/u', ' ', (string) $text );

		if ( ! is_string( $text ) || ! mb_check_encoding( $text, 'UTF-8' ) ) {
			return '';
		}

		return mb_substr( trim( $text ), 0, self::MAX_TEXT_CHARS );
	}

	/* ------------------------------------------------------------------
	 * Object parsing
	 * ---------------------------------------------------------------- */

	/**
	 * Find every "N G obj" in the file and parse it. Later definitions of
	 * the same object number win (incremental updates).
	 *
	 * @return void
	 */
	private function scan_objects() {
		$d = $this->data;

		if ( ! preg_match_all( '/(?<![0-9])(\d{1,8})\s+\d{1,5}\s+obj\b/', $d, $m, PREG_OFFSET_CAPTURE ) ) {
			return;
		}

		foreach ( $m[0] as $k => $hit ) {
			$id = (int) $m[1][ $k ][0];
			$i  = $hit[1] + strlen( $hit[0] );
			$v  = self::val( $d, $i, true );

			$stream = null;

			if ( is_object( $v ) && preg_match( '/\G\s*stream\r?\n?/', $d, $sm, 0, $i ) ) {
				$start = $i + strlen( $sm[0] );
				$end   = strpos( $d, 'endstream', $start );

				if ( false !== $end ) {
					$stream = rtrim( substr( $d, $start, $end - $start ), "\r\n" );
				}
			}

			$this->objs[ $id ] = array(
				'v'      => $v,
				'stream' => $stream,
			);
		}
	}

	/**
	 * Unpack compressed object streams (PDF 1.5+) into the object table.
	 *
	 * @return void
	 */
	private function expand_object_streams() {
		foreach ( $this->objs as $id => $o ) {
			if ( ! is_object( $o['v'] ) || ! isset( $o['v']->Type ) || '/ObjStm' !== $o['v']->Type || null === $o['stream'] ) {
				continue;
			}

			$body = $this->decode_stream( $o['v'], $o['stream'] );
			$n    = (int) $this->res( $o['v']->N ?? 0 );
			$off  = (int) $this->res( $o['v']->First ?? 0 );

			if ( '' === $body || $n < 1 ) {
				continue;
			}

			$head = array();
			$hi   = 0;

			for ( $k = 0; $k < $n * 2; $k++ ) {
				$t = self::val( $body, $hi, false );

				if ( ! is_int( $t ) ) {
					break;
				}

				$head[] = $t;
			}

			for ( $k = 0; $k + 1 < count( $head ); $k += 2 ) {
				$pos = $off + $head[ $k + 1 ];
				$v   = self::val( $body, $pos, true );

				if ( ! isset( $this->objs[ $head[ $k ] ] ) || null === $this->objs[ $head[ $k ] ]['stream'] ) {
					$this->objs[ $head[ $k ] ] = array(
						'v'      => $v,
						'stream' => null,
					);
				}
			}
		}
	}

	/**
	 * Skip whitespace and comments.
	 *
	 * @param string $s Buffer.
	 * @param int    $i Offset (by reference).
	 * @return void
	 */
	private static function ws( $s, &$i ) {
		$n = strlen( $s );

		while ( $i < $n ) {
			$c = $s[ $i ];

			if ( ' ' === $c || "\n" === $c || "\r" === $c || "\t" === $c || "\f" === $c || "\0" === $c ) {
				++$i;
			} elseif ( '%' === $c ) {
				$i += strcspn( $s, "\r\n", $i );
			} else {
				break;
			}
		}
	}

	/**
	 * Parse one PDF value (or content-stream token) at an offset.
	 *
	 * Returns: stdClass for dictionaries, array for arrays, '/Name' for
	 * names, Hub_GSCT2026_PDF_Str for strings, Hub_GSCT2026_PDF_Ref for
	 * references, int/float for numbers, plain string for keywords and
	 * operators, null at end of buffer.
	 *
	 * @param string $s    Buffer.
	 * @param int    $i    Offset (by reference).
	 * @param bool   $refs Whether "N G R" should be read as a reference.
	 * @return mixed
	 */
	private static function val( $s, &$i, $refs ) {
		self::ws( $s, $i );
		$n = strlen( $s );

		if ( $i >= $n ) {
			return null;
		}

		$c = $s[ $i ];

		if ( '<' === $c ) {
			if ( '<' === ( $s[ $i + 1 ] ?? '' ) ) {
				$i += 2;
				$o  = new stdClass();

				while ( true ) {
					self::ws( $s, $i );

					if ( $i >= $n ) {
						break;
					}

					if ( '>>' === substr( $s, $i, 2 ) ) {
						$i += 2;
						break;
					}

					$k = self::val( $s, $i, $refs );

					if ( null === $k ) {
						break;
					}

					if ( ! is_string( $k ) || '' === $k || '/' !== $k[0] ) {
						continue;
					}

					$o->{substr( $k, 1 )} = self::val( $s, $i, $refs );
				}

				return $o;
			}

			$e = strpos( $s, '>', $i );

			if ( false === $e ) {
				$e = $n;
			}

			$hex = preg_replace( '/[^0-9A-Fa-f]/', '', substr( $s, $i + 1, $e - $i - 1 ) );
			$i   = $e + 1;

			if ( strlen( $hex ) % 2 ) {
				$hex .= '0';
			}

			return new Hub_GSCT2026_PDF_Str( (string) hex2bin( $hex ) );
		}

		if ( '[' === $c ) {
			++$i;
			$a = array();

			while ( true ) {
				self::ws( $s, $i );

				if ( $i >= $n ) {
					break;
				}

				if ( ']' === $s[ $i ] ) {
					++$i;
					break;
				}

				$v = self::val( $s, $i, $refs );

				if ( null === $v ) {
					break;
				}

				$a[] = $v;
			}

			return $a;
		}

		if ( '/' === $c ) {
			$e    = $i + 1 + strcspn( $s, " \t\r\n\f\0()<>[]{}/%", $i + 1 );
			$name = substr( $s, $i, $e - $i );
			$i    = $e;

			if ( false !== strpos( $name, '#' ) ) {
				$name = preg_replace_callback(
					'/#([0-9A-Fa-f]{2})/',
					static function ( $m ) {
						return chr( hexdec( $m[1] ) );
					},
					$name
				);
			}

			return $name;
		}

		if ( '(' === $c ) {
			++$i;
			$depth = 1;
			$out   = '';

			while ( $i < $n ) {
				$run = strcspn( $s, '\\()', $i );

				if ( $run ) {
					$out .= substr( $s, $i, $run );
					$i   += $run;
				}

				if ( $i >= $n ) {
					break;
				}

				$ch = $s[ $i ];

				if ( '\\' === $ch ) {
					$nx = $s[ $i + 1 ] ?? '';
					$i += 2;

					if ( 'n' === $nx ) {
						$out .= "\n";
					} elseif ( 'r' === $nx ) {
						$out .= "\r";
					} elseif ( 't' === $nx ) {
						$out .= "\t";
					} elseif ( 'b' === $nx ) {
						$out .= "\x08";
					} elseif ( 'f' === $nx ) {
						$out .= "\f";
					} elseif ( "\r" === $nx ) {
						if ( "\n" === ( $s[ $i ] ?? '' ) ) {
							++$i;
						}
					} elseif ( "\n" === $nx ) {
						continue;
					} elseif ( '' !== $nx && ctype_digit( $nx ) && $nx <= '7' ) {
						$oct = $nx;

						for ( $q = 0; $q < 2 && $i < $n && ctype_digit( $s[ $i ] ) && $s[ $i ] <= '7'; $q++ ) {
							$oct .= $s[ $i++ ];
						}

						$out .= chr( octdec( $oct ) & 255 );
					} else {
						$out .= $nx;
					}
				} elseif ( '(' === $ch ) {
					++$depth;
					$out .= $ch;
					++$i;
				} else {
					--$depth;
					++$i;

					if ( 0 === $depth ) {
						break;
					}

					$out .= $ch;
				}
			}

			return new Hub_GSCT2026_PDF_Str( $out );
		}

		if ( false !== strpos( ')>]{}', $c ) ) {
			++$i;
			return '';
		}

		$e   = $i + strcspn( $s, " \t\r\n\f\0()<>[]{}/%", $i );
		$tok = substr( $s, $i, $e - $i );
		$i   = $e;

		if ( is_numeric( $tok ) ) {
			if ( $refs && ctype_digit( $tok ) && preg_match( '/\G\s+\d+\s+R(?![A-Za-z0-9])/', $s, $rm, 0, $i ) ) {
				// The generation number is ignored.
				$i += strlen( $rm[0] );

				return new Hub_GSCT2026_PDF_Ref( (int) $tok );
			}

			return $tok + 0;
		}

		return $tok;
	}

	/**
	 * Resolve a reference (following chains) to its parsed value.
	 *
	 * @param mixed $v Value or reference.
	 * @return mixed
	 */
	private function res( $v ) {
		$guard = 0;

		while ( $v instanceof Hub_GSCT2026_PDF_Ref && $guard++ < 10 ) {
			$v = $this->objs[ $v->id ]['v'] ?? null;
		}

		return $v;
	}

	/* ------------------------------------------------------------------
	 * Streams
	 * ---------------------------------------------------------------- */

	/**
	 * Decode a stream through its filter chain.
	 *
	 * @param stdClass $dict Stream dictionary.
	 * @param string   $raw  Raw stream bytes.
	 * @return string Decoded bytes, '' if a filter is unsupported.
	 */
	private function decode_stream( $dict, $raw ) {
		$filters = $this->res( $dict->Filter ?? array() );

		if ( ! is_array( $filters ) ) {
			$filters = '' === $filters || null === $filters ? array() : array( $filters );
		}

		foreach ( $filters as $f ) {
			$f = $this->res( $f );

			if ( '/FlateDecode' === $f || '/Fl' === $f ) {
				$out = @gzuncompress( $raw ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged -- corrupt streams are expected.

				if ( false === $out ) {
					$out = @gzinflate( substr( $raw, 2 ) ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				}

				if ( false === $out ) {
					$out = @zlib_decode( $raw ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				}

				if ( false === $out ) {
					return '';
				}

				$raw = $out;
			} elseif ( '/ASCIIHexDecode' === $f || '/AHx' === $f ) {
				$hex = preg_replace( '/[^0-9A-Fa-f]/', '', (string) strstr( $raw . '>', '>', true ) );
				$raw = (string) hex2bin( strlen( $hex ) % 2 ? $hex . '0' : $hex );
			} elseif ( '/ASCII85Decode' === $f || '/A85' === $f ) {
				$raw = $this->ascii85( $raw );
			} else {
				return '';
			}
		}

		return $raw;
	}

	/**
	 * ASCII85 decoder.
	 *
	 * @param string $in Encoded data.
	 * @return string
	 */
	private function ascii85( $in ) {
		$in    = preg_replace( '/\s+/', '', $in );
		$in    = preg_replace( '/^<~/', '', $in );
		$end   = strpos( $in, '~>' );
		$in    = false === $end ? $in : substr( $in, 0, $end );
		$out   = '';
		$group = array();

		foreach ( str_split( $in ) as $ch ) {
			if ( 'z' === $ch && ! $group ) {
				$out .= "\0\0\0\0";
				continue;
			}

			$group[] = ord( $ch ) - 33;

			if ( 5 === count( $group ) ) {
				$n    = ( ( ( $group[0] * 85 + $group[1] ) * 85 + $group[2] ) * 85 + $group[3] ) * 85 + $group[4];
				$out .= pack( 'N', $n );
				$group = array();
			}
		}

		$k = count( $group );

		if ( $k > 1 ) {
			for ( $q = $k; $q < 5; $q++ ) {
				$group[] = 84;
			}

			$n    = ( ( ( $group[0] * 85 + $group[1] ) * 85 + $group[2] ) * 85 + $group[3] ) * 85 + $group[4];
			$out .= substr( pack( 'N', $n ), 0, $k - 1 );
		}

		return $out;
	}

	/* ------------------------------------------------------------------
	 * Pages and fonts
	 * ---------------------------------------------------------------- */

	/**
	 * Pages in reading order, each with its (inherited) resources.
	 *
	 * @return array[] Each: dict (stdClass), resources (mixed).
	 */
	private function page_list() {
		$catalog = null;

		foreach ( $this->objs as $o ) {
			if ( is_object( $o['v'] ) && isset( $o['v']->Type ) && '/Catalog' === $o['v']->Type ) {
				$catalog = $o['v'];
			}
		}

		$pages = array();

		if ( $catalog && isset( $catalog->Pages ) ) {
			$this->walk_pages( $catalog->Pages, null, $pages, 0 );
		}

		if ( ! $pages ) {
			ksort( $this->objs );

			foreach ( $this->objs as $o ) {
				if ( is_object( $o['v'] ) && isset( $o['v']->Type ) && '/Page' === $o['v']->Type ) {
					$pages[] = array(
						'dict'      => $o['v'],
						'resources' => $o['v']->Resources ?? null,
					);
				}
			}
		}

		return $pages;
	}

	/**
	 * Depth-first walk of the page tree.
	 *
	 * @param mixed $node      Reference or dictionary.
	 * @param mixed $inherited Resources inherited from the parent.
	 * @param array $pages     Output list (by reference).
	 * @param int   $depth     Recursion guard.
	 * @return void
	 */
	private function walk_pages( $node, $inherited, &$pages, $depth ) {
		$d = $this->res( $node );

		if ( ! is_object( $d ) || $depth > 40 || count( $pages ) > 3000 ) {
			return;
		}

		$resources = $d->Resources ?? $inherited;
		$kids      = $this->res( $d->Kids ?? null );

		if ( is_array( $kids ) ) {
			foreach ( $kids as $kid ) {
				$this->walk_pages( $kid, $resources, $pages, $depth + 1 );
			}

			return;
		}

		$pages[] = array(
			'dict'      => $d,
			'resources' => $resources,
		);
	}

	/**
	 * Text of one page.
	 *
	 * @param stdClass $page      Page dictionary.
	 * @param mixed    $resources Page resources (possibly a reference).
	 * @return string
	 */
	private function page_text( $page, $resources ) {
		$contents = $this->res( $page->Contents ?? null );

		if ( ! is_array( $contents ) ) {
			$contents = null === $contents ? array() : array( $page->Contents );
		}

		$stream = '';

		foreach ( $contents as $ref ) {
			$obj = $ref instanceof Hub_GSCT2026_PDF_Ref ? ( $this->objs[ $ref->id ] ?? null ) : null;

			if ( $obj && is_object( $obj['v'] ) && null !== $obj['stream'] ) {
				$stream .= $this->decode_stream( $obj['v'], $obj['stream'] ) . "\n";
			}
		}

		if ( '' === $stream ) {
			return '';
		}

		$res   = $this->res( $resources );
		$fonts = is_object( $res ) ? $this->res( $res->Font ?? null ) : null;

		return $this->interpret( $stream, is_object( $fonts ) ? $fonts : new stdClass() );
	}

	/**
	 * Font info (character map) for a font resource entry.
	 *
	 * @param mixed $entry Reference or dictionary from the Font resource.
	 * @return array map (code => utf8|null), bytes (int), type0 (bool).
	 */
	private function font_info( $entry ) {
		$cache_id = $entry instanceof Hub_GSCT2026_PDF_Ref ? $entry->id : null;

		if ( null !== $cache_id && isset( $this->font_cache[ $cache_id ] ) ) {
			return $this->font_cache[ $cache_id ];
		}

		$font  = $this->res( $entry );
		$info  = array(
			'map'   => null,
			'bytes' => 1,
			'type0' => false,
		);

		if ( is_object( $font ) ) {
			$info['type0'] = isset( $font->Subtype ) && '/Type0' === $font->Subtype;
			$info['bytes'] = $info['type0'] ? 2 : 1;
			$tu            = $font->ToUnicode ?? null;
			$obj           = $tu instanceof Hub_GSCT2026_PDF_Ref ? ( $this->objs[ $tu->id ] ?? null ) : null;

			if ( $obj && is_object( $obj['v'] ) && null !== $obj['stream'] ) {
				$cmap = $this->decode_stream( $obj['v'], $obj['stream'] );

				if ( '' !== $cmap ) {
					$info = $this->parse_cmap( $cmap, $info );
				}
			}
		}

		if ( null === $info['map'] && is_object( $font ) && ! $info['type0'] ) {
			$info = $this->encoding_map( $font, $info );
		}

		if ( null !== $cache_id ) {
			$this->font_cache[ $cache_id ] = $info;
		}

		return $info;
	}

	/**
	 * Build a code map for a simple font from its /Encoding dictionary
	 * (base encoding plus /Differences glyph names). Fonts with a plain
	 * named encoding are left to the Windows-1252 fallback.
	 *
	 * @param stdClass $font Font dictionary.
	 * @param array    $info Font info.
	 * @return array
	 */
	private function encoding_map( $font, $info ) {
		$enc = $this->res( $font->Encoding ?? null );

		if ( ! is_object( $enc ) ) {
			return $info;
		}

		$diff = $this->res( $enc->Differences ?? null );

		if ( ! is_array( $diff ) ) {
			return $info;
		}

		$base = $this->res( $enc->BaseEncoding ?? null );
		$map  = array();

		for ( $c = 32; $c < 256; $c++ ) {
			$map[ $c ] = '/MacRomanEncoding' === $base
				? (string) @iconv( 'MACINTOSH', 'UTF-8//IGNORE', chr( $c ) ) // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				: (string) mb_convert_encoding( chr( $c ), 'UTF-8', 'Windows-1252' );
		}

		$code = 0;

		foreach ( $diff as $item ) {
			$item = $this->res( $item );

			if ( is_int( $item ) ) {
				$code = $item;
			} elseif ( is_string( $item ) && '/' === ( $item[0] ?? '' ) ) {
				$map[ $code ] = self::glyph_to_utf8( substr( $item, 1 ) );
				++$code;
			}
		}

		$info['map'] = $map;

		return $info;
	}

	/**
	 * Adobe glyph name to UTF-8 (common Latin glyphs only).
	 *
	 * @param string $name Glyph name.
	 * @return string '' when the name is not recognised.
	 */
	private static function glyph_to_utf8( $name ) {
		static $table = null;

		if ( null === $table ) {
			$table = array();
			$pairs = 'space= |exclam=!|quotedbl="|numbersign=#|dollar=$|percent=%|ampersand=&|quotesingle=\'|parenleft=(|parenright=)|asterisk=*|plus=+|comma=,|hyphen=-|minus=−|period=.|slash=/|colon=:|semicolon=;|less=<|equal==|greater=>|question=?|at=@|bracketleft=[|backslash=\\|bracketright=]|asciicircum=^|underscore=_|grave=`|braceleft={|braceright=}|asciitilde=~|bullet=•|endash=–|emdash=—|quoteleft=‘|quoteright=’|quotedblleft=“|quotedblright=”|quotesinglbase=‚|quotedblbase=„|sterling=£|Euro=€|copyright=©|registered=®|trademark=™|degree=°|fi=fi|fl=fl|ff=ff|ffi=ffi|ffl=ffl|nbspace= |nonbreakingspace= |periodcentered=·|section=§|multiply=×|divide=÷|plusminus=±|onehalf=½|onequarter=¼|threequarters=¾|ellipsis=…|guillemotleft=«|guillemotright=»|exclamdown=¡|questiondown=¿|cent=¢|yen=¥|dagger=†|daggerdbl=‡|perthousand=‰|paragraph=¶|germandbls=ß|AE=Æ|ae=æ|OE=Œ|oe=œ|Oslash=Ø|oslash=ø|Aring=Å|aring=å|Ccedilla=Ç|ccedilla=ç|Ntilde=Ñ|ntilde=ñ|Aacute=Á|aacute=á|Agrave=À|agrave=à|Acircumflex=Â|acircumflex=â|Atilde=Ã|atilde=ã|Adieresis=Ä|adieresis=ä|Eacute=É|eacute=é|Egrave=È|egrave=è|Ecircumflex=Ê|ecircumflex=ê|Edieresis=Ë|edieresis=ë|Iacute=Í|iacute=í|Igrave=Ì|igrave=ì|Icircumflex=Î|icircumflex=î|Idieresis=Ï|idieresis=ï|Oacute=Ó|oacute=ó|Ograve=Ò|ograve=ò|Ocircumflex=Ô|ocircumflex=ô|Otilde=Õ|otilde=õ|Odieresis=Ö|odieresis=ö|Uacute=Ú|uacute=ú|Ugrave=Ù|ugrave=ù|Ucircumflex=Û|ucircumflex=û|Udieresis=Ü|udieresis=ü|Yacute=Ý|yacute=ý|ydieresis=ÿ|zero=0|one=1|two=2|three=3|four=4|five=5|six=6|seven=7|eight=8|nine=9';

			foreach ( explode( '|', $pairs ) as $pair ) {
				$eq = strpos( $pair, '=', 1 );

				if ( false !== $eq ) {
					$table[ substr( $pair, 0, $eq ) ] = substr( $pair, $eq + 1 );
				}
			}

			$table['bar'] = '|';
		}

		if ( 1 === strlen( $name ) && ctype_alpha( $name ) ) {
			return $name;
		}

		if ( isset( $table[ $name ] ) ) {
			return $table[ $name ];
		}

		if ( preg_match( '/^uni([0-9A-Fa-f]{4})$/', $name, $m ) || preg_match( '/^u([0-9A-Fa-f]{4,6})$/', $name, $m ) ) {
			return (string) mb_chr( hexdec( $m[1] ), 'UTF-8' );
		}

		return '';
	}

	/**
	 * Parse a ToUnicode CMap.
	 *
	 * @param string $cmap CMap program.
	 * @param array  $info Font info to extend.
	 * @return array
	 */
	private function parse_cmap( $cmap, $info ) {
		$map = array();

		if ( $info['type0'] && preg_match( '/begincodespacerange\s*<([0-9A-Fa-f]+)>/', $cmap, $cs ) ) {
			$info['bytes'] = max( 1, min( 4, (int) ( strlen( $cs[1] ) / 2 ) ) );
		}

		if ( preg_match_all( '/beginbfchar(.*?)endbfchar/s', $cmap, $blocks ) ) {
			foreach ( $blocks[1] as $block ) {
				if ( preg_match_all( '/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/', $block, $pairs, PREG_SET_ORDER ) ) {
					foreach ( $pairs as $p ) {
						$map[ hexdec( $p[1] ) ] = self::utf16_hex( $p[2] );
					}
				}
			}
		}

		if ( preg_match_all( '/beginbfrange(.*?)endbfrange/s', $cmap, $blocks ) ) {
			foreach ( $blocks[1] as $block ) {
				if ( ! preg_match_all( '/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<[0-9A-Fa-f]*>|\[[^\]]*\])/', $block, $ranges, PREG_SET_ORDER ) ) {
					continue;
				}

				foreach ( $ranges as $r ) {
					$lo = hexdec( $r[1] );
					$hi = min( hexdec( $r[2] ), $lo + 65535 );

					if ( '[' === $r[3][0] ) {
						preg_match_all( '/<([0-9A-Fa-f]*)>/', $r[3], $dst );

						foreach ( $dst[1] as $off => $hex ) {
							$map[ $lo + $off ] = self::utf16_hex( $hex );
						}

						continue;
					}

					$base = trim( $r[3], '<>' );

					for ( $c = $lo; $c <= $hi; $c++ ) {
						$map[ $c ] = self::utf16_hex( self::hex_add( $base, $c - $lo ) );
					}
				}
			}
		}

		$info['map'] = $map;

		return $info;
	}

	/**
	 * Add an offset to the last UTF-16 unit of a hex string.
	 *
	 * @param string $hex    Hex string.
	 * @param int    $offset Offset.
	 * @return string
	 */
	private static function hex_add( $hex, $offset ) {
		if ( 0 === $offset || strlen( $hex ) < 4 ) {
			return $hex;
		}

		$head = substr( $hex, 0, -4 );
		$last = ( hexdec( substr( $hex, -4 ) ) + $offset ) & 0xFFFF;

		return $head . sprintf( '%04X', $last );
	}

	/**
	 * UTF-16BE hex to UTF-8.
	 *
	 * @param string $hex Hex string.
	 * @return string
	 */
	private static function utf16_hex( $hex ) {
		if ( '' === $hex ) {
			return '';
		}

		if ( strlen( $hex ) <= 2 ) {
			return chr( hexdec( $hex ) );
		}

		$bin = hex2bin( strlen( $hex ) % 2 ? $hex . '0' : $hex );

		return false === $bin ? '' : (string) mb_convert_encoding( $bin, 'UTF-8', 'UTF-16BE' );
	}

	/**
	 * Decode a shown string to UTF-8 through the active font.
	 *
	 * @param string $b    Raw string bytes.
	 * @param array  $info Font info.
	 * @return string
	 */
	private function decode_text( $b, $info ) {
		if ( null !== $info['map'] ) {
			$n   = $info['bytes'];
			$len = strlen( $b );
			$out = '';

			for ( $k = 0; $k + $n <= $len; $k += $n ) {
				if ( 1 === $n ) {
					$code = ord( $b[ $k ] );
				} elseif ( 2 === $n ) {
					$code = ( ord( $b[ $k ] ) << 8 ) | ord( $b[ $k + 1 ] );
				} else {
					$code = hexdec( bin2hex( substr( $b, $k, $n ) ) );
				}

				if ( isset( $info['map'][ $code ] ) ) {
					$out .= $info['map'][ $code ];
				} elseif ( 1 === $n && $code >= 32 && $code < 127 ) {
					$out .= chr( $code );
				}
			}

			return $out;
		}

		if ( $info['type0'] ) {
			return '';
		}

		return (string) mb_convert_encoding( $b, 'UTF-8', 'Windows-1252' );
	}

	/* ------------------------------------------------------------------
	 * Content stream interpreter
	 * ---------------------------------------------------------------- */

	/**
	 * Run the text operators in a content stream.
	 *
	 * @param string   $s     Decoded content stream.
	 * @param stdClass $fonts Font resource dictionary.
	 * @return string
	 */
	private function interpret( $s, $fonts ) {
		$i     = 0;
		$n     = strlen( $s );
		$stack = array();
		$out   = '';
		$info  = array(
			'map'   => null,
			'bytes' => 1,
			'type0' => false,
		);

		while ( $i < $n ) {
			$tok = self::val( $s, $i, false );

			if ( null === $tok ) {
				break;
			}

			// Operands: anything that is not a bare operator keyword.
			if ( ! is_string( $tok ) || '' === $tok || '/' === $tok[0] ) {
				$stack[] = $tok;

				if ( count( $stack ) > 64 ) {
					array_shift( $stack );
				}

				continue;
			}

			switch ( $tok ) {
				case 'BI':
					if ( preg_match( '/\sEI(?=[\s\x00])/', $s, $em, PREG_OFFSET_CAPTURE, $i ) ) {
						$i = $em[0][1] + 3;
					} else {
						$i = $n;
					}
					break;

				case 'Tf':
					$name = $stack[ count( $stack ) - 2 ] ?? '';

					if ( is_string( $name ) && '/' === ( $name[0] ?? '' ) ) {
						$key = substr( $name, 1 );
						$info = isset( $fonts->$key ) ? $this->font_info( $fonts->$key ) : $info;
					}
					break;

				case 'Tj':
					$str = end( $stack );

					if ( $str instanceof Hub_GSCT2026_PDF_Str ) {
						$out .= $this->decode_text( $str->b, $info );
					}
					break;

				case "'":
				case '"':
					$str = end( $stack );
					$out .= ' ';

					if ( $str instanceof Hub_GSCT2026_PDF_Str ) {
						$out .= $this->decode_text( $str->b, $info );
					}
					break;

				case 'TJ':
					$arr = end( $stack );

					if ( is_array( $arr ) ) {
						foreach ( $arr as $el ) {
							if ( $el instanceof Hub_GSCT2026_PDF_Str ) {
								$out .= $this->decode_text( $el->b, $info );
							} elseif ( is_numeric( $el ) && $el < -180 ) {
								$out .= ' ';
							}
						}
					}
					break;

				// A move to a new text position separates words and lines.
				case 'Td':
				case 'TD':
				case 'Tm':
				case 'T*':
				case 'ET':
					$out .= ' ';
					break;
			}

			if ( 'BI' !== $tok ) {
				$stack = array();
			}
		}

		return $out;
	}
}
