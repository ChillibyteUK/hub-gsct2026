<?php
/**
 * Block template for HUB Cards Section.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$background_url = $attributes['backgroundUrl'] ?? '';

$btitle = $attributes['title'] ?? '';
$cards  = $attributes['cards'] ?? array();

$link_text = $attributes['linkText'] ?? '';
$link_url  = $attributes['linkUrl'] ?? '';



$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-cards-section' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>
	<?php
	if ( $background_url ) {
		?>
		style="background-image: url(<?= esc_url( $background_url ); ?>);"
		<?php
	}
	?>
	>
	<div class="hub-cards-section__overlay" aria-hidden="true"></div>
	<div class="container py-6">
		<?php
		if ( $btitle ) {
			?>
		<h2 class="has-white-color"><?= esc_html( $btitle ); ?></h2>
			<?php
		}
		if ( $cards ) {
			$loop_index = 0;

			$position_classes = array( 'hub-cards-section__card--first', 'hub-cards-section__card--second', 'hub-cards-section__card--third' );
			?>
		<div class="row gap-4 mb-4">
			<?php
			foreach ( $cards as $item ) {
				$position_class = $position_classes[ $loop_index ] ?? '';
				?>
			<div class="col-12 col-md-4 hub-cards-section__card<?= $position_class ? ' ' . esc_attr( $position_class ) : ''; ?>">
				<?php
				$card_title = $item['cardTitle'] ?? '';
				if ( $card_title ) {
					?>
				<h3><?= esc_html( $card_title ); ?></h3>
					<?php
				}
				$card_content = $item['cardContent'] ?? '';
				if ( $card_content ) {
					?>
				<div><?= wp_kses_post( wpautop( $card_content ) ); ?></div>
					<?php
				}
				?>
				<div class="hub-cards-section__number decorative-numeral"><?= esc_html( $loop_index + 1 ); ?></div>
			</div>
				<?php
				++$loop_index;
			}

			?>
		</div>
			<?php
		}
		?>
		<?php
		if ( $link_url ) {
			?>
			<a class="text-link hub-cards-section__link" href="<?= esc_url( $link_url ); ?>">
				<span class="hub-cards-section__link-text"><?= esc_html( $link_text ? $link_text : $link_url ); ?></span>
				<svg class="hub-cards-section__link-arrow" width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 7.4H17M9 13.8L17 7.4L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</a>
			<?php
		}
		?>
	</div>
</section>
