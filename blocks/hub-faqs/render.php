<?php
/**
 * Block template for HUB FAQs.
 *
 * Native <details>/<summary> accordion (see src/css/accordion.css) — items
 * sharing a `name` open single-at-a-time with no JS. Rows queue into the
 * aggregated FAQPage JSON-LD via queue_faq_schema(), output once in the
 * footer by output_faq_schema() (see inc/utilities.php).
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle = $attributes['title'] ?? '';
$faqs   = $attributes['faqs'] ?? array();
$link_text = $attributes['linkText'] ?? '';
$link_url  = $attributes['linkUrl'] ?? '';

$faqs = array_values(
	array_filter(
		$faqs,
		function ( $row ) {
			return '' !== trim( wp_strip_all_tags( (string) ( $row['question'] ?? '' ) ) );
		}
	)
);

if ( $faqs ) {
	queue_faq_schema(
		array_map(
			function ( $row ) {
				return array(
					'question' => $row['question'] ?? '',
					'answer'   => $row['answer'] ?? '',
				);
			},
			$faqs
		)
	);
}

$accordion_name = wp_unique_id( 'hub-faqs-' );

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-faqs' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-6">
		<?php
		if ( $btitle ) {
			?>
			<h2 class="has-brand-red-color text-center mb-5"><?= esc_html( $btitle ); ?></h2>
			<?php
		}
		if ( $faqs ) {
			?>
			<div class="accordion">
				<?php
				foreach ( $faqs as $item ) {
					?>
					<details class="accordion-item" name="<?= esc_attr( $accordion_name ); ?>">
						<summary class="accordion-header">
							<span class="text-link"><?= esc_html( $item['question'] ); ?></span>
							<span class="accordion-icon" aria-hidden="true">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M6 9L12 15L18 9" stroke="#F74333" stroke-width="2" stroke-linecap="round"/>
								</svg>
							</span>
						</summary>
						<div class="accordion-body"><?= wp_kses_post( $item['answer'] ); ?></div>
					</details>
					<?php
				}
				?>
			</div>
			<?php
		}
		if ( $link_url ) {
			?>
			<a class="text-link hub-faqs__link" href="<?= esc_url( $link_url ); ?>">
				<span class="hub-faqs__link-text"><?= esc_html( $link_text ? $link_text : $link_url ); ?></span>
				<svg class="hub-faqs__link-arrow" width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 7.4H17M9 13.8L17 7.4L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</a>
			<?php
		}
		?>
	</div>
</section>
