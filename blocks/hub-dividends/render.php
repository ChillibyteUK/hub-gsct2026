<?php
/**
 * Block template for HUB Dividends.
 *
 * Three sections from one corporateactions fetch: latest dividend card,
 * annual Final/Interim stacked chart (5/10 years/All pills), and the full
 * searchable history table with progressive disclosure plus CSV export.
 * Year stacks group by ex-div calendar year; chart colours mirror the
 * --col-chart-* tokens (canvas needs hex — see the map below).
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$hub_events = hub_gsct2026_get_dividend_events();

if ( ! $hub_events ) {
	return;
}

$hub_latest = $hub_events[0];
$hub_annual = hub_gsct2026_get_annual_dividends( $hub_events );

$hub_fmt_date = static function ( $ymd ) {
	$time = strtotime( $ymd );
	return false !== $time ? wp_date( 'd M Y', $time ) : $ymd;
};

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-dividends' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<h2 class="h3-data-m">Latest dividend</h2>
		<div class="hub-dividends__latest">
			<div class="row">
				<div class="col-12 col-md-3">
					<div class="text-label text-uppercase">Ex-dividend date</div>
					<div class="h2-data-l"><?= esc_html( $hub_fmt_date( $hub_latest['exDate'] ) ); ?></div>
				</div>
				<div class="col-12 col-md-3">
					<div class="text-label text-uppercase">Payment date</div>
					<div class="h2-data-l"><?= esc_html( $hub_fmt_date( $hub_latest['payDate'] ) ); ?></div>
				</div>
				<div class="col-12 col-md-3">
					<div class="text-label text-uppercase">Dividend value</div>
					<div class="h2-data-l"><?= esc_html( number_format( $hub_latest['value'], 2 ) ); ?> <span class="h3-data-m">GBp</span></div>
				</div>
				<div class="col-12 col-md-3">
					<div class="text-label text-uppercase">Dividend type</div>
					<div class="h2-data-l"><?= esc_html( $hub_latest['label'] ); ?></div>
				</div>
			</div>
		</div>
		<h2 class="h3-data-m pt-5">Annual dividends and dividend yield</h2>
		<div class="hub-dividends__pills" data-div-pills>
			<button type="button" class="is-active" data-years="5">5 years</button>
			<button type="button" data-years="10">10 years</button>
			<button type="button" data-years="0">All</button>
		</div>
		<div class="hub-dividends__chart-wrap">
			<div class="hub-dividends__canvas">
				<canvas
					data-div-chart
					data-chart="
					<?=
					esc_attr(
						wp_json_encode(
							array_reverse(
								array_map(
									static function ( $year, $totals ) {
										return array(
											'year'    => (string) $year,
											'final'   => $totals['final'],
											'interim' => $totals['interim'],
										);
									},
									array_keys( $hub_annual ),
									$hub_annual
								)
							)
						)
					);
					?>
					"
					role="img"
					aria-label="Annual dividends chart"
				></canvas>
			</div>
			<ul class="hub-dividends__legend" aria-hidden="true">
				<li><span class="hub-dividends__chip" style="background: var(--col-chart-3);"></span>Final</li>
				<li><span class="hub-dividends__chip" style="background: var(--col-chart-2);"></span>Interim</li>
			</ul>
		</div>
		<h2 class="h3-data-m pt-5">Dividend history</h2>
		<div class="hub-dividends__search">
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="m13 13 4 4"/></svg>
			<label class="screen-reader-text" for="<?= esc_attr( $hub_search_id = wp_unique_id( 'hub-dividends-search-' ) ); ?>">Search dividends</label>
			<input type="search" id="<?= esc_attr( $hub_search_id ); ?>" class="hub-dividends__search-input" placeholder="Search by date or type" autocomplete="off" data-div-search>
		</div>
		<div class="hub-dividends__table-wrap">
			<table class="hub-dividends__table" data-div-export='
			<?=
			esc_attr(
				wp_json_encode(
					array_map(
						static function ( $event ) {
							return array( $event['exDate'], $event['payDate'], hub_gsct2026_dividend_type_label( $event['subType'] ), number_format( $event['value'], 2 ) );
						},
						$hub_events
					)
				)
			);
			?>
			'>
				<thead>
					<tr>
						<th scope="col">Ex-dividend date</th>
						<th scope="col">Payment date</th>
						<th scope="col">Dividend type</th>
						<th scope="col" class="hub-dividends__value-col">Dividend (GBp)</th>
					</tr>
				</thead>
				<tbody>
					<?php
					foreach ( $hub_events as $hub_index => $hub_event ) {
						$hub_search_text = mb_strtolower( $hub_fmt_date( $hub_event['exDate'] ) . ' ' . $hub_fmt_date( $hub_event['payDate'] ) . ' ' . hub_gsct2026_dividend_type_label( $hub_event['subType'] ) . ' ' . $hub_event['label'] . ' ' . number_format( $hub_event['value'], 2 ) );
						?>
						<tr data-div-row data-search="<?= esc_attr( $hub_search_text ); ?>"<?= $hub_index >= 10 ? ' hidden' : ''; ?>>
							<td><?= esc_html( $hub_fmt_date( $hub_event['exDate'] ) ); ?></td>
							<td><?= esc_html( $hub_fmt_date( $hub_event['payDate'] ) ); ?></td>
							<td><?= esc_html( hub_gsct2026_dividend_type_label( $hub_event['subType'] ) ); ?></td>
							<td class="hub-dividends__value-col"><?= esc_html( number_format( $hub_event['value'], 2 ) ); ?></td>
						</tr>
						<?php
					}
					?>
				</tbody>
			</table>
		</div>
		<div class="hub-dividends__more">
			<span data-div-count></span>
			<button type="button" class="hub-dividends__show-more" data-div-more>Show 10 more</button>
			<button type="button" class="hub-dividends__csv" data-div-csv aria-label="Download full history as CSV">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 1v9m0 0 3.5-3.5M8 10 4.5 6.5M2.5 11v2.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V11"/></svg>
			</button>
		</div>
	</div>
</section>
