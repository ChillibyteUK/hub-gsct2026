<?php
/**
 * Block template for HUB Pullquote.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$quote       = $attributes['quote'] ?? '';
$attribution = $attributes['attribution'] ?? '';
$image_url   = $attributes['imageUrl'] ?? '';
$image_alt   = $attributes['imageAlt'] ?? '';
$focal_point = $attributes['focalPoint'] ?? array(
	'x' => 0.5,
	'y' => 0.5,
);
$focal_x_pct = round( ( $focal_point['x'] ?? 0.5 ) * 100, 2 );
$focal_y_pct = round( ( $focal_point['y'] ?? 0.5 ) * 100, 2 );

$crosshair_url = get_template_directory_uri() . '/blocks/hub-pullquote/assets/crosshair.svg';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-pullquote' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-6">
		<div class="row gap-5">
			<div class="col-12 col-lg-6">
				<?php
				if ( $quote ) {
					?>
				<div class="pullquote-l  text-wrap-pretty mb-4"><?= wp_kses_post( $quote ); ?></div>
					<?php
				}
				if ( $attribution ) {
					?>
				<div class="text-attribution has-black-color mt-4"><?= esc_html( $attribution ); ?></div>
					<?php
				}
				?>
			</div>
			<div class="col-12 col-lg-6 d-flex justify-content-center">
				<?php
				if ( $image_url ) {
					?>
				<div class="hub-pullquote__media">
					<img class="hub-pullquote__image" src="<?= esc_url( $image_url ); ?>" alt="<?= esc_attr( $image_alt ); ?>" style="object-position: <?= esc_attr( $focal_x_pct ); ?>% <?= esc_attr( $focal_y_pct ); ?>%;">
					<img class="hub-pullquote__crosshair" src="<?= esc_url( $crosshair_url ); ?>" alt="" aria-hidden="true" style="left: <?= esc_attr( $focal_x_pct ); ?>%; top: <?= esc_attr( $focal_y_pct ); ?>%;">
				</div>
					<?php
				}
				?>
			</div>
		</div>
	</div>
</section>
