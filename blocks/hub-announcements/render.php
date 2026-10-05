<?php
/**
 * Block template for HUB Announcements.
 *
 * Bundles the Investis RNS announcements tool: the container div plus its
 * script and stylesheets (same URLs as the standalone snippet, loaded via
 * the enqueue API so WordPress manages order). The tool renders everything
 * client-side; src/js/announcements.js restructures each render (real
 * Category column from the rows' .form-type data, counts, footer) and
 * src/blocks/announcements.css provides the site table treatment on top
 * of the tool's own stylesheets.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

wp_enqueue_script(
	'investis-ir',
	'https://assets.investisdigital.com/nextgentools/v3/scripts/ir.js',
	array(),
	null,
	true
);
// Note: the snippet this was bundled from had trailing slashes on both
// stylesheet URLs, which 403 on the CDN — dropped here so the tool's own
// stylesheet actually loads. The second URL in that snippet (the Columbia
// Threadneedle client skin) is deliberately NOT enqueued: it only carries
// CT branding that this block re-skins from scratch, so loading it would
// just add competing rules to override.
wp_enqueue_style(
	'investis-ngt-news',
	'https://assets.investisdigital.com/nextgentools/v3/assets/ngt-news-main.css',
	array(),
	null
);

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-announcements' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<div id="invd-container-rns-523-rns-global-smaller" data-path="news/clients" data-client="523" data-config="rns-523-rns-global-smaller" data-active="true" class="invd-container gsct_rns"></div>
	</div>
</section>
