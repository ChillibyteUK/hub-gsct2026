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

$hub_nav_data    = hub_gsct2026_get_latest_nav();
$hub_nav         = $hub_nav_data ? $hub_nav_data['value'] : null;
$hub_nav_display = $hub_nav
	? number_format( $hub_nav, 2 ) . ' GBp'
	: '&ndash;';

$hub_premium         = hub_gsct2026_get_premium_percent();
$hub_premium_display = null !== $hub_premium
	? number_format( $hub_premium, 2 ) . '%'
	: '&ndash;';
$hub_premium_label   = 'Premium';

if ( null !== $hub_premium ) {
	$hub_premium_label = $hub_premium < 0 ? 'Discount' : ( $hub_premium > 0 ? 'Premium' : 'At NAV' );
}

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
			<?php if ( $hub_nav_data ) : ?>
				<small>NAV as at <time datetime="<?php echo esc_attr( $hub_nav_data['date'] ); ?>"><?php echo esc_html( wp_date( 'j M Y', strtotime( $hub_nav_data['date'] . ' 12:00:00 UTC' ) ) ); ?></time></small>
			<?php endif; ?>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				<?php echo esc_html( $hub_premium_label ); ?>
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
