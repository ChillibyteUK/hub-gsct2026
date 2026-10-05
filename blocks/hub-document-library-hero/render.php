<?php
/**
 * Block template for HUB Document Library Hero.
 *
 * Sunset-gradient hero (same fixed gradient as HUB Nav Cards): big title,
 * intro, then a cards heading and three document cards. Each card is a
 * single download link wrapping the whole card — title, a meta line of
 * manual UK date plus file type/size derived from the uploaded attachment,
 * and a Download row with an inline icon.
 *
 * The cards themselves live in Site-Wide Settings → Documents
 * (featured_documents), not on the block — one set of cards for every
 * page using this hero.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle      = $attributes['title'] ?? '';
$intro       = $attributes['intro'] ?? '';
$cards_title = $attributes['cardsTitle'] ?? '';
$cards       = array_values(
	array_filter(
		hub_gsct2026_get_repeater_setting( 'featured_documents' ),
		static function ( $row ) {
			$row = (array) $row;
			return '' !== trim( (string) ( $row['title'] ?? '' ) ) || ! empty( $row['file'] );
		}
	)
);

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-document-library-hero' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container pt-6">
		<?php
		if ( '' !== trim( $btitle ) ) {
			?>
			<h1 class="hub-document-library-hero__title display-xl"><?= esc_html( $btitle ); ?></h1>
			<?php
		}
		if ( '' !== trim( $intro ) ) {
			?>
			<div class="hub-document-library-hero__intro"><?= wp_kses_post( wpautop( $intro ) ); ?></div>
			<?php
		}
		if ( '' !== trim( $cards_title ) ) {
			?>
			<h2 class="hub-document-library-hero__cards-title h2-data-l"><?= esc_html( $cards_title ); ?></h2>
			<?php
		}
		if ( $cards ) {
			?>
			<div class="row gap-5 hub-document-library-hero__cards">
				<?php
				foreach ( $cards as $card ) {
					$card        = (array) $card;
					$card_title  = $card['title'] ?? '';
					$card_date   = trim( (string) ( $card['date'] ?? '' ) );
					$file_id     = (int) ( $card['file'] ?? 0 );
					$file_url    = $file_id ? wp_get_attachment_url( $file_id ) : '';
					$file_detail = '';

					if ( $file_url ) {
						$file_ext = hub_gsct2026_get_attachment_ext( $file_id );

						$file_size = '';
						$file_path = get_attached_file( $file_id );
						if ( $file_path && file_exists( $file_path ) ) {
							$bytes = filesize( $file_path );
							if ( false !== $bytes ) {
								$file_size = $bytes >= 1048576
									? rtrim( rtrim( number_format( $bytes / 1048576, 1 ), '0' ), '.' ) . 'Mb'
									: round( $bytes / 1024 ) . 'kb';
							}
						}

						if ( $file_ext && $file_size ) {
							$file_detail = $file_ext . ' (' . $file_size . ')';
						} elseif ( $file_ext ) {
							$file_detail = $file_ext;
						} elseif ( $file_size ) {
							$file_detail = '(' . $file_size . ')';
						}
					}

					$meta  = implode( ' · ', array_filter( array( $card_date, $file_detail ) ) );
					$tag   = $file_url ? 'a' : 'div';
					$href  = $file_url ? ' href="' . esc_url( $file_url ) . '" download' : '';
					$label = $card_title ? sprintf( 'Download %s', $card_title ) : 'Download document';
					?>
					<div class="col-12 col-md-4">
						<<?= $tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- hardcoded 'a' or 'div', not stored input. ?> class="hub-document-library-hero__card"<?= $href; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?><?= $file_url ? ' aria-label="' . esc_attr( $label ) . '"' : ''; ?>>
						<?php
						if ( '' !== trim( (string) $card_title ) ) {
							?>
							<h3 class="hub-document-library-hero__card-title editorial-s"><?= esc_html( $card_title ); ?></h3>
							<?php
						}
						if ( '' !== $meta ) {
							?>
							<div class="hub-document-library-hero__card-meta text-body"><?= esc_html( $meta ); ?></div>
							<?php
						}
						if ( $file_url ) {
							?>
							<span class="hub-document-library-hero__download">
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 1v8m0 0 3-3M7 9 4 6M2 11v1.5A.5.5 0 0 0 2.5 13h9a.5.5 0 0 0 .5-.5V11"/></svg>
								<span class="hub-document-library-hero__download-text">Download</span>
							</span>
							<?php
						}
						?>
						</<?= $tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- hardcoded 'a' or 'div', not stored input. ?>>
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
