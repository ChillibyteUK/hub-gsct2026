<?php
/**
 * Block template for HUB Form.
 *
 * Standalone counterpart to HUB Content Block's Form media type — same
 * shortcode-in-a-box treatment (hub-content-block__form*, shared via
 * src/blocks/content-block.css) reused as-is rather than duplicating it,
 * just without the text/media two-column layout around it.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$form_title     = $attributes['formTitle'] ?? '';
$form_shortcode = $attributes['formShortcode'] ?? '';

if ( ! $form_shortcode ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-form' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-6">
		<div class="row">
			<div class="col-md-8 offset-md-2 col-lg-6 offset-lg-3">
				<div class="hub-content-block__form">
					<?php
					if ( $form_title ) {
						?>
						<h3 class="hub-content-block__form-title h3-data-m"><?= esc_html( $form_title ); ?></h3>
						<?php
					}
					?>
					<?= do_shortcode( $form_shortcode ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- shortcode output is trusted editor input, not user-submitted. ?>
				</div>
			</div>
		</div>
	</div>
</section>
