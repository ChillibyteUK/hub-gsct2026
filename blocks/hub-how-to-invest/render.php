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

// Logos store as a CSV of attachment IDs — parse the same way the gallery field renderer does.
$logo_ids = array_filter( array_map( 'absint', explode( ',', hub_gsct2026_get_setting( 'how_to_invest_logos' ) ) ) );

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
		if ( $logo_ids ) {
			?>
		<div class="logos row mt-5 mb-4">
			<?php
			foreach ( $logo_ids as $logo_id ) {
				?>
				<div class="col-6 col-lg-3 logos__logo">
					<?= wp_get_attachment_image( $logo_id, 'full' ); ?>
				</div>
				<?php
			}
			?>
		</div>
			<?php
		}
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
