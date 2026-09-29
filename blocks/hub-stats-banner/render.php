<?php
/**
 * Block template for HUB Stats Banner.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;


$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-stats-banner' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<div class="text-eyebrow">
			LSEG:GSCT
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				Share Price
			</div>
			<div class="h2-data-l">
				123.45 GBp
			</div>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				NAV per Share
			</div>
			<div class="h2-data-l">
				123.45 GBp
			</div>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				Premium
			</div>
			<div class="h2-data-l">
				1.23%
			</div>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				Net Yield
			</div>
			<div class="h2-data-l">
				1.23%
			</div>
		</div>
	</div>
</section>
