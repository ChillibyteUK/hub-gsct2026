<?php
/**
 * Hub GSCT 2026 — theme functions.
 *
 * Standalone theme, no parent theme. See style.css header for the
 * "BS-flavored naming, not Bootstrap" note and browser support baseline.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

// Disable the Theme and Plugin file editors in wp-admin. Core omits both
// menu items (and blocks direct access to theme-editor.php/plugin-editor.php)
// when this is set; defining it here rather than wp-config.php keeps the
// hardening with the theme, and the guard respects a wp-config.php value.
if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
	define( 'DISALLOW_FILE_EDIT', true );
}

define( 'HUB_GSCT2026_DIR', get_template_directory() );

require_once HUB_GSCT2026_DIR . '/inc/setup.php';
require_once HUB_GSCT2026_DIR . '/inc/enqueue.php';
require_once HUB_GSCT2026_DIR . '/inc/class-hub-gsct2026-nav-walker.php';
require_once HUB_GSCT2026_DIR . '/inc/blocks.php';
require_once HUB_GSCT2026_DIR . '/inc/editor.php';
require_once HUB_GSCT2026_DIR . '/inc/options.php';
require_once HUB_GSCT2026_DIR . '/inc/social-icons.php';
require_once HUB_GSCT2026_DIR . '/inc/head-tags.php';
require_once HUB_GSCT2026_DIR . '/inc/block-usage.php';
require_once HUB_GSCT2026_DIR . '/inc/utilities.php';
require_once HUB_GSCT2026_DIR . '/inc/helpers.php';
require_once HUB_GSCT2026_DIR . '/inc/posttypes.php';
require_once HUB_GSCT2026_DIR . '/inc/toc.php';
require_once HUB_GSCT2026_DIR . '/inc/taxonomies.php';
