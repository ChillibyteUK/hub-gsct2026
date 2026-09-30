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
}
add_action( 'init', 'hub_gsct2026_register_post_types' );

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
