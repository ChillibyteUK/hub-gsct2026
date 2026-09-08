<?php
/**
 * Theme setup — supports, nav menus.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Core theme supports and nav menu locations.
 *
 * @return void
 */
function hub_gsct2026_setup() {
	load_theme_textdomain( 'hub-gsct2026', get_template_directory() . '/languages' );

	add_theme_support( 'title-tag' ); // Site title in <head> — no separate "site title" support needed beyond this.
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'style', 'script' ) ); // Clean markup for enqueued tags. Not search-form/comment-form/comment-list/gallery/caption — none of those are in use.
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'disable-custom-colors' );

	// Rename/extend per project.
	register_nav_menus(
		array(
			'primary' => __( 'Primary Menu', 'hub-gsct2026' ),
			'footer'  => __( 'Footer Menu', 'hub-gsct2026' ),
		)
	);
}
add_action( 'after_setup_theme', 'hub_gsct2026_setup' );
