<?php
/**
 * Block template for HUB Share Price.
 *
 * Live price card on brand-yellow: every figure comes from
 * hub_gsct2026_get_market_snapshot() (Group=full), missing values render
 * a dash. Change line runs negative (col-negative) or positive
 * (col-positive); the status badge reflects the exchange status.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$hub_snapshot = hub_gsct2026_get_market_snapshot();
$hub_snap     = is_array( $hub_snapshot ) ? $hub_snapshot : array();

$hub_pence = static function ( $value ) {
	return null !== $value ? number_format( (float) $value, 2 ) . ' GBp' : '&ndash;';
};

$hub_price = isset( $hub_snap['price'] ) ? number_format( (float) $hub_snap['price'], 2 ) . ' GBp' : '&ndash;';

$hub_abs = $hub_snap['absChange'] ?? null;
$hub_pct = $hub_snap['percentChange'] ?? null;

if ( null !== $hub_abs && null !== $hub_pct ) {
	$hub_change_text  = number_format( (float) $hub_abs, 2 ) . ' (' . number_format( (float) $hub_pct, 2 ) . '%)';
	$hub_change_class = $hub_abs < 0 ? 'is-down' : ( $hub_abs > 0 ? 'is-up' : '' );
} else {
	$hub_change_text  = '&ndash;';
	$hub_change_class = '';
}

$hub_status_raw = $hub_snap['exchangeStatus'] ?? '';
$hub_status     = 'Closed' === $hub_status_raw ? 'CLOSE' : ( 'Open' === $hub_status_raw ? 'OPEN' : strtoupper( $hub_status_raw ) );

$hub_updated = '&ndash;';

if ( ! empty( $hub_snap['lastTrade'] ) ) {
	$hub_time = strtotime( $hub_snap['lastTrade'] );

	if ( false !== $hub_time ) {
		try {
			$hub_tz = ! empty( $hub_snap['timeZone'] ) ? new DateTimeZone( $hub_snap['timeZone'] ) : wp_timezone();
		} catch ( Exception $e ) {
			$hub_tz = wp_timezone();
		}

		$hub_updated = wp_date( 'j M Y H:i', $hub_time, $hub_tz );
	}
}

$hub_volume = isset( $hub_snap['volume'] ) ? number_format( (int) $hub_snap['volume'] ) : '&ndash;';

// Market cap arrives in pence (LSE GBX instrument), so £m is cap / 1e8.
$hub_mcap = isset( $hub_snap['marketCap'] ) ? number_format( (float) $hub_snap['marketCap'] / 100000000, 2 ) . ' Mn GBP' : '&ndash;';

$hub_open      = $hub_pence( $hub_snap['open'] ?? null );
$hub_prev      = $hub_pence( $hub_snap['prevClose'] ?? null );
$hub_day_low   = isset( $hub_snap['low'] ) ? number_format( (float) $hub_snap['low'], 2 ) : '&ndash;';
$hub_day_high  = isset( $hub_snap['high'] ) ? number_format( (float) $hub_snap['high'], 2 ) : '&ndash;';
$hub_year_low  = isset( $hub_snap['fiftytwoWeekLow'] ) ? number_format( (float) $hub_snap['fiftytwoWeekLow'], 2 ) : '&ndash;';
$hub_year_high = isset( $hub_snap['fiftytwoWeekHigh'] ) ? number_format( (float) $hub_snap['fiftytwoWeekHigh'], 2 ) : '&ndash;';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-share-price mt-6 mb-5' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<div class="hub-share-price__card">
		<div class="text-eyebrow">LSEG: <?= esc_html( $hub_snap['symbol'] ?? '' ); ?></div>
		<div class="hub-share-price__current">
			<div class="text-label text-uppercase">Current share price</div>
			<div class="hub-share-price__price-row">
				<span class="h2-data-l"><?= $hub_price; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></span>
				<?php
				if ( '' !== $hub_status ) {
					?>
					<span class="hub-share-price__status"><?= esc_html( $hub_status ); ?></span>
					<?php
				}
				?>
			</div>
			<div class="hub-share-price__change<?= $hub_change_class ? ' ' . esc_attr( $hub_change_class ) : ''; ?>"><?= $hub_change_text; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></div>
			<div class="hub-share-price__updated text-body">Last updated: <?= $hub_updated; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_date() output plus an entity, no user input. ?></div>
		</div>
		<div class="row hub-share-price__grid">
			<div class="col-12 col-md-6">
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Opening price</div>
					<div class="h3-data-m"><?= $hub_open; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></div>
				</div>
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Previous close</div>
					<div class="h3-data-m"><?= $hub_prev; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></div>
				</div>
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Day range</div>
					<div class="hub-share-price__range" aria-hidden="false">
						<span class="hub-share-price__range-line" aria-hidden="true"></span>
						<span class="hub-share-price__range-values text-body"><span><?= $hub_day_low; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></span><span><?= $hub_day_high; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></span></span>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-6">
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Volume</div>
					<div class="h3-data-m"><?= $hub_volume; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></div>
				</div>
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">Market cap</div>
					<div class="h3-data-m"><?= $hub_mcap; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></div>
				</div>
				<div class="hub-share-price__stat">
					<div class="text-label text-uppercase">52-week range</div>
					<div class="hub-share-price__range" aria-hidden="false">
						<span class="hub-share-price__range-line" aria-hidden="true"></span>
						<span class="hub-share-price__range-values text-body"><span><?= $hub_year_low; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></span><span><?= $hub_year_high; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- number_format() output plus an entity, no user input. ?></span></span>
					</div>
				</div>
			</div>
		</div>
		</div>
	</div>
</section>
