<?php
/**
 * Block template for HUB Return Performance.
 *
 * Hand-entered numbers, pasted in as two small CSV blocks rather than a
 * field per number: each is four lines — headings (periods / financial
 * years), then NAV, share price and benchmark, in that order, no label
 * column. The bar chart reads the cumulative values, so there's one source
 * of truth and nothing extra to keep in sync. If an API feed ever arrives,
 * these grids are the shape it would populate.
 *
 * One shared "as at" date replaces {date} in the chart title, subtitle and
 * both table headings, so a month-end update is one edit.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$as_at          = hub_gsct2026_format_date( $attributes['asAt'] ?? '' );
$with_date      = static function ( $text ) use ( $as_at ) {
	return str_replace( '{date}', $as_at, (string) $text );
};
$chart_title    = $with_date( $attributes['chartTitle'] ?? '' );
$chart_subtitle = $with_date( $attributes['chartSubtitle'] ?? '' );
$cum_heading    = $with_date( $attributes['cumHeading'] ?? '' );
$disc_heading   = $with_date( $attributes['discHeading'] ?? '' );
$disclaimer     = $attributes['disclaimer'] ?? '';

// Leg order is fixed: line 2 of each CSV is NAV, 3 share price, 4 benchmark.
// Leg colours: canvas needs real hex, not var() — these mirror the
// --col-chart-* tokens in src/css/tokens.css, keep them in sync. The
// hand-rendered legend below uses the vars themselves.
$chart_legs = array(
	array(
		'label'     => 'NAV',
		'row_label' => 'NAV (debt at market value)',
		'token'     => 'var(--col-chart-3)',
		'hex'       => '#307eff',
	),
	array(
		'label'     => 'Share price',
		'row_label' => 'Share price',
		'token'     => 'var(--col-chart-2)',
		'hex'       => '#7628d4',
	),
	array(
		'label'     => 'Benchmark',
		'row_label' => 'Benchmark',
		'token'     => 'var(--col-chart-1)',
		'hex'       => '#f74333',
	),
);

/**
 * Turn pasted CSV into headings plus one value row per leg, each padded or
 * trimmed to the number of headings. A data row with one extra leading
 * non-numeric cell (someone pasted the row label too) has it dropped.
 */
$read_grid = static function ( $csv ) use ( $chart_legs ) {
	$rows     = hub_gsct2026_parse_csv_grid( $csv );
	$headings = $rows ? array_shift( $rows ) : array();
	$count    = count( $headings );
	$legs     = array();

	foreach ( array_keys( $chart_legs ) as $index => $leg_index ) {
		$cells = $rows[ $index ] ?? array();
		if ( count( $cells ) === $count + 1 && isset( $cells[0] ) && ! is_numeric( $cells[0] ) ) {
			array_shift( $cells );
		}
		$legs[ $leg_index ] = array_pad( array_slice( $cells, 0, $count ), $count, '' );
	}

	return array(
		'headings' => $headings,
		'legs'     => $legs,
	);
};

$cumulative = $read_grid( $attributes['cumulativeCsv'] ?? '' );
$discrete   = $read_grid( $attributes['discreteCsv'] ?? '' );

$chart_datasets = array();
foreach ( $chart_legs as $leg_index => $leg ) {
	$chart_datasets[] = array(
		'label' => $leg['label'],
		'data'  => array_map(
			static function ( $value ) {
				return is_numeric( $value ) ? (float) $value : null;
			},
			$cumulative['legs'][ $leg_index ]
		),
		'color' => $leg['hex'],
	);
}

// Numbers to two decimals; anything else (n/a, a dash) is shown as typed.
$fmt = static function ( $value ) {
	return is_numeric( $value ) ? number_format( (float) $value, 2 ) : (string) $value;
};

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-return-performance' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( '' !== trim( $chart_title ) ) {
			?>
			<h2 class="h3-data-m"><?= esc_html( $chart_title ); ?></h2>
			<?php
		}
		if ( '' !== trim( $chart_subtitle ) ) {
			?>
			<p class="hub-return-performance__subtitle text-body"><?= esc_html( $chart_subtitle ); ?></p>
			<?php
		}
		?>
		<div class="hub-return-performance__chart-wrap mb-6">
			<div class="hub-return-performance__canvas">
				<canvas
					data-return-chart
					data-labels="<?= esc_attr( wp_json_encode( $cumulative['headings'] ) ); ?>"
					data-datasets="<?= esc_attr( wp_json_encode( $chart_datasets ) ); ?>"
					role="img"
					aria-label="<?= esc_attr( $chart_title ? $chart_title : 'Historical return performance chart' ); ?>"
				></canvas>
			</div>
			<ul class="hub-return-performance__legend" aria-hidden="true">
				<?php
				foreach ( $chart_legs as $leg ) {
					?>
					<li><span class="hub-return-performance__chip" style="background: <?= esc_attr( $leg['token'] ); ?>;"></span><?= esc_html( $leg['label'] ); ?></li>
					<?php
				}
				?>
			</ul>
		</div>
		<?php
		if ( '' !== trim( $disclaimer ) ) {
			?>
			<p class="hub-return-performance__disclaimer mt-4"><?= wp_kses_post( nl2br( $disclaimer ) ); ?></p>
			<?php
		}
		if ( '' !== trim( $cum_heading ) ) {
			?>
			<h2 class="h3-data-m mt-6"><?= esc_html( $cum_heading ); ?></h2>
			<?php
		}
		?>
		<div class="hub-return-performance__table-wrap">
			<table class="hub-return-performance__table">
				<thead>
					<tr>
						<th scope="col"><span class="screen-reader-text">Row</span></th>
						<?php
						foreach ( $cumulative['headings'] as $period_label ) {
							?>
							<th scope="col" class="hub-return-performance__value-col"><?= esc_html( $period_label ); ?></th>
							<?php
						}
						?>
					</tr>
				</thead>
				<tbody>
					<?php
					foreach ( $chart_legs as $leg_index => $leg ) {
						?>
						<tr>
							<td><?= esc_html( $leg['row_label'] ); ?></td>
							<?php
							foreach ( $cumulative['legs'][ $leg_index ] as $value ) {
								?>
								<td class="hub-return-performance__value-col"><?= esc_html( $fmt( $value ) ); ?></td>
								<?php
							}
							?>
						</tr>
						<?php
					}
					?>
				</tbody>
			</table>
		</div>
		<?php
		if ( '' !== trim( $disc_heading ) ) {
			?>
			<h2 class="h3-data-m mt-6"><?= esc_html( $disc_heading ); ?></h2>
			<?php
		}
		?>
		<div class="hub-return-performance__table-wrap mb-6">
			<table class="hub-return-performance__table">
				<thead>
					<tr>
						<th scope="col"><span class="screen-reader-text">Row</span></th>
						<?php
						foreach ( $discrete['headings'] as $year_label ) {
							?>
							<th scope="col" class="hub-return-performance__value-col"><?= esc_html( $year_label ); ?></th>
							<?php
						}
						?>
					</tr>
				</thead>
				<tbody>
					<?php
					foreach ( $chart_legs as $leg_index => $leg ) {
						?>
						<tr>
							<td><?= esc_html( $leg['row_label'] ); ?></td>
							<?php
							foreach ( $discrete['legs'][ $leg_index ] as $value ) {
								?>
								<td class="hub-return-performance__value-col"><?= esc_html( $fmt( $value ) ); ?></td>
								<?php
							}
							?>
						</tr>
						<?php
					}
					?>
				</tbody>
			</table>
		</div>
	</div>
</section>
