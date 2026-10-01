<?php
/**
 * Block template for HUB Gradient Hero.
 *
 * Two-column hero on a fixed sunrise/sunset gradient: eyebrow, title,
 * content and CTA buttons left; circular image right. The background comes
 * from a hardcoded allowlist keyed by attribute — never from stored markup —
 * so an unexpected value degrades to sunrise rather than broken CSS.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$hub_gradients = array(
	'sunrise' => 'radial-gradient(120% 120% at 50% 100%, #fff036 0%, #cbe1f2 60%)',
	'sunset'  => 'radial-gradient(120% 120% at 50% 100%, #ff7670 0%, #ffb5ce 50%, #ffd2f7 90%)',
);

$hub_choice = $attributes['backgroundChoice'] ?? 'sunrise';
if ( ! isset( $hub_gradients[ $hub_choice ] ) ) {
	$hub_choice = 'sunrise';
}

$hub_eyebrow         = $attributes['eyebrow'] ?? '';
$hub_title           = $attributes['title'] ?? '';
$hub_content         = $attributes['content'] ?? '';
$hub_primary_text    = $attributes['primaryCtaText'] ?? '';
$hub_primary_url     = $attributes['primaryCtaUrl'] ?? '';
$hub_secondary_text  = $attributes['secondaryCtaText'] ?? '';
$hub_secondary_url   = $attributes['secondaryCtaUrl'] ?? '';
$hub_image_id        = (int) ( $attributes['imageId'] ?? 0 );
$hub_image_url       = $attributes['imageUrl'] ?? '';
$hub_image_alt       = $attributes['imageAlt'] ?? '';
$hub_has_primary_cta = '' !== $hub_primary_text && '' !== $hub_primary_url;
$hub_has_secondary   = '' !== $hub_secondary_text && '' !== $hub_secondary_url;

$hub_image = '';
if ( $hub_image_id ) {
	$hub_image = wp_get_attachment_image( $hub_image_id, 'large', false, array( 'class' => 'hub-gradient-hero__image' ) );
} elseif ( '' !== $hub_image_url ) {
	$hub_image = '<img class="hub-gradient-hero__image" src="' . esc_url( $hub_image_url ) . '" alt="' . esc_attr( $hub_image_alt ) . '">';
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'hub-gradient-hero',
		'style' => 'background: ' . $hub_gradients[ $hub_choice ] . ';',
	)
);
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<div class="row align-items-center">
			<div class="col-12 col-md-6">
				<?php
				if ( '' !== $hub_eyebrow ) {
					?>
				<p class="hub-gradient-hero__eyebrow text-eyebrow"><?= esc_html( $hub_eyebrow ); ?></p>
					<?php
				}
				if ( '' !== $hub_title ) {
					?>
				<h1 class="hub-gradient-hero__title display-xl"><?= esc_html( $hub_title ); ?></h1>
					<?php
				}
				if ( '' !== $hub_content ) {
					?>
				<div class="hub-gradient-hero__content text-body-l"><?= nl2br( esc_html( $hub_content ) ); ?></div>
					<?php
				}
				if ( $hub_has_primary_cta || $hub_has_secondary ) {
					?>
				<div class="hub-gradient-hero__ctas">
					<?php
					if ( $hub_has_primary_cta ) {
						?>
					<a class="btn" href="<?= esc_url( $hub_primary_url ); ?>"><?= esc_html( $hub_primary_text ); ?></a>
						<?php
					}
					if ( $hub_has_secondary ) {
						?>
					<a class="btn btn-outline" href="<?= esc_url( $hub_secondary_url ); ?>"><?= esc_html( $hub_secondary_text ); ?></a>
						<?php
					}
					?>
				</div>
					<?php
				}
				?>
			</div>
			<div class="col-12 col-md-6">
				<?= $hub_image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core/escaped image markup built above. ?>
			</div>
		</div>
	</div>
</section>
