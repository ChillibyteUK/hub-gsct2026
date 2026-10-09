<?php
/**
 * Block template for HUB 3 Points.
 *
 * A row's content can carry one popover: mark the trigger words inline as
 * [popover]words[/popover] and fill that row's popover fields (title,
 * content, image). The trigger is a <span> so it wraps mid-sentence (a
 * <button> stays atomic); click/keyboard activation is bridged by small
 * delegated handlers in src/js/popover.js, everything else is native
 * (Esc/outside-click/× dismiss free). First marker wins; any others render
 * as plain words. Without the marker (or with empty popover fields) the
 * content renders untouched. Shortcodes (e.g. [contact_phone]) expand in
 * the intro and point content; popover title/body render as plain text.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$eyebrow = $attributes['eyebrow'] ?? '';
$btitle  = $attributes['title'] ?? '';
$intro   = do_shortcode( $attributes['intro'] ?? '' );
$points  = $attributes['points'] ?? array();
$lines   = $attributes['lines'] ?? 'on';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-3-points' . ( 'off' === $lines ? ' hub-3-points--no-lines' : '' ) ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-6">
		<?php
		if ( $eyebrow ) {
			?>
			<div class="text-eyebrow mb-4"><?= esc_html( $eyebrow ); ?></div>
			<?php
		}
		if ( $btitle ) {
			$title_class = 'Black' === ( $attributes['titleColour'] ?? '' ) ? 'has-black-color' : 'has-brand-red-color';
			?>
			<h2 class="h2-data-l <?= esc_attr( $title_class ); ?>"><?= esc_html( $btitle ); ?></h2>
			<?php
		}
		if ( $intro ) {
			?>
			<div class="mb-5 hub-3-points__intro"><?= wp_kses_post( wpautop( $intro ) ); ?></div>
			<?php
		}
		if ( $points ) {
			?>
			<div class="row gap-5 hub-3-points__points">
				<?php
				$loop_index = 0;
				foreach ( $points as $item ) {
					?>
					<div class="col-12 col-md-4 hub-3-points__point">
						<?php
						$big_stat = $item['bigStat'] ?? '';
						if ( $big_stat ) {
							?>
							<div class="display-xl has-brand-red-color mb-2">
								<?= esc_html( $big_stat ); ?>
							</div>
							<?php
						} else {
							?>
							<div class="number text-number-label"><?= esc_html( $loop_index + 1 ); ?></div>
							<?php
						}
						$subtitle = $item['subtitle'] ?? '';
						if ( $subtitle ) {
							?>
							<h3 class="h3-data-m">
								<?= esc_html( $subtitle ); ?>
							</h3>
							<?php
						}
						$content = do_shortcode( $item['content'] ?? '' );
						if ( $content ) {
							$popover_title     = $item['popoverTitle'] ?? '';
							$popover_body      = $item['popoverContent'] ?? '';
							$popover_image_url = $item['popoverImageUrl'] ?? '';
							$has_popover       = ! empty( $item['popover'] )
								&& ( $popover_title || $popover_body || $popover_image_url )
								&& preg_match( '/\[popover\](.*?)\[\/popover\]/s', $content, $marker_match );
							?>
							<div>
								<?php
								if ( $has_popover ) {
									// First marker becomes a plain-text token so it survives
									// wpautop/wp_kses_post inline mid-sentence (splitting
									// before/after into separate wpautop runs stranded the
									// trigger between paragraphs); the rest render as words.
									$trigger         = $marker_match[1];
									$token           = 'HUBPOPOVERTRIGGER';
									$templated       = preg_replace( '/\[popover\](.*?)\[\/popover\]/s', $token, $content, 1 );
									$templated       = preg_replace( '/\[popover\](.*?)\[\/popover\]/s', '$1', $templated );
									$popover_id      = wp_unique_id( 'hub-popover-' );
									$trigger_attrs   = 'class="hub-popover-trigger text-body-dotted-link" tabindex="0" role="button" popovertarget="' . esc_attr( $popover_id ) . '"';
									$trigger_btn     = '<span ' . $trigger_attrs . '>' . esc_html( $trigger ) . '</span>';
									$popover_img_alt = $popover_title ? $popover_title : __( 'Popover image', 'hub-gsct2026' );
									// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- button parts escaped above; content kses-filtered.
									?>
									<?= str_replace( $token, $trigger_btn, wp_kses_post( wpautop( $templated ) ) ); ?>
									<div class="hub-popover" id="<?= esc_attr( $popover_id ); ?>" popover>
										<div class="hub-popover__top">
										<?php
										if ( $popover_image_url ) {
											?>
											<img class="hub-popover__image" src="<?= esc_url( $popover_image_url ); ?>" alt="<?= esc_attr( $popover_img_alt ); ?>">
											<?php
										}
										if ( $popover_title ) {
											?>
											<p class="hub-popover__title text-body-l-medium"><?= esc_html( $popover_title ); ?></p>
											<?php
										}
										?>
											<button class="hub-popover__close" type="button" popovertarget="<?= esc_attr( $popover_id ); ?>" popovertargetaction="hide" aria-label="<?= esc_attr__( 'Close popover', 'hub-gsct2026' ); ?>">×</button>
										</div>
										<?php
										if ( $popover_body ) {
											?>
											<div class="hub-popover__content"><?= wp_kses_post( wpautop( $popover_body ) ); ?></div>
											<?php
										}
										?>
									</div>
									<?php
								} else {
									$plain = preg_replace( '/\[popover\](.*?)\[\/popover\]/s', '$1', $content );
									?>
									<?= wp_kses_post( wpautop( $plain ) ); ?>
									<?php
								}
								?>
							</div>
							<?php
						}
						?>
					</div>
					<?php
					++$loop_index;
				}
				?>
			</div>
			<?php
		}
		?>
	</div>
</section>
