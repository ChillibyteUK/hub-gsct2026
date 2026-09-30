<?php
/**
 * Block template for HUB How To Invest Full.
 *
 * Long-form section: title/intro, platforms (logo repeater with optional
 * links), three fixed vehicle cards, listing intro, risk wording. Semantic
 * markup with hub- hooks throughout; visual design lives in CSS.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle          = $attributes['title'] ?? '';
$intro           = $attributes['intro'] ?? '';
$platforms_title = $attributes['platformsTitle'] ?? '';
$platforms_intro = $attributes['platformsIntro'] ?? '';
$platforms       = $attributes['platforms'] ?? array();
$platforms_footer = $attributes['platformsFooter'] ?? '';
$vehicles_title  = $attributes['vehiclesTitle'] ?? '';
$vehicles        = array();
for ( $i = 1; $i <= 3; $i++ ) {
	$vehicle_title   = $attributes[ "vehicle{$i}Title" ] ?? '';
	$vehicle_content = $attributes[ "vehicle{$i}Content" ] ?? '';
	if ( $vehicle_title || $vehicle_content ) {
		$vehicles[] = array(
			'title'   => $vehicle_title,
			'content' => $vehicle_content,
		);
	}
}
$listing_title = $attributes['listingTitle'] ?? '';
$listing_intro = $attributes['listingIntro'] ?? '';
$risk_title    = $attributes['riskTitle'] ?? '';
$risk_wording  = $attributes['riskWording'] ?? '';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-how-to-invest-full' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( $btitle ) {
			?>
			<h2 class="display-l"><?= esc_html( $btitle ); ?></h2>
			<?php
		}
		if ( $intro ) {
			?>
			<div class="hub-how-to-invest-full__intro text-body-l"><?= wp_kses_post( $intro ); ?></div>
			<?php
		}
		if ( $platforms_title ) {
			?>
			<h3><?= esc_html( $platforms_title ); ?></h3>
			<?php
		}
		if ( $platforms_intro ) {
			?>
			<div class="hub-how-to-invest-full__platforms-intro text-body-l mb-4"><?= wp_kses_post( $platforms_intro ); ?></div>
			<?php
		}
		if ( $platforms ) {
			?>
			<div class="hub-how-to-invest-full__platforms mb-5">
				<?php
				foreach ( $platforms as $platform ) {
					$logo_url  = $platform['logoUrl'] ?? '';
					$link_url  = $platform['linkUrl'] ?? '';
					if ( ! $logo_url ) {
						continue;
					}
					if ( $link_url ) {
						?>
						<a class="hub-how-to-invest-full__platform" href="<?= esc_url( $link_url ); ?>"><img src="<?= esc_url( $logo_url ); ?>" alt=""></a>
						<?php
					} else {
						?>
						<span class="hub-how-to-invest-full__platform"><img src="<?= esc_url( $logo_url ); ?>" alt=""></span>
						<?php
					}
				}
				?>
			</div>
			<?php
		}
		if ( $platforms_footer ) {
			?>
			<div class="hub-how-to-invest-full__platforms-footer"><?= wp_kses_post( $platforms_footer ); ?></div>
			<?php
		}
		if ( $vehicles_title ) {
			?>
			<h3 class="mb-4"><?= esc_html( $vehicles_title ); ?></h3>
			<?php
		}
		if ( $vehicles ) {
			?>
			<div class="hub-how-to-invest-full__vehicles row gap-4 mb-5">
				<?php
				foreach ( $vehicles as $vehicle ) {
					?>
					<div class="hub-how-to-invest-full__vehicle col-12 col-lg-4">
						<?php
						if ( $vehicle['title'] ) {
							?>
							<h4><?= esc_html( $vehicle['title'] ); ?></h4>
							<?php
						}
						if ( $vehicle['content'] ) {
							?>
							<div class="hub-how-to-invest-full__vehicle-content"><?= wp_kses_post( $vehicle['content'] ); ?></div>
							<?php
						}
						?>
					</div>
					<?php
				}
				?>
			</div>
			<?php
		}
		if ( $listing_title ) {
			?>
			<h3><?= esc_html( $listing_title ); ?></h3>
			<?php
		}
		if ( $listing_intro ) {
			?>
			<div class="hub-how-to-invest-full__listing-intro text-body-l"><?= wp_kses_post( $listing_intro ); ?></div>
			<?php
		}
		if ( $risk_title ) {
			?>
			<div class="text-eyebrow"><?= esc_html( $risk_title ); ?></div>
			<?php
		}
		if ( $risk_wording ) {
			?>
			<div class="hub-how-to-invest-full__risk-wording"><?= wp_kses_post( $risk_wording ); ?></div>
			<?php
		}
		?>
	</div>
</section>
