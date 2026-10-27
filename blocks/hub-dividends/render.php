<?php
/**
 * Block template for HUB Dividends.
 *
 * Bundles the Investis Dividend Centre overview tool (latest dividend,
 * annual chart and history): the container div plus its script and
 * stylesheet — same URLs as the standalone snippet, loaded via the enqueue
 * API so WordPress manages order (the script handle is shared with the other
 * Investis blocks, so it loads once per page). The tool renders everything
 * client-side; src/blocks/dividends.css re-skins it on top of the tool's own
 * stylesheet. Below it sits the full dividend history table (see below).
 *
 * The second stylesheet in the snippet (the Columbia Threadneedle client
 * skin) is deliberately NOT enqueued: it only carries CT branding that this
 * block replaces, so loading it would just add competing rules to override.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

wp_enqueue_script(
	'investis-ir',
	'https://assets.investisdigital.com/nextgentools/v3/scripts/ir.js',
	array(),
	null,
	true
);
wp_enqueue_style(
	'investis-ngt-market',
	'https://assets.investisdigital.com/nextgentools/v3/assets/ngt-market-main.css',
	array(),
	null
);

// The Investis overview tool has no history table, so the full ex-dividend
// history stays here, from the corporate actions API: searchable, ten rows
// at a time, with a CSV download (src/js/dividend-history.js).
$hub_events   = hub_gsct2026_get_dividend_events();
$hub_fmt_date = static function ( $ymd ) {
	$time = strtotime( $ymd );
	return false !== $time ? wp_date( 'd M Y', $time ) : $ymd;
};

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-dividends' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<div data-lang="en-GB" id="invd-container-dvc-1451-358-dvc-gobal-smaller" data-path="marketdatatools/dividendcenter/clients" data-client="1451" data-config="dvc-1451-358-dvc-gobal-smaller" data-active="true" class="invd-container dvc-gobal-smaller gsct-dvc-overview"></div>
		<?php
		if ( $hub_events ) {
			?>
		<h2 class="h3-data-m hub-dividends__history-title">Dividend history</h2>
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
		<?php
		}
		?>
	</div>
</section>
