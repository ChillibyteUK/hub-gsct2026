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
