<?php
/**
 * Block template for HUB Stats Banner.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$hub_stats = hub_gsct2026_get_market_stats();

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'         => 'hub-stats-banner',
		'data-endpoint' => esc_url_raw( rest_url( 'hub/v1/market-stats' ) ),
		'data-as-of'    => (string) $hub_stats['as_of'],
	)
);
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<div class="text-eyebrow">
			LSE: GSCT
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				Share Price
			</div>
			<div class="h2-data-l" data-stat="price"><?php echo esc_html( $hub_stats['price'] ); ?></div>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				NAV per Share
			</div>
			<div class="h2-data-l" data-stat="nav"><?php echo esc_html( $hub_stats['nav'] ); ?></div>
			<small data-stat="nav-date"<?php echo $hub_stats['nav_date'] ? '' : ' hidden'; ?>>
				<?php
				if ( $hub_stats['nav_date'] ) {
					?>
				NAV as at <time datetime="<?php echo esc_attr( $hub_stats['nav_date'] ); ?>"><?php echo esc_html( $hub_stats['nav_date_label'] ); ?></time>
					<?php
				}
				?>
			</small>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase" data-stat="premium-label"><?php echo esc_html( $hub_stats['premium_label'] ); ?></div>
			<div class="h2-data-l" data-stat="premium"><?php echo esc_html( $hub_stats['premium'] ); ?></div>
		</div>
		<div class="hub-stats-banner__stat">
			<div class="text-label text-uppercase">
				Net Dividend Yield
			</div>
			<div class="h2-data-l" data-stat="yield"><?php echo esc_html( $hub_stats['yield'] ); ?></div>
		</div>
	</div>
</section>
