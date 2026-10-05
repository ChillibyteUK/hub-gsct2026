<?php
/**
 * Block template for HUB Return Performance.
 *
 * Hand-entered numbers throughout (fixed fields, not a repeater) — the
 * bar chart reads the cumulative values, so there's one source of truth
 * and nothing extra to keep in sync. If an API feed ever arrives, these
 * same attributes are the shape it would populate.
 *
 * Discrete year-column labels are editable text so they roll forward each
 * year (2025/26 → 2026/27) without touching the block.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$chart_title    = $attributes['chartTitle'] ?? '';
$chart_subtitle = $attributes['chartSubtitle'] ?? '';
$cum_heading    = $attributes['cumHeading'] ?? '';
$disc_heading   = $attributes['discHeading'] ?? '';
$disclaimer     = $attributes['disclaimer'] ?? '';

$cum_periods = array(
	'1m'  => '1M',
	'Ytd' => 'YTD',
	'1y'  => '1Y',
	'3y'  => '3Y',
	'5y'  => '5Y',
);

// Leg colours: canvas needs real hex, not var() — these mirror the
// --col-chart-* tokens in src/css/tokens.css, keep them in sync. The
// hand-rendered legend below uses the vars themselves.
$chart_legs = array(
	array( 'key' => 'Nav', 'label' => 'NAV', 'token' => 'var(--col-chart-3)', 'hex' => '#307eff' ),
	array( 'key' => 'Price', 'label' => 'Share price', 'token' => 'var(--col-chart-2)', 'hex' => '#7628d4' ),
	array( 'key' => 'Bench', 'label' => 'Benchmark', 'token' => 'var(--col-chart-1)', 'hex' => '#f74333' ),
);

$chart_datasets = array();
foreach ( $chart_legs as $leg ) {
	$values = array();
	foreach ( $cum_periods as $period_key => $period_label ) {
		$values[] = (float) ( $attributes[ 'cum' . $leg['key'] . $period_key ] ?? 0 );
	}
	$chart_datasets[] = array(
		'label' => $leg['label'],
		'data'  => $values,
		'color' => $leg['hex'],
	);
}

$disc_years = array();
for ( $i = 1; $i <= 5; $i++ ) {
	$disc_years[] = $attributes[ "year{$i}" ] ?? '';
}

$fmt = static function ( $value ) {
	return number_format( (float) $value, 2 );
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
					data-labels="<?= esc_attr( wp_json_encode( array_values( $cum_periods ) ) ); ?>"
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
			<p class="hub-return-performance__disclaimer"><?= esc_html( $disclaimer ); ?></p>
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
						foreach ( $cum_periods as $period_label ) {
							?>
							<th scope="col" class="hub-return-performance__value-col"><?= esc_html( $period_label ); ?></th>
							<?php
						}
						?>
					</tr>
				</thead>
				<tbody>
					<?php
					$cum_rows = array(
						'NAV (debt at market value)' => 'Nav',
						'Share price'                => 'Price',
						'Benchmark'                  => 'Bench',
					);
					foreach ( $cum_rows as $row_label => $leg_key ) {
						?>
						<tr>
							<td><?= esc_html( $row_label ); ?></td>
							<?php
							foreach ( $cum_periods as $period_key => $period_label ) {
								?>
								<td class="hub-return-performance__value-col"><?= esc_html( $fmt( $attributes[ 'cum' . $leg_key . $period_key ] ?? 0 ) ); ?></td>
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
						foreach ( $disc_years as $year_label ) {
							?>
							<th scope="col" class="hub-return-performance__value-col"><?= esc_html( $year_label ); ?></th>
							<?php
						}
						?>
					</tr>
				</thead>
				<tbody>
					<?php
					$disc_rows = array(
						'NAV (debt at market value)' => 'Nav',
						'Share price'                 => 'Price',
						'Benchmark'                   => 'Bench',
					);
					foreach ( $disc_rows as $row_label => $leg_key ) {
						?>
						<tr>
							<td><?= esc_html( $row_label ); ?></td>
							<?php
							for ( $i = 1; $i <= 5; $i++ ) {
								?>
								<td class="hub-return-performance__value-col"><?= esc_html( $fmt( $attributes[ "disc{$leg_key}{$i}" ] ?? 0 ) ); ?></td>
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
