<?php
/**
 * Block template for HUB Share Price.
 *
 * Live price card on brand-yellow: every figure comes from
 * hub_gsct2026_get_share_price_stats() (built on the Group=full snapshot),
 * missing values render a dash. The block script (src/js/share-price.js)
 * refreshes the figures from /hub/v1/share-price-stats because the page
 * itself may be served from a page cache. Change line runs negative
 * (col-negative) or positive (col-positive); the status badge reflects the
 * exchange status.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$hub_stats = hub_gsct2026_get_share_price_stats();

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'         => 'hub-share-price mt-6 mb-5',
		'data-endpoint' => esc_url_raw( rest_url( 'hub/v1/share-price-stats' ) ),
		'data-as-of'    => (string) $hub_stats['as_of'],
	)
);
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<div class="hub-share-price__card">
		<div class="text-eyebrow">LSE: GSCT</div>
		<div class="hub-share-price__current">
			<div class="text-label text-uppercase">Current share price</div>
			<div class="hub-share-price__price-row">
				<span class="h2-data-l" data-stat="price"><?php echo esc_html( $hub_stats['price'] ); ?></span>
				<span class="hub-share-price__status" data-stat="status"<?php echo '' !== $hub_stats['status'] ? '' : ' hidden'; ?>><?php echo esc_html( $hub_stats['status'] ); ?></span>
			</div>
			<div class="hub-share-price__change<?php echo $hub_stats['change_class'] ? ' ' . esc_attr( $hub_stats['change_class'] ) : ''; ?>" data-stat="change"><?php echo esc_html( $hub_stats['change'] ); ?></div>
			<div class="hub-share-price__updated text-body">Last updated: <span data-stat="updated"><?php echo esc_html( $hub_stats['updated'] ); ?></span></div>
		</div>
		<div class="row hub-share-price__grid">
			<div class="col-6">
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Opening price</div>
					<div class="h3-data-m" data-stat="open"><?php echo esc_html( $hub_stats['open'] ); ?></div>
				</div>
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Previous close</div>
					<div class="h3-data-m" data-stat="prev"><?php echo esc_html( $hub_stats['prev'] ); ?></div>
				</div>
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Day range</div>
					<div class="hub-share-price__range" aria-hidden="false">
						<span class="hub-share-price__range-line" aria-hidden="true"></span>
						<span class="hub-share-price__range-values text-body"><span data-stat="day_low"><?php echo esc_html( $hub_stats['day_low'] ); ?></span><span data-stat="day_high"><?php echo esc_html( $hub_stats['day_high'] ); ?></span></span>
					</div>
				</div>
			</div>
			<div class="col-6">
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Volume</div>
					<div class="h3-data-m" data-stat="volume"><?php echo esc_html( $hub_stats['volume'] ); ?></div>
				</div>
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Market cap</div>
					<div class="h3-data-m" data-stat="mcap"><?php echo esc_html( $hub_stats['mcap'] ); ?></div>
				</div>
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">52 Week Range</div>
					<div class="hub-share-price__range" aria-hidden="false">
						<span class="hub-share-price__range-line" aria-hidden="true"></span>
						<span class="hub-share-price__range-values text-body"><span data-stat="year_low"><?php echo esc_html( $hub_stats['year_low'] ); ?></span><span data-stat="year_high"><?php echo esc_html( $hub_stats['year_high'] ); ?></span></span>
					</div>
				</div>
			</div>
		</div>
		</div>
	</div>
</section>
