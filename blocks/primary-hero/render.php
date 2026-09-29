<?php
/**
 * Block template for Primary Hero.
 *
 * Practice block for a responsive crosshair over an image background,
 * positioned via the FocalPointPicker. The crosshair graphic is a hardcoded
 * test asset (blocks/primary-hero/assets/crosshair.svg); the background image
 * is a real file field (backgroundId/backgroundUrl/backgroundAlt), falling
 * back to the hardcoded test photo (assets/background.avif) until one is
 * chosen. Heading/intro/CTAs are plain attributes edited directly in the
 * canvas, not InnerBlocks — same pattern as blocks/hero.
 *
 * The primary CTA is a plain link. The secondary CTA takes a Vimeo URL and
 * button text, and opens the video in a native <dialog> modal (wired by
 * src/js/dialog.js via data-dialog-target; the iframe only loads on open
 * and unloads on close) — anything that isn't a Vimeo link falls back to
 * a plain link like the primary CTA.
 *
 * Media and content are siblings, not an overlay — image left / content
 * right above md, stacked (image on top) below it — see
 * src/blocks/primary-hero.css. The crosshair still tracks the focal point at
 * every size; see src/js/primary-hero.js for why that needs computing by hand
 * rather than relying on object-position alone.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$focal_point = $attributes['focalPoint'] ?? array(
	'x' => 0.5,
	'y' => 0.5,
);

$focal_x = $focal_point['x'] ?? 0.5;
$focal_y = $focal_point['y'] ?? 0.5;

$background_url = $attributes['backgroundUrl'] ?? '';
$background_alt = $attributes['backgroundAlt'] ?? '';
if ( ! $background_url ) {
	$background_url = get_template_directory_uri() . '/blocks/primary-hero/assets/background.avif';
}
$crosshair_url = get_template_directory_uri() . '/blocks/primary-hero/assets/crosshair.svg';

$heading            = $attributes['heading'] ?? '';
$intro_text         = $attributes['introText'] ?? '';
$primary_cta_text   = $attributes['primaryCtaText'] ?? '';
$primary_cta_url    = $attributes['primaryCtaUrl'] ?? '';
$secondary_cta_text = $attributes['secondaryCtaText'] ?? '';
$secondary_cta_url  = $attributes['secondaryCtaUrl'] ?? '';
$video_embed_url    = hub_gsct2026_get_vimeo_embed_url( $secondary_cta_url );
$video_button_text  = $secondary_cta_text ? $secondary_cta_text : __( 'Play video', 'hub-gsct2026' );

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-gsct2026-primary-hero' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<?php /* --focal-x/--focal-y are plain fractions (0–1), not percentages — src/blocks/primary-hero.css and src/js/primary-hero.js multiply them directly against lengths. */ ?>
	<div class="hub-gsct2026-primary-hero__media" style="--focal-x: <?php echo esc_attr( $focal_x ); ?>; --focal-y: <?php echo esc_attr( $focal_y ); ?>;">
		<img class="hub-gsct2026-primary-hero__background" src="<?php echo esc_url( $background_url ); ?>" alt="<?php echo esc_attr( $background_alt ); ?>">
		<div class="hub-gsct2026-primary-hero__overlay" aria-hidden="true"></div>
		<img class="hub-gsct2026-primary-hero__crosshair" src="<?php echo esc_url( $crosshair_url ); ?>" alt="" aria-hidden="true">
	</div>
	<?php if ( $heading || $intro_text || $primary_cta_url || $secondary_cta_url ) { ?>
		<div class="hub-gsct2026-primary-hero__content">
			<?php if ( $heading ) { ?>
				<h1 class="hub-gsct2026-primary-hero__heading display-xxl has-brand-yellow-color"><?php echo wp_kses_post( $heading ); ?></h1>
			<?php } ?>
			<?php if ( $intro_text ) { ?>
				<p class="hub-gsct2026-primary-hero__intro"><?php echo wp_kses_post( $intro_text ); ?></p>
			<?php } ?>
			<?php if ( $primary_cta_url || $secondary_cta_url ) { ?>
				<div class="hub-gsct2026-primary-hero__ctas">
					<?php if ( $primary_cta_url ) { ?>
						<a class="btn btn-yellow" href="<?php echo esc_url( $primary_cta_url ); ?>"><?php echo esc_html( $primary_cta_text ? $primary_cta_text : $primary_cta_url ); ?></a>
					<?php } ?>
					<?php if ( $secondary_cta_url ) { ?>
						<?php if ( $video_embed_url ) { ?>
							<?php $video_dialog_id = wp_unique_id( 'hub-gsct2026-primary-hero-video-' ); ?>
							<button class="btn btn-yellow-outline hub-gsct2026-primary-hero__video-trigger" type="button" data-dialog-target="<?php echo esc_attr( $video_dialog_id ); ?>"><?php echo esc_html( $video_button_text ); ?></button>
							<dialog class="hub-gsct2026-primary-hero__video-dialog" id="<?php echo esc_attr( $video_dialog_id ); ?>" aria-label="<?php echo esc_attr( $video_button_text ); ?>">
								<button class="hub-gsct2026-primary-hero__video-close" type="button" data-dialog-close aria-label="<?php esc_attr_e( 'Close video', 'hub-gsct2026' ); ?>">×</button>
								<div class="hub-gsct2026-primary-hero__video">
									<iframe data-src="<?php echo esc_url( $video_embed_url ); ?>" title="<?php echo esc_attr( $video_button_text ); ?>" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
								</div>
							</dialog>
						<?php } else { ?>
							<a class="btn hub-gsct2026-primary-hero__cta-secondary" href="<?php echo esc_url( $secondary_cta_url ); ?>"><?php echo esc_html( $secondary_cta_text ? $secondary_cta_text : $secondary_cta_url ); ?></a>
						<?php } ?>
					<?php } ?>
				</div>
			<?php } ?>
		</div>
	<?php } ?>
</section>
