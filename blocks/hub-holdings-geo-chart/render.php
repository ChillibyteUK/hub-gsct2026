<?php
/**
 * Block template for HUB Holdings Geographic Chart.
 *
 * Region/allocation rows render twice: once as a Chart.js doughnut
 * (canvas + data attributes, drawn by src/js/geo-chart.js) with a
 * "Total portfolio 100%" centre overlay, once as a region/allocation
 * table with colour chips. Slice/chip colours resolve from the region
 * name against the chart tokens in src/css/tokens.css — canvas needs
 * real hex (it can't read var()), chips use the var() itself; both come
 * from the one $hub_colours map below, so keep it in sync with tokens.css.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$hub_title = $attributes['title'] ?? '';

$hub_colours = array(
	'north america'           => array( 'var(--col-chart-1)', '#f04438' ),
	'rest of world'           => array( 'var(--col-chart-5)', '#0a23c2' ),
	'japan'                   => array( 'var(--col-chart-2)', '#7628d4' ),
	'uk'                      => array( 'var(--col-chart-3)', '#2f7cf6' ),
	'united kingdom'          => array( 'var(--col-chart-3)', '#2f7cf6' ),
	'continental europe'      => array( 'var(--col-chart-4)', '#d67fb3' ),
	'cash & fixed interest'   => array( 'var(--col-chart-6)', '#d98700' ),
	'cash and fixed interest' => array( 'var(--col-chart-6)', '#d98700' ),
	'cash'                    => array( 'var(--col-chart-6)', '#d98700' ),
);

$hub_fallback = array(
	array( 'var(--col-chart-1)', '#f04438' ),
	array( 'var(--col-chart-5)', '#0a23c2' ),
	array( 'var(--col-chart-2)', '#7628d4' ),
	array( 'var(--col-chart-3)', '#2f7cf6' ),
	array( 'var(--col-chart-4)', '#d67fb3' ),
	array( 'var(--col-chart-6)', '#d98700' ),
);

$hub_items = array();
foreach ( (array) ( $attributes['regions'] ?? array() ) as $hub_row ) {
	$hub_row    = (array) $hub_row;
	$hub_region = trim( (string) ( $hub_row['region'] ?? '' ) );

	if ( '' === $hub_region ) {
		continue;
	}

	$hub_key = mb_strtolower( $hub_region );
	$hub_colour = $hub_colours[ $hub_key ] ?? $hub_fallback[ count( $hub_items ) % count( $hub_fallback ) ];

	$hub_items[] = array(
		'region' => $hub_region,
		'value'  => round( (float) ( $hub_row['allocation'] ?? 0 ), 1 ),
		'token'  => $hub_colour[0],
		'hex'    => $hub_colour[1],
	);
}

if ( ! $hub_items ) {
	return;
}

$hub_total       = array_sum( array_column( $hub_items, 'value' ) );
$hub_total_label = rtrim( rtrim( number_format( $hub_total, 1 ), '0' ), '.' ) . '%';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-holdings-geo-chart' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( '' !== trim( $hub_title ) ) {
			?>
			<h2 class="hub-holdings-geo-chart__title h2-data-l"><?= esc_html( $hub_title ); ?></h2>
			<?php
		}
		?>
		<div class="row align-items-center hub-holdings-geo-chart__grid">
			<div class="col-12 col-md-5">
				<div class="hub-holdings-geo-chart__chart-wrap">
					<canvas
						data-geo-chart
						data-labels="<?= esc_attr( wp_json_encode( array_column( $hub_items, 'region' ) ) ); ?>"
						data-values="<?= esc_attr( wp_json_encode( array_column( $hub_items, 'value' ) ) ); ?>"
						data-colors="<?= esc_attr( wp_json_encode( array_column( $hub_items, 'hex' ) ) ); ?>"
						role="img"
						aria-label="<?= esc_attr( sprintf( 'Geographical allocation chart: %s', implode( ', ', array_map( static function ( $hub_item ) { return $hub_item['region'] . ' ' . number_format( $hub_item['value'], 1 ) . '%'; }, $hub_items ) ) ) ); ?>"
					></canvas>
					<div class="hub-holdings-geo-chart__center" aria-hidden="true">
						<span class="hub-holdings-geo-chart__center-label">Total portfolio</span>
						<span class="hub-holdings-geo-chart__center-total"><?= esc_html( $hub_total_label ); ?></span>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-7">
				<div class="hub-holdings-geo-chart__table-wrap">
					<table class="hub-holdings-geo-chart__table">
						<thead>
							<tr>
								<th scope="col">Region</th>
								<th scope="col" class="hub-holdings-geo-chart__allocation-col">Allocation</th>
							</tr>
						</thead>
						<tbody>
							<?php
							foreach ( $hub_items as $hub_item ) {
								?>
								<tr>
									<td>
										<span class="hub-holdings-geo-chart__chip" style="background: <?= esc_attr( $hub_item['token'] ); ?>;"></span><?= esc_html( $hub_item['region'] ); ?>
									</td>
									<td class="hub-holdings-geo-chart__allocation-col"><?= esc_html( number_format( $hub_item['value'], 1 ) . '%' ); ?></td>
								</tr>
								<?php
							}
							?>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</section>
