<?php
/**
 * Block template for HUB Holdings.
 *
 * Parses a pasted CSV (Holding Name, Sector/Industry, Weight %), sorts by
 * weight descending, renders the full table but shows only the top 10. A
 * filter button toggles hiding rows whose sector is 'Collective investments'
 * — backfilling from further down the list so 10 rows stay visible either
 * way. Instant, client-side, via src/js/holdings.js, using the native
 * `hidden` attribute.
 *
 * CSV parsing is server-side on every render via str_getcsv(), so quoted
 * fields/commas inside fields survive, and the % sign/whitespace on the
 * weight are stripped for sorting but kept verbatim in the output.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$hub_title = $attributes['title'] ?? '';
$hub_csv   = $attributes['holdingsCsv'] ?? '';

if ( '' === trim( $hub_csv ) ) {
	return;
}

$hub_exclude_label = isset( $attributes['excludeLabel'] ) && '' !== $attributes['excludeLabel']
	? $attributes['excludeLabel']
	: 'Exclude Collective investments';

$hub_excluded_sector = 'collective investments';

$hub_lines = preg_split( '/\r\n|\r|\n/', $hub_csv );
$hub_rows  = array();

foreach ( (array) $hub_lines as $hub_line ) {
	if ( '' === trim( $hub_line ) ) {
		continue;
	}

	$hub_cols = str_getcsv( $hub_line );

	if ( count( $hub_cols ) < 3 ) {
		continue;
	}

	$hub_name   = trim( (string) $hub_cols[0] );
	$hub_sector = trim( (string) $hub_cols[1] );
	$hub_weight = trim( (string) $hub_cols[2] );

	if ( '' === $hub_name ) {
		continue;
	}

	// Header row ("Holding Name, Sector/Industry, Weight %...") — detected
	// by its weight column not containing any digits at all, rather than by
	// position, so a stray leading blank/notes line before the data doesn't
	// accidentally keep it in the table.
	if ( ! preg_match( '/\d/', $hub_weight ) ) {
		continue;
	}

	$hub_rows[] = array(
		'name'     => $hub_name,
		'sector'   => $hub_sector,
		'weight'   => $hub_weight,
		'sort'     => (float) preg_replace( '/[^0-9.]/', '', $hub_weight ),
		'excluded' => mb_strtolower( trim( $hub_sector ) ) === $hub_excluded_sector,
	);
}

if ( ! $hub_rows ) {
	return;
}

usort(
	$hub_rows,
	static function ( $a, $b ) {
		return $b['sort'] <=> $a['sort'];
	}
);

$hub_has_excludable = false;
foreach ( $hub_rows as $hub_row ) {
	if ( $hub_row['excluded'] ) {
		$hub_has_excludable = true;
		break;
	}
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-holdings' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( '' !== trim( $hub_title ) ) {
			?>
			<h2 class="hub-holdings__title h2-data-l"><?= esc_html( $hub_title ); ?></h2>
			<?php
		}
		if ( $hub_has_excludable ) {
			?>
			<div class="hub-holdings__filter">
				<button type="button" class="hub-holdings__toggle" aria-pressed="false">
					<?= esc_html( $hub_exclude_label ); ?>
				</button>
			</div>
			<?php
		}
		?>
		<div class="hub-holdings__table-wrap">
			<table class="hub-holdings__table">
				<thead>
					<tr>
						<th scope="col" class="hub-holdings__rank-col">Rank</th>
						<th scope="col">Holding Name</th>
						<th scope="col">Sector/Industry</th>
						<th scope="col" class="hub-holdings__weight-col">Weight (%)</th>
					</tr>
				</thead>
				<tbody>
					<?php
					$hub_visible_pos = 0;
					foreach ( $hub_rows as $hub_index => $hub_row ) {
						$hub_row_attrs = $hub_row['excluded'] ? ' data-hub-holdings-excluded' : '';
						$hub_row_class = '';
						if ( $hub_index < 10 ) {
							++$hub_visible_pos;
							if ( 0 === $hub_visible_pos % 2 ) {
								$hub_row_class = ' class="is-alt"';
							}
						}
						if ( $hub_index >= 10 ) {
							$hub_row_attrs .= ' hidden';
						}
						?>
						<tr<?= $hub_row_class; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- hardcoded class name. ?><?= $hub_row_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from hardcoded attribute names above. ?>>
							<td class="hub-holdings__rank-col"><?= esc_html( (string) ( $hub_index + 1 ) ); ?></td>
							<td><?= esc_html( $hub_row['name'] ); ?></td>
							<td><?= esc_html( $hub_row['sector'] ); ?></td>
							<td class="hub-holdings__weight-col"><?= esc_html( $hub_row['weight'] ); ?></td>
						</tr>
						<?php
					}
					?>
				</tbody>
			</table>
		</div>
	</div>
</section>
