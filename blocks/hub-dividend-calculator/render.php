<?php
/**
 * Block template for HUB Dividend Calculator.
 *
 * Bundles the Investis Dividend Centre calculator tool: the container div
 * plus its script and stylesheet — same URLs as the standalone snippet,
 * loaded via the enqueue API (the script handle is shared with the other
 * Investis blocks, so it loads once per page). The tool renders and
 * calculates client-side; src/blocks/dividend-calculator.css re-skins it on
 * top of the tool's own stylesheet. The Columbia Threadneedle client skin
 * from the snippet is deliberately not enqueued (see HUB Dividends).
 *
 * The title stays a block field above the tool. The tool brings its own NOTE
 * and "Service provided by IDX" footer, so there's no separate disclaimer.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$title = $attributes['title'] ?? '';

wp_enqueue_script(
	'investis-ir',
	'https://assets.investisdigital.com/nextgentools/v3/scripts/ir.js',
	array(),
	null,
	true
);
wp_enqueue_style(
	'investis-ngt-market',
	'https://assets.investisdigital.com/nextgentools/v3/assets/ngt-market-main.css',
	array(),
	null
);

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-dividend-calculator' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( '' !== trim( $title ) ) {
			?>
			<h2 class="h3-data-m"><?= esc_html( $title ); ?></h2>
			<?php
		}
		?>
		<div id="invd-container-dvc-1451-645-dvc-gobal-smaller-calc-tab" data-path="marketdatatools/dividendcenter/clients" data-client="1451" data-config="dvc-1451-645-dvc-gobal-smaller-calc-tab" data-active="true" class="invd-container gsct-dvc-calc"></div>
	</div>
</section>
