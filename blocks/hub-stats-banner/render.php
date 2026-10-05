<?php
/**
 * Block template for HUB Stats Banner.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$hub_snapshot = hub_gsct2026_get_market_snapshot();
$hub_price    = $hub_snapshot && isset( $hub_snapshot['price'] )
	? number_format( (float) $hub_snapshot['price'], 2 ) . ' GBp'
	: '&ndash;';

$hub_nav         = hub_gsct2026_get_nav_per_share();
$hub_nav_display = $hub_nav
	? number_format( $hub_nav, 2 ) . ' GBp'
	: '&ndash;';

$hub_premium         = hub_gsct2026_get_premium_percent();
$hub_premium_display = null !== $hub_premium
	? number_format( $hub_premium, 2 ) . '%'
	: '&ndash;';

$hub_yield         = hub_gsct2026_get_net_yield();
$hub_yield_display = null !== $hub_yield
	? number_format( $hub_yield, 2 ) . '%'
	: '&ndash;';

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
				<?= $hub_price; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?>
			</div>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				NAV per Share
			</div>
			<div class="h2-data-l">
				<?= $hub_nav_display; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?>
			</div>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				Premium
			</div>
			<div class="h2-data-l">
				<?= $hub_premium_display; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?>
			</div>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				Net Yield
			</div>
			<div class="h2-data-l">
				<?= $hub_yield_display; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?>
			</div>
		</div>
	</div>
</section>
