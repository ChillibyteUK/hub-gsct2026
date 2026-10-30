<?php
/**
 * Block template for HUB How to Invest.
 *
 * Content lives in Site-Wide Settings → How to Invest tab (read with
 * hub_gsct2026_get_setting( 'how_to_invest_*' )) — rendering to come.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle     = hub_gsct2026_get_setting( 'how_to_invest_title' );
$intro      = hub_gsct2026_get_setting( 'how_to_invest_intro' );
$link_text  = hub_gsct2026_get_setting( 'how_to_invest_link_text' );
$link_url   = hub_gsct2026_get_setting( 'how_to_invest_link_url' );
$risk_title = hub_gsct2026_get_setting( 'how_to_invest_risk_title' );
$risk_text  = hub_gsct2026_get_setting( 'how_to_invest_risk_wording' );

// Logos are rows of [ logo => attachment ID, url => optional link ].
$logos = hub_gsct2026_get_how_to_invest_logos();

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-how-to-invest has-brand-yellow-background-color' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-6">
		<?php
		if ( $btitle ) {
			?>
		<h2 class="display-l"><?= esc_html( $btitle ); ?></h2>
			<?php
		}
		if ( $intro ) {
			?>
		<div class="intro"><?= wp_kses_post( $intro ); ?></div>
			<?php
		}
		if ( $logos ) {
			?>
		<div class="logos row mt-5 mb-4">
			<?php
			foreach ( $logos as $logo ) {
				$logo_id  = absint( $logo['logo'] );
				$logo_url = trim( (string) ( $logo['url'] ?? '' ) );
				$image    = wp_get_attachment_image( $logo_id, 'full' );
				if ( ! $image ) {
					continue;
				}

				if ( ! $logo_url ) {
					?>
				<div class="col-6 col-lg-3 logos__logo">
					<?= $image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() escapes. ?>
				</div>
					<?php
					continue;
				}

				// A linked logo's only content is the image, so it needs an
				// accessible name: media library alt first, then a
				// filename-derived fallback (same as How To Invest Full).
				$logo_alt = trim( (string) get_post_meta( $logo_id, '_wp_attachment_image_alt', true ) );
				if ( '' === $logo_alt ) {
					$logo_alt = preg_replace( '/[-_]+/', ' ', pathinfo( (string) get_attached_file( $logo_id ), PATHINFO_FILENAME ) );
					$logo_alt = ucwords( trim( preg_replace( '/\s+\d+$/', '', (string) $logo_alt ) ) );
					$image    = wp_get_attachment_image( $logo_id, 'full', false, array( 'alt' => $logo_alt ) );
				}
				?>
				<a class="col-6 col-lg-3 logos__logo" href="<?= esc_url( $logo_url ); ?>" target="_blank" rel="noopener"><?= $image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() escapes. ?></a>
				<?php
			}
			?>
		</div>
			<?php
		}
		?>
		<small class="text-muted">All intellectual property rights in the brands and logos above are reserved by respective owners.</small>
		<?php

		if ( $link_url ) {
			?>
			<a class="text-link hub-how-to-invest__link" href="<?= esc_url( $link_url ); ?>">
				<span class="hub-how-to-invest__link-text"><?= esc_html( $link_text ? $link_text : $link_url ); ?></span>
				<svg class="hub-how-to-invest__link-arrow" width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 7.4H17M9 13.8L17 7.4L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</a>
			<?php
		}
		if ( $risk_title || $risk_text ) {
			?>
		<div class="risk mt-5">
			<?php
			if ( $risk_title ) {
				?>
			<h3 class="text-eyebrow"><?= esc_html( $risk_title ); ?></h3>
				<?php
			}
			if ( $risk_text ) {
				?>
			<div class="risk-text"><?= wp_kses_post( $risk_text ); ?></div>
				<?php
			}
			?>
		</div>
			<?php
		}
		?>
	</div>
</section>
