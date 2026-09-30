<?php
/**
 * Block template for HUB Timeline.
 *
 * Horizontal scroll-snap slider on desktop (left edge in the container,
 * right edge bleeding to the viewport), plain stack on mobile. Arrows
 * scroll by one card via src/js/timeline.js — no slider library. Dot
 * colours are positional (odd blue, even alternating pink/red) — tell us
 * the real rule or they get a per-row field.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$intro    = $attributes['intro'] ?? '';
$years    = $attributes['years'] ?? array();
$footnote = $attributes['footnote'] ?? '';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-timeline py-6' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container pt-6 pb-5">
		<?php
		if ( $intro ) {
			?>
			<div class="hub-timeline__intro editorial-m"><?= wp_kses_post( $intro ); ?></div>
			<?php
		}
		?>
	</div>
	<?php
	if ( $years ) {
		?>
		<div class="hub-timeline__track-wrap">
			<div class="hub-timeline__track" tabindex="0" role="region" aria-label="<?= esc_attr__( 'Company history timeline', 'hub-gsct2026' ); ?>" data-lenis-prevent>
				<?php
				foreach ( $years as $item ) {
					$tyear   = $item['year'] ?? '';
					$ttitle  = $item['title'] ?? '';
					$content = $item['content'] ?? '';
					?>
					<article class="hub-timeline__slide">
						<span class="hub-timeline__dot" aria-hidden="true"></span>
						<?php
						if ( $tyear ) {
							?>
							<div class="hub-timeline__year display-l"><?= esc_html( $tyear ); ?></div>
							<?php
						}
						if ( $ttitle ) {
							?>
							<h3 class="hub-timeline__title text-body-l-medium"><?= esc_html( $ttitle ); ?></h3>
							<?php
						}
						if ( $content ) {
							?>
							<div class="hub-timeline__content text-body"><?= wp_kses_post( wpautop( $content ) ); ?></div>
							<?php
						}
						?>
					</article>
					<?php
				}
				?>
			</div>
			<button class="hub-timeline__prev" type="button" aria-label="<?= esc_attr__( 'Previous slide', 'hub-gsct2026' ); ?>">
				<svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="transform: scaleX(-1);"><path d="M1 7.4H17M9 13.8L17 7.4L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>
			<button class="hub-timeline__next" type="button" aria-label="<?= esc_attr__( 'Next slide', 'hub-gsct2026' ); ?>">
				<svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 7.4H17M9 13.8L17 7.4L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>
		</div>
		<?php
	}
	if ( $footnote ) {
		?>
		<div class="container pb-6">
			<p class="hub-timeline__footnote text-body"><?= esc_html( $footnote ); ?></p>
		</div>
		<?php
	}
	?>
</section>
