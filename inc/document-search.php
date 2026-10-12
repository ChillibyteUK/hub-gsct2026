<?php
/**
 * Document library full-text search.
 *
 * Extracts the text of each document's attached file when it is saved
 * (PDFs through inc/pdf-text.php, HTML/text files directly), stores it in
 * hidden postmeta, and exposes a small REST endpoint the HUB Document
 * Library block calls as the visitor types. Nothing here depends on a
 * plugin, a library or a server binary.
 *
 *   GET /wp-json/hub/v1/doc-search?q=dividend+policy
 *   -> { "hits": { "<document id>": "…snippet…", … } }
 *
 * Re-index everything with: wp hub documents-index [--force]
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

require_once HUB_GSCT2026_DIR . '/inc/pdf-text.php';

const HUB_GSCT2026_DOC_TEXT_META  = '_document_text';
const HUB_GSCT2026_DOC_STATE_META = '_document_text_state';
const HUB_GSCT2026_DOC_FLAT_META  = '_document_text_nospace';

/**
 * Remove whole elements (tags and contents) from HTML. Plain string
 * searching rather than a regex: converted-PDF pages embed multi-megabyte
 * style blocks that exhaust PCRE's backtrack limit.
 *
 * @param string   $html HTML.
 * @param string[] $tags Lower-case tag names.
 * @return string
 */
function hub_gsct2026_strip_html_blocks( $html, $tags ) {
	foreach ( $tags as $tag ) {
		$offset = 0;

		while ( false !== ( $start = stripos( $html, '<' . $tag, $offset ) ) ) { // phpcs:ignore WordPress.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition
			$end = stripos( $html, '</' . $tag, $start );

			if ( false === $end ) {
				$offset = $start + 1;
				continue;
			}

			$close = strpos( $html, '>', $end );
			$html  = substr( $html, 0, $start ) . ' ' . substr( $html, false === $close ? $end : $close + 1 );
			$offset = $start;
		}
	}

	return $html;
}

/**
 * Extract searchable text from an attachment.
 *
 * @param int $attachment_id Attachment ID.
 * @return string Plain text, '' when none can be read.
 */
function hub_gsct2026_extract_attachment_text( $attachment_id ) {
	$path = get_attached_file( $attachment_id );

	if ( ! $path || ! is_readable( $path ) ) {
		return '';
	}

	$ext = strtolower( pathinfo( $path, PATHINFO_EXTENSION ) );

	if ( 'pdf' === $ext ) {
		return Hub_GSCT2026_PDF_Text::extract( $path );
	}

	if ( ! in_array( $ext, array( 'html', 'htm', 'xhtml', 'txt' ), true ) || filesize( $path ) > 30 * MB_IN_BYTES ) {
		return '';
	}

	$raw = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local file.

	if ( false === $raw ) {
		return '';
	}

	if ( 'txt' !== $ext ) {
		$raw = hub_gsct2026_strip_html_blocks( $raw, array( 'style', 'script' ) );
		$raw = html_entity_decode( strip_tags( $raw ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	if ( ! mb_check_encoding( $raw, 'UTF-8' ) ) {
		$raw = mb_convert_encoding( $raw, 'UTF-8', 'Windows-1252' );
	}

	return mb_substr( trim( (string) preg_replace( '/\s+/u', ' ', $raw ) ), 0, Hub_GSCT2026_PDF_Text::MAX_TEXT_CHARS );
}

/**
 * (Re)build the searchable text for one document from its attached file.
 *
 * @param int $post_id Document post ID.
 * @return string State: 'ok', 'empty' (file has no readable text) or 'none' (no file).
 */
function hub_gsct2026_index_document( $post_id ) {
	$file_id = (int) get_post_meta( $post_id, 'document_file', true );

	delete_post_meta( $post_id, HUB_GSCT2026_DOC_TEXT_META );
	delete_post_meta( $post_id, HUB_GSCT2026_DOC_FLAT_META );

	if ( ! $file_id ) {
		delete_post_meta( $post_id, HUB_GSCT2026_DOC_STATE_META );
		update_option( 'hub_gsct2026_doc_index_ver', time(), false );

		return 'none';
	}

	$text  = hub_gsct2026_extract_attachment_text( $file_id );
	$state = 'ok';

	if ( mb_strlen( $text ) < 20 ) {
		$state = 'empty';
	} else {
		update_post_meta( $post_id, HUB_GSCT2026_DOC_TEXT_META, wp_slash( $text ) );

		// Some files (converted PDFs, small-caps fonts) come out letter-spaced
		// — "Gl o b a l Small er" — so whole words never match. For those, also
		// keep a copy with the spaces removed to search as a fallback.
		$sample = preg_split( '/\s+/u', mb_substr( $text, 0, 20000 ), -1, PREG_SPLIT_NO_EMPTY );
		$single = count(
			array_filter(
				$sample,
				static function ( $token ) {
					return 1 === mb_strlen( $token ) && preg_match( '/\pL/u', $token );
				}
			)
		);

		if ( $sample && $single / count( $sample ) > 0.15 ) {
			update_post_meta( $post_id, HUB_GSCT2026_DOC_FLAT_META, wp_slash( mb_strtolower( preg_replace( '/\s+/u', '', $text ) ) ) );
		}
	}

	update_post_meta( $post_id, HUB_GSCT2026_DOC_STATE_META, $state );
	update_option( 'hub_gsct2026_doc_index_ver', time(), false );

	return $state;
}

/**
 * Re-index when a document's file is attached, swapped or removed.
 *
 * @param int|int[] $meta_ids Meta ID(s) (unused).
 * @param int       $post_id  Post ID.
 * @param string    $meta_key Meta key.
 * @return void
 */
function hub_gsct2026_reindex_on_file_change( $meta_ids, $post_id, $meta_key ) {
	if ( 'document_file' === $meta_key && 'document' === get_post_type( $post_id ) ) {
		hub_gsct2026_index_document( (int) $post_id );
	}
}
add_action( 'added_post_meta', 'hub_gsct2026_reindex_on_file_change', 10, 3 );
add_action( 'updated_post_meta', 'hub_gsct2026_reindex_on_file_change', 10, 3 );
add_action( 'deleted_post_meta', 'hub_gsct2026_reindex_on_file_change', 10, 3 );

/**
 * One-line index status for the Document Details meta box.
 *
 * @param int $post_id Document post ID.
 * @return string Escaped HTML.
 */
function hub_gsct2026_document_text_status( $post_id ) {
	$state = get_post_meta( $post_id, HUB_GSCT2026_DOC_STATE_META, true );

	if ( 'ok' === $state ) {
		$len = mb_strlen( (string) get_post_meta( $post_id, HUB_GSCT2026_DOC_TEXT_META, true ) );

		/* translators: %s: number of characters. */
		return esc_html( sprintf( 'Searchable: %s characters of text read from the file.', number_format_i18n( $len ) ) );
	}

	if ( 'empty' === $state ) {
		return esc_html( 'Not searchable: no readable text found in the file (a scanned document, for example). It can still be found by title.' );
	}

	return esc_html( 'Not indexed yet. Save the document to index its file.' );
}

/**
 * Index any documents that have a file but no index state yet, a few per
 * visit to the Documents list — backfills existing content without WP-CLI.
 *
 * @return void
 */
function hub_gsct2026_index_missing_documents() {
	$ids = get_posts(
		array(
			'post_type'      => 'document',
			'post_status'    => 'any',
			'posts_per_page' => 5,
			'fields'         => 'ids',
			'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- tiny admin-only backfill.
				'relation' => 'AND',
				array(
					'key'     => 'document_file',
					'compare' => 'EXISTS',
				),
				array(
					'key'     => HUB_GSCT2026_DOC_STATE_META,
					'compare' => 'NOT EXISTS',
				),
			),
		)
	);

	foreach ( $ids as $id ) {
		hub_gsct2026_index_document( (int) $id );
	}
}
add_action(
	'load-edit.php',
	static function () {
		if ( isset( $_GET['post_type'] ) && 'document' === $_GET['post_type'] && current_user_can( 'edit_posts' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only list screen.
			hub_gsct2026_index_missing_documents();
		}
	}
);

/**
 * Document ids that have a file attached, oldest first.
 *
 * @param bool $only_unindexed Only those with no index state yet.
 * @return int[]
 */
function hub_gsct2026_documents_with_files( $only_unindexed = false ) {
	$meta_query = array(
		'relation' => 'AND',
		array(
			'key'     => 'document_file',
			'compare' => 'EXISTS',
		),
	);

	if ( $only_unindexed ) {
		$meta_query[] = array(
			'key'     => HUB_GSCT2026_DOC_STATE_META,
			'compare' => 'NOT EXISTS',
		);
	}

	return array_map(
		'intval',
		get_posts(
			array(
				'post_type'      => 'document',
				'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
				'posts_per_page' => -1,
				'orderby'        => 'ID',
				'order'          => 'ASC',
				'fields'         => 'ids',
				'meta_query'     => $meta_query, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- small admin-only tool.
			)
		)
	);
}

/**
 * Documents > Search index: build the file-text index from the admin, in
 * small AJAX batches (no WP-CLI needed).
 */
add_action(
	'admin_menu',
	static function () {
		add_submenu_page(
			'edit.php?post_type=document',
			'Document search index',
			'Search index',
			'edit_posts',
			'hub-document-index',
			'hub_gsct2026_render_index_page'
		);
	}
);

/**
 * Render the Search index admin page.
 *
 * @return void
 */
function hub_gsct2026_render_index_page() {
	$all     = hub_gsct2026_documents_with_files();
	$pending = hub_gsct2026_documents_with_files( true );
	$empty   = array();

	foreach ( $all as $id ) {
		if ( 'empty' === get_post_meta( $id, HUB_GSCT2026_DOC_STATE_META, true ) ) {
			$empty[] = $id;
		}
	}
	?>
	<div class="wrap">
		<h1>Document search index</h1>
		<p>The document library search looks inside each document's file as well as its title. That text is read when a file is attached; use this page to read it for documents that were uploaded earlier, or to re-read everything.</p>
		<p>
			<strong><?= esc_html( count( $all ) - count( $pending ) ); ?></strong> of <strong><?= esc_html( count( $all ) ); ?></strong> documents with a file are indexed.
			<?php
			if ( $empty ) {
				?>
				<?= esc_html( count( $empty ) ); ?> have no readable text (for example scanned documents) and can only be found by title.
				<?php
			}
			?>
		</p>
		<p>
			<label><input type="checkbox" id="hub-index-force"> Re-read every document, not just those not yet indexed</label>
		</p>
		<p>
			<button type="button" class="button button-primary" id="hub-index-run">Build search index</button>
			<span id="hub-index-status" style="margin-left:1em;" aria-live="polite"></span>
		</p>
		<progress id="hub-index-bar" value="0" max="1" style="width:320px;display:none;"></progress>
		<ul id="hub-index-log"></ul>
	</div>
	<script>
	( function () {
		var run = document.getElementById( 'hub-index-run' );
		var force = document.getElementById( 'hub-index-force' );
		var status = document.getElementById( 'hub-index-status' );
		var bar = document.getElementById( 'hub-index-bar' );
		var log = document.getElementById( 'hub-index-log' );
		var grand = 0;
		var url = <?= wp_json_encode( admin_url( 'admin-ajax.php' ) ); ?>;
		var nonce = <?= wp_json_encode( wp_create_nonce( 'hub_doc_index' ) ); ?>;

		function step( after, done ) {
			var body = new URLSearchParams( { action: 'hub_gsct2026_index_batch', _wpnonce: nonce, after: after, force: force.checked ? '1' : '0' } );

			fetch( url, { method: 'POST', credentials: 'same-origin', body: body } )
				.then( function ( r ) { return r.json(); } )
				.then( function ( res ) {
					if ( ! res.success ) {
						throw new Error( ( res.data && res.data.message ) || 'Request failed' );
					}

					var d = res.data;
					grand = grand || d.total;
					bar.max = grand;
					bar.value = grand - d.remaining;
					status.textContent = ( grand - d.remaining ) + ' of ' + grand + ' done';

					d.empty.forEach( function ( title ) {
						var li = document.createElement( 'li' );
						li.textContent = 'No readable text: ' + title;
						log.appendChild( li );
					} );

					if ( d.remaining > 0 ) {
						step( d.last, done );
					} else {
						done();
					}
				} )
				.catch( function ( e ) {
					status.textContent = 'Stopped: ' + e.message + ' — click the button to continue.';
					run.disabled = false;
				} );
		}

		run.addEventListener( 'click', function () {
			run.disabled = true;
			bar.style.display = '';
			log.textContent = '';
			grand = 0;
			status.textContent = 'Working…';
			step( 0, function () {
				status.textContent = 'Finished. Reload this page to see the totals.';
				run.disabled = false;
			} );
		} );
	}() );
	</script>
	<?php
}

/**
 * AJAX: index the next few documents after a given ID.
 *
 * @return void
 */
function hub_gsct2026_ajax_index_batch() {
	check_ajax_referer( 'hub_doc_index' );

	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_send_json_error( array( 'message' => 'Not allowed.' ), 403 );
	}

	if ( function_exists( 'set_time_limit' ) ) {
		@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged -- may be disabled on the host.
	}

	$after = isset( $_POST['after'] ) ? absint( $_POST['after'] ) : 0;
	$force = ! empty( $_POST['force'] );
	$ids   = array_values(
		array_filter(
			hub_gsct2026_documents_with_files( ! $force ),
			static function ( $id ) use ( $after ) {
				return $id > $after;
			}
		)
	);
	$total = count( $ids );
	$batch = array_slice( $ids, 0, 3 );
	$empty = array();
	$last  = $after;

	foreach ( $batch as $id ) {
		if ( 'empty' === hub_gsct2026_index_document( $id ) ) {
			$empty[] = get_the_title( $id );
		}

		$last = $id;
	}

	wp_send_json_success(
		array(
			'total'     => $total,
			'remaining' => $total - count( $batch ),
			'last'      => $last,
			'empty'     => $empty,
		)
	);
}
add_action( 'wp_ajax_hub_gsct2026_index_batch', 'hub_gsct2026_ajax_index_batch' );

/**
 * REST: search inside the indexed document text.
 */
add_action(
	'rest_api_init',
	static function () {
		register_rest_route(
			'hub/v1',
			'/doc-search',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'args'                => array(
					'q' => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
				'callback'            => 'hub_gsct2026_rest_doc_search',
			)
		);
	}
);

/**
 * Handle a document text search.
 *
 * All words must appear (any order). Returns a snippet around the first
 * word for each matching published document.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function hub_gsct2026_rest_doc_search( WP_REST_Request $request ) {
	global $wpdb;

	$query = mb_substr( trim( (string) $request->get_param( 'q' ) ), 0, 100 );
	$terms = array_slice(
		array_values(
			array_filter(
				preg_split( '/\s+/u', $query ),
				static function ( $t ) {
					return mb_strlen( $t ) >= 2;
				}
			)
		),
		0,
		6
	);

	if ( ! $terms || mb_strlen( $query ) < 3 ) {
		return new WP_REST_Response( array( 'hits' => (object) array() ) );
	}

	$cache_key = 'hub_docsearch_' . md5( mb_strtolower( implode( ' ', $terms ) ) . get_option( 'hub_gsct2026_doc_index_ver', 0 ) );
	$cached    = get_transient( $cache_key );

	if ( is_array( $cached ) ) {
		return new WP_REST_Response( array( 'hits' => (object) $cached ) );
	}

	$where = '';

	foreach ( $terms as $term ) {
		$like   = '%' . $wpdb->esc_like( $term ) . '%';
		$where .= $wpdb->prepare( ' AND ( pm.meta_value LIKE %s OR flat.meta_value LIKE %s )', $like, $like );
	}

	// The snippet is cut out in SQL so full document text never leaves the database.
	$rows = $wpdb->get_results(
		$wpdb->prepare(
			"SELECT pm.post_id, IF( LOCATE( %s, pm.meta_value ) > 0, SUBSTRING( pm.meta_value, GREATEST( LOCATE( %s, pm.meta_value ) - 80, 1 ), 240 ), '' ) AS snippet
			FROM {$wpdb->postmeta} pm
			INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			LEFT JOIN {$wpdb->postmeta} flat ON flat.post_id = pm.post_id AND flat.meta_key = %s
			WHERE pm.meta_key = %s AND p.post_type = 'document' AND p.post_status = 'publish'" . $where . ' LIMIT 200', // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- $where is built from prepare() calls above.
			$terms[0],
			$terms[0],
			HUB_GSCT2026_DOC_FLAT_META,
			HUB_GSCT2026_DOC_TEXT_META
		)
	);

	$hits = array();

	foreach ( (array) $rows as $row ) {
		$snippet = trim( (string) preg_replace( '/\s+/u', ' ', $row->snippet ) );

		$hits[ (int) $row->post_id ] = '' === $snippet ? '' : '…' . $snippet . '…';
	}

	set_transient( $cache_key, $hits, 10 * MINUTE_IN_SECONDS );

	return new WP_REST_Response( array( 'hits' => (object) $hits ) );
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	/**
	 * Build the searchable text index for document files.
	 *
	 * ## OPTIONS
	 *
	 * [--force]
	 * : Re-read every document, not just those not yet indexed.
	 *
	 * @param array $args       Positional args (unused).
	 * @param array $assoc_args Flags.
	 * @return void
	 */
	WP_CLI::add_command(
		'hub documents-index',
		static function ( $args, $assoc_args ) {
			$force = ! empty( $assoc_args['force'] );
			$ids   = get_posts(
				array(
					'post_type'      => 'document',
					'post_status'    => 'any',
					'posts_per_page' => -1,
					'fields'         => 'ids',
				)
			);
			$count = array(
				'ok'    => 0,
				'empty' => 0,
				'none'  => 0,
				'skip'  => 0,
			);

			foreach ( $ids as $id ) {
				if ( ! $force && get_post_meta( $id, HUB_GSCT2026_DOC_STATE_META, true ) ) {
					++$count['skip'];
					continue;
				}

				$state = hub_gsct2026_index_document( (int) $id );
				++$count[ $state ];

				if ( 'empty' === $state ) {
					WP_CLI::warning( sprintf( '#%d "%s": no readable text.', $id, get_the_title( $id ) ) );
				}
			}

			WP_CLI::success( sprintf( 'Indexed %d, no text %d, no file %d, skipped %d.', $count['ok'], $count['empty'], $count['none'], $count['skip'] ) );
		}
	);
}
