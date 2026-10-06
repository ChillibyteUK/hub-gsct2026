<?php
/**
 * Block template for HUB Dividend Calculator.
 *
 * Inputs stack in the left column; the yellow results card sits in the
 * middle column; the counted-payments table plus disclaimer follow below.
 * Calculation itself runs server-side via GET hub/v1/dividend-calc — the
 * browser never sees the API key — with results announced through an
 * aria-live region.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$title      = $attributes['title'] ?? '';
$disclaimer = $attributes['disclaimer'] ?? '';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-dividend-calculator' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( '' !== trim( $title ) ) {
			?>
			<h2 class="h3-data-m"><?= esc_html( $title ); ?></h2>
			<?php
		}
		?>
		<div class="row">
			<div class="col-12 col-md-6 col-lg-4">
				<form class="hub-dividend-calculator__form" data-div-calc data-endpoint="<?= esc_attr( esc_url_raw( rest_url( 'hub/v1/dividend-calc' ) ) ); ?>" novalidate>
					<div class="hub-dividend-calculator__field">
						<label for="<?= esc_attr( $hub_start_id = wp_unique_id( 'hub-div-calc-start-' ) ); ?>">Start date of investment</label>
						<input type="date" id="<?= esc_attr( $hub_start_id ); ?>" name="start" required max="<?= esc_attr( gmdate( 'Y-m-d' ) ); ?>">
					</div>
					<div class="hub-dividend-calculator__field">
						<label for="<?= esc_attr( $hub_end_id = wp_unique_id( 'hub-div-calc-end-' ) ); ?>">End date of investment</label>
						<input type="date" id="<?= esc_attr( $hub_end_id ); ?>" name="end" required max="<?= esc_attr( gmdate( 'Y-m-d' ) ); ?>">
					</div>
					<div class="hub-dividend-calculator__field">
						<label for="<?= esc_attr( $hub_shares_id = wp_unique_id( 'hub-div-calc-shares-' ) ); ?>">Number of shares</label>
						<input type="number" id="<?= esc_attr( $hub_shares_id ); ?>" name="shares" required min="1" step="1" inputmode="numeric">
					</div>
					<div class="hub-dividend-calculator__actions">
						<button type="submit" class="btn" data-div-calc-submit>Calculate</button>
					</div>
					<p class="hub-dividend-calculator__error" data-div-calc-error hidden></p>
				</form>
			</div>
			<div class="col-12 col-md-6 col-lg-4">
				<div class="hub-dividend-calculator__card" data-div-calc-results hidden>
					<div class="hub-dividend-calculator__result">
						<div class="text-label text-uppercase">Total dividend amount</div>
						<div class="h2-data-l"><span data-div-calc-total>–</span> <span class="h3-data-m">GBp</span></div>
					</div>
					<div class="hub-dividend-calculator__divider" aria-hidden="true"></div>
					<div class="hub-dividend-calculator__result">
						<div class="text-label text-uppercase">Dividend yield (per share)</div>
						<div class="h2-data-l" data-div-calc-yield>–</div>
						<p class="hub-dividend-calculator__yield-note text-body" data-div-calc-yield-note hidden></p>
					</div>
				</div>
			</div>
		</div>
		<div class="hub-dividend-calculator__payments" data-div-calc-payments hidden>
			<table class="hub-dividends__table">
				<thead>
					<tr>
						<th scope="col">Ex-dividend date</th>
						<th scope="col">Payment date</th>
						<th scope="col">Dividend type</th>
						<th scope="col" class="hub-dividends__value-col">Dividend (GBp)</th>
						<th scope="col">Number of shares</th>
						<th scope="col" class="hub-dividends__value-col">Amount (GBP)</th>
					</tr>
				</thead>
				<tbody data-div-calc-payment-rows></tbody>
			</table>
		</div>
		<?php
		if ( '' !== trim( $disclaimer ) ) {
			?>
			<p class="hub-dividend-calculator__note text-body"><?= esc_html( $disclaimer ); ?></p>
			<?php
		}
		?>
		<div class="screen-reader-text" aria-live="polite" data-div-calc-live></div>
	</div>
</section>
