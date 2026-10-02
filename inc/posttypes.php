<?php
/**
 * Custom Post Types Registration
 *
 * Duplicate one of the register_post_type() calls below (commented out) as
 * a starting point for a new post type — nothing is registered by default.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register custom post types for the theme.
 *
 * @return void
 */
function hub_gsct2026_register_post_types() {

	register_post_type(
		'person',
		array(
			'labels'          => array(
				'name'               => 'People',
				'singular_name'      => 'Person',
				'add_new_item'       => 'Add New Person',
				'edit_item'          => 'Edit Person',
				'new_item'           => 'New Person',
				'view_item'          => 'View Person',
				'search_items'       => 'Search People',
				'not_found'          => 'No people found',
				'not_found_in_trash' => 'No people in trash',
			),
			'has_archive'     => false,
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'show_in_rest'    => true,
			'menu_position'   => 26,
			'menu_icon'       => 'dashicons-groups',
			'supports'        => array( 'title', 'editor', 'thumbnail', 'custom-fields' ),
			'capability_type' => 'post',
			'map_meta_cap'    => true,
			'rewrite'         => false,
		)
	);

	register_post_meta(
		'person',
		'role',
		array(
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => 'string',
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	// Person-as-author fields + people-cards visibility. Edited through the
	// Person Details document sidebar (blocks/_person-panel), which is the
	// only UI for this postmeta — see its header comment.
	register_post_meta(
		'person',
		'show_in_people_cards',
		array(
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => 'boolean',
			'default'       => false,
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	register_post_meta(
		'person',
		'author_thumbnail',
		array(
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => 'integer',
			'default'       => 0,
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	register_post_meta(
		'person',
		'author_bio',
		array(
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => 'string',
			'default'       => '',
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	// Attributed author for regular posts — a person post ID (0 = none).
	// Edited through the Post Author document sidebar
	// (blocks/_post-author-panel); rendered at the bottom of single.php.
	register_post_meta(
		'post',
		'author_person_id',
		array(
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => 'integer',
			'default'       => 0,
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	// Document library entries — title is the post title, everything else
	// is postmeta/taxonomy below. Not publicly queryable and no archive:
	// documents are only ever consumed through the document library block,
	// same stance as the person CPT above (and aberforth's document CPT,
	// which is likewise UI-only).
	register_post_type(
		'document',
		array(
			'labels'          => array(
				'name'               => 'Documents',
				'singular_name'      => 'Document',
				'add_new_item'       => 'Add New Document',
				'edit_item'          => 'Edit Document',
				'new_item'           => 'New Document',
				'view_item'          => 'View Document',
				'search_items'       => 'Search Documents',
				'not_found'          => 'No documents found',
				'not_found_in_trash' => 'No documents in trash',
			),
			'has_archive'     => false,
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'show_in_rest'    => true,
			'menu_position'   => 27,
			'menu_icon'       => 'dashicons-media-document',
			// No 'editor' support on purpose: documents are edited on the
			// classic screen (title + Document Details box + Categories),
			// never in Gutenberg.
			'supports'        => array( 'title', 'custom-fields' ),
			'capability_type' => 'post',
			'map_meta_cap'    => true,
			'rewrite'         => false,
		)
	);

	// Uploaded file for a document — an attachment ID (0 = none). Edited
	// through the Document Details document sidebar
	// (blocks/_document-panel); type and size are derived from the file
	// itself at render time, never stored.
	register_post_meta(
		'document',
		'document_file',
		array(
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => 'integer',
			'default'       => 0,
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	// Manual release date for a document — free text in UK format
	// (e.g. "15 Jan 2026"), deliberately not the post date, so backdated
	// filings keep their real-world date. Same sidebar as above.
	register_post_meta(
		'document',
		'release_date',
		array(
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => 'string',
			'default'       => '',
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	// External URL fallback for a document — used only when no file is
	// attached (e.g. documents hosted elsewhere, like the Kepler report).
	// Same sidebar as above. Frontend prefers the file when both exist.
	register_post_meta(
		'document',
		'document_url',
		array(
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => 'string',
			'default'       => '',
			'auth_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}
add_action( 'init', 'hub_gsct2026_register_post_types' );

/**
 * Register taxonomies for the theme's custom post types.
 *
 * @return void
 */
function hub_gsct2026_register_taxonomies() {

	// Document categories — hierarchical (category-style checkboxes in the
	// editor, no custom UI needed), one taxonomy only. Aberforth's library
	// has two (doccat + doctype); this one deliberately doesn't.
	register_taxonomy(
		'doc_category',
		'document',
		array(
			'labels'            => array(
				'name'              => 'Document Categories',
				'singular_name'     => 'Document Category',
				'search_items'      => 'Search Document Categories',
				'all_items'         => 'All Document Categories',
				'edit_item'         => 'Edit Document Category',
				'update_item'       => 'Update Document Category',
				'add_new_item'      => 'Add New Document Category',
				'new_item_name'     => 'New Document Category Name',
				'menu_name'         => 'Categories',
			),
			'hierarchical'      => true,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'rewrite'           => false,
		)
	);
}
add_action( 'init', 'hub_gsct2026_register_taxonomies' );

/**
 * Remove the classic "Custom Fields" meta box from the Person edit screen.
 *
 * 'custom-fields' support is kept in register_post_type() above because
 * WordPress requires it for a custom post type's REST schema to expose the
 * `meta` field at all (see WP_REST_Posts_Controller::get_item_schema()) —
 * the Person Details sidebar panel (blocks/_person-panel) depends on that.
 * But the same support flag also registers the legacy postcustom meta box,
 * which the block editor still submits as a compatibility form field
 * alongside its REST save; that stale, page-load snapshot of postmeta then
 * overwrites the REST save moments later, wiping out fields like `role`
 * immediately after saving. Removing just the meta box (not the support
 * flag) keeps REST meta working while eliminating that duplicate save path.
 *
 * @return void
 */
function hub_gsct2026_remove_person_custom_fields_metabox() {
	remove_meta_box( 'postcustom', 'person', 'normal' );
}
add_action( 'add_meta_boxes_person', 'hub_gsct2026_remove_person_custom_fields_metabox' );

/**
 * Same deal as above, for the Document edit screen — the Document Details
 * sidebar panel (blocks/_document-panel) is the only UI for document_file
 * / release_date, so the legacy postcustom box would only race it.
 *
 * @return void
 */
function hub_gsct2026_remove_document_custom_fields_metabox() {
	remove_meta_box( 'postcustom', 'document', 'normal' );
}
add_action( 'add_meta_boxes_document', 'hub_gsct2026_remove_document_custom_fields_metabox' );

/**
 * Classic "Document Details" meta box for the document edit screen —
 * file picker plus external URL plus release date. Documents are edited
 * classically (no Gutenberg), so this is a plain meta box and a small
 * wp.media script, not a sidebar panel.
 *
 * @return void
 */
function hub_gsct2026_add_document_details_metabox() {
	add_meta_box(
		'hub-document-details',
		'Document Details',
		'hub_gsct2026_render_document_details_metabox',
		'document',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes_document', 'hub_gsct2026_add_document_details_metabox' );

/**
 * Render the Document Details meta box.
 *
 * @param WP_Post $post Current post object.
 * @return void
 */
function hub_gsct2026_render_document_details_metabox( $post ) {
	wp_nonce_field( 'hub_document_details', 'hub_document_details_nonce' );

	$file_id = (int) get_post_meta( $post->ID, 'document_file', true );
	$file_path = $file_id ? get_attached_file( $file_id ) : '';
	$file_name = $file_path ? basename( $file_path ) : '';
	$url       = get_post_meta( $post->ID, 'document_url', true );
	$date      = get_post_meta( $post->ID, 'release_date', true );
	?>
	<p>
		<strong>File</strong><br>
		<span id="hub-doc-file-name"><?= $file_name ? esc_html( $file_name ) : 'No file selected.'; ?></span>
	</p>
	<p>
		<input type="hidden" id="hub_document_file" name="hub_document_file" value="<?= esc_attr( $file_id ); ?>">
		<button type="button" class="button" id="hub-doc-select-file">Select file</button>
		<button type="button" class="button" id="hub-doc-remove-file"<?= $file_id ? '' : ' style="display:none;"'; ?>>Remove</button>
	</p>
	<p>
		<label for="hub_document_url"><strong>External URL</strong></label><br>
		<input type="url" id="hub_document_url" name="hub_document_url" value="<?= esc_attr( $url ); ?>" class="widefat">
		<br><span class="description">Used only when no file is attached — e.g. a document hosted elsewhere.</span>
	</p>
	<p>
		<label for="hub_release_date"><strong>Release date</strong></label><br>
		<input type="text" id="hub_release_date" name="hub_release_date" value="<?= esc_attr( $date ); ?>" class="widefat">
		<br><span class="description">UK format — e.g. 15 Jan 2026.</span>
	</p>
	<?php
}

/**
 * Save the Document Details meta box.
 *
 * @param int $post_id Post ID.
 * @return void
 */
function hub_gsct2026_save_document_details( $post_id ) {
	if ( 'document' !== get_post_type( $post_id ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( wp_is_post_revision( $post_id ) ) {
		return;
	}

	if ( ! isset( $_POST['hub_document_details_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['hub_document_details_nonce'] ), 'hub_document_details' ) ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$file_id = isset( $_POST['hub_document_file'] ) ? absint( $_POST['hub_document_file'] ) : 0;

	if ( $file_id ) {
		update_post_meta( $post_id, 'document_file', $file_id );
	} else {
		delete_post_meta( $post_id, 'document_file' );
	}

	$url = isset( $_POST['hub_document_url'] ) ? esc_url_raw( wp_unslash( $_POST['hub_document_url'] ) ) : '';

	if ( '' !== $url ) {
		update_post_meta( $post_id, 'document_url', $url );
	} else {
		delete_post_meta( $post_id, 'document_url' );
	}

	$date = isset( $_POST['hub_release_date'] ) ? sanitize_text_field( wp_unslash( $_POST['hub_release_date'] ) ) : '';

	if ( '' !== $date ) {
		update_post_meta( $post_id, 'release_date', $date );
	} else {
		delete_post_meta( $post_id, 'release_date' );
	}
}
add_action( 'save_post', 'hub_gsct2026_save_document_details' );

/**
 * Enqueue wp.media plus the file-picker script on the document edit
 * screen only.
 *
 * @param string $hook Current admin page hook.
 * @return void
 */
function hub_gsct2026_enqueue_document_admin_fields( $hook ) {
	if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}

	$screen = get_current_screen();

	if ( ! $screen || 'document' !== $screen->post_type ) {
		return;
	}

	wp_enqueue_media();

	$rel = '/js/admin-document-fields.js';
	$abs = get_template_directory() . $rel;

	if ( file_exists( $abs ) ) {
		wp_enqueue_script( 'hub-document-fields', get_template_directory_uri() . $rel, array(), filemtime( $abs ), true );
	}
}
add_action( 'admin_enqueue_scripts', 'hub_gsct2026_enqueue_document_admin_fields' );




/**
 * Replace the default WP-user Author column on the post list with the
 * attributed person author (author_person_id meta), in the same position.
 *
 * @param string[] $columns List-table columns.
 * @return string[]
 */
function hub_gsct2026_post_author_columns( $columns ) {
	$new      = array();
	$replaced = false;

	foreach ( $columns as $key => $label ) {
		if ( 'author' === $key ) {
			$new['author_person'] = __( 'Author', 'hub-gsct2026' );
			$replaced             = true;
			continue;
		}

		$new[ $key ] = $label;
	}

	if ( ! $replaced ) {
		$new['author_person'] = __( 'Author', 'hub-gsct2026' );
	}

	return $new;
}
add_filter( 'manage_post_posts_columns', 'hub_gsct2026_post_author_columns' );

/**
 * Render the attributed person author cell on the post list.
 *
 * @param string $column  Column slug.
 * @param int    $post_id Post ID.
 * @return void
 */
function hub_gsct2026_post_author_column_content( $column, $post_id ) {
	if ( 'author_person' !== $column ) {
		return;
	}

	$author_id = (int) get_post_meta( $post_id, 'author_person_id', true );
	$author    = $author_id ? get_post( $author_id ) : null;

	if ( $author && 'person' === $author->post_type ) {
		echo esc_html( get_the_title( $author ) );
		return;
	}

	echo '<span aria-hidden="true">&mdash;</span>';
}
add_action( 'manage_post_posts_custom_column', 'hub_gsct2026_post_author_column_content', 10, 2 );

/**
 * Serve page.php for singular views of any custom post type that has no
 * single-{post_type}.php of its own, instead of falling back to the
 * generic single.php. CPT content in this theme is built from the same
 * blocks as pages — single.php's auto-printed <h1>/date and
 * .container/<article> wrapper are built for classic blog posts, not
 * block-built layouts, and would clash with a block's own heading (e.g.
 * CB Hero).
 *
 * Only steps in when WordPress's own template hierarchy has already fallen
 * through to the generic single.php ($template's basename) — a project can
 * still add single-{post_type}.php for a CPT that genuinely needs its own
 * markup and this filter won't touch it. Regular WP posts are untouched
 * too (is_singular( 'post' ) is excluded), so blog posts keep using
 * single.php as normal.
 *
 * @param string $template Template path WordPress would otherwise use.
 * @return string
 */
function hub_gsct2026_use_page_template_for_cpts( $template ) {
	if ( is_singular() && ! is_page() && ! is_singular( 'post' ) && 'single.php' === basename( $template ) ) {
		$page_template = get_query_template( 'page' );

		if ( $page_template ) {
			return $page_template;
		}
	}

	return $template;
}
add_filter( 'template_include', 'hub_gsct2026_use_page_template_for_cpts' );
