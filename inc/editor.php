<?php
/**
 * Block editor tweaks. Standing per-theme convention for this user — not
 * covered by the lcp-blog-options plugin (which handles comments/tags/emoji
 * site-wide, but not this).
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Load the theme's actual compiled stylesheet into the block editor iframe
 * (fonts, colours, every block's real CSS — full parity with the frontend,
 * not a hand-picked subset), plus a small editor-only stylesheet on top
 * that contains top-level blocks to a page-width column instead of
 * full-bleed. add_editor_style() accepts an array — order matters, since
 * css/editor.css references var(--container-max-width), which only
 * resolves because theme.min.css's :root block loads first in the same
 * iframe document. Relies on the 'editor-styles' support already added in
 * inc/setup.php.
 *
 * @return void
 */
function hub_gsct2026_add_editor_styles() {
	add_editor_style( array( 'css/theme.min.css', 'css/editor.min.css' ) );
}
add_action( 'after_setup_theme', 'hub_gsct2026_add_editor_styles' );

/**
 * Disable the block editor's fullscreen mode by default.
 *
 * @return void
 */
// phpcs:disable
function hub_gsct2026_disable_editor_fullscreen_by_default() {
	$script = "jQuery( window ).load(function() { const isFullscreenMode = wp.data.select( 'core/edit-post' ).isFeatureActive( 'fullscreenMode' ); if ( isFullscreenMode ) { wp.data.dispatch( 'core/edit-post' ).toggleFeature( 'fullscreenMode' ); } });";
	wp_add_inline_script( 'wp-blocks', $script );
}
add_action( 'enqueue_block_editor_assets', 'hub_gsct2026_disable_editor_fullscreen_by_default' );
// phpcs:enable

/**
 * Disable the block inserter's extra Media/Openverse panel.
 *
 * This theme keeps the editor pared back and does not use WordPress's stock
 * remote media suggestions.
 *
 * @param array $settings Block editor settings.
 * @return array
 */
function hub_gsct2026_disable_openverse_media_category( $settings ) {
	$settings['enableOpenverseMediaCategory'] = false;

	return $settings;
}
add_filter( 'block_editor_settings_all', 'hub_gsct2026_disable_openverse_media_category' );

/**
 * Remove the block directory upsell from the inserter.
 *
 * This keeps clients out of WordPress's install-more-blocks prompt.
 *
 * @return void
 */
function hub_gsct2026_disable_block_directory_inserter() {
	remove_action( 'enqueue_block_editor_assets', 'wp_enqueue_editor_block_directory_assets' );
}
add_action( 'after_setup_theme', 'hub_gsct2026_disable_block_directory_inserter' );

/**
 * Register the "Lede" RichText format — a components-popover toolbar
 * button (same selection popover as Bold/Italic/Link), not a block
 * attribute. See blocks/_editor-formats/src/index.js's own header comment
 * for why: a block-level Font Size control can't give just the first
 * paragraph of a RichText field its own size, only the whole field.
 * Registered globally (not per-block) since it's a RichText-wide utility,
 * matching every other custom format WordPress ships (bold/italic/etc are
 * global too) — not specific to Page Header even though that's what
 * prompted it.
 *
 * Not auto-registered by inc/blocks.php's blocks/*\/block.json glob (this
 * folder has no block.json — it's a format, not a block), so it needs its
 * own explicit enqueue here.
 *
 * @return void
 */
function hub_gsct2026_enqueue_lede_format() {
	$asset_file = HUB_GSCT2026_DIR . '/blocks/_editor-formats/build/index.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;

	wp_enqueue_script(
		'hub-gsct2026-editor-formats',
		get_template_directory_uri() . '/blocks/_editor-formats/build/index.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'hub_gsct2026_enqueue_lede_format' );

/**
 * Enqueue the Person Details document-sidebar panel
 * (blocks/_person-panel) — the editing UI for person post meta. Same
 * explicit-enqueue pattern as the lede format above: no block.json, so
 * inc/blocks.php's glob never picks it up.
 *
 * @return void
 */
function hub_gsct2026_enqueue_person_panel() {
	$asset_file = HUB_GSCT2026_DIR . '/blocks/_person-panel/build/index.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;

	wp_enqueue_script(
		'hub-gsct2026-person-panel',
		get_template_directory_uri() . '/blocks/_person-panel/build/index.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'hub_gsct2026_enqueue_person_panel' );
