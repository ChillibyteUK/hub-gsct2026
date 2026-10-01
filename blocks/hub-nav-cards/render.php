<?php
/**
 * Block template for HUB Nav Cards.
 *
 * Title + up to three (or however many are added) link cards on the fixed
 * sunset gradient background — same exact gradient value as HUB Gradient
 * Hero's "sunset" choice and HUB Related Insights' pink section.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle = $attributes['title'] ?? '';
$cards  = array_values(
	array_filter(
		(array) ( $attributes['cards'] ?? array() ),
		static function ( $row ) {
			$row = (array) $row;
			return '' !== trim( (string) ( $row['title'] ?? '' ) )
				|| '' !== trim( (string) ( $row['content'] ?? '' ) )
				|| '' !== trim( (string) ( $row['linkUrl'] ?? '' ) );
		}
	)
);

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-nav-cards' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container pb-6">
		<?php
		if ( $btitle ) {
			?>
			<h2 class="hub-nav-cards__title h2-data-l"><?= esc_html( $btitle ); ?></h2>
			<?php
		}
		if ( $cards ) {
			?>
			<div class="row gap-5 hub-nav-cards__cards">
				<?php
				foreach ( $cards as $card ) {
					$card           = (array) $card;
					$card_title     = $card['title'] ?? '';
					$card_content   = $card['content'] ?? '';
					$card_link_url  = $card['linkUrl'] ?? '';
					$card_tag       = $card_link_url ? 'a' : 'div';
					$card_href_attr = $card_link_url ? ' href="' . esc_url( $card_link_url ) . '"' : '';
					?>
					<div class="col-12 col-md-4">
						<<?= $card_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- hardcoded 'a' or 'div', not stored input. ?> class="hub-nav-cards__card"<?= $card_href_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?>>
						<?php
						if ( $card_title ) {
							?>
							<h3 class="hub-nav-cards__card-title h3-data-m"><?= esc_html( $card_title ); ?></h3>
							<?php
						}
						if ( $card_content ) {
							?>
							<div class="hub-nav-cards__card-content text-body"><?= wp_kses_post( wpautop( $card_content ) ); ?></div>
							<?php
						}
						?>
						</<?= $card_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- hardcoded 'a' or 'div', not stored input. ?>>
					</div>
					<?php
				}
				?>
			</div>
			<?php
		}
		?>
	</div>
</section>
