<?php
/**
 * Block template for HUB Latest Posts and Documents.
 *
 * Two swipeable groups on the sunset gradient: the three latest posts as
 * Related Insights cards, then the site-wide featured documents
 * (featured_documents setting, same source as the Document Library Hero)
 * as hero cards. Deliberately composition, not new components — post-card
 * markup/classes, footer, dots and the dot-carousel JS all come from HUB
 * Related Insights (src/js/related-insights.js scopes each
 * [data-hub-carousel] group independently); document-card markup/classes
 * come from HUB Document Library Hero (card-building duplicated here —
 * that block's render.php stays canonical).
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$posts_title = $attributes['postsTitle'] ?? '';
$docs_title  = $attributes['docsTitle'] ?? '';

$insights_url = ( $attributes['insightsLinkUrl'] ?? '' ) ? $attributes['insightsLinkUrl'] : get_post_type_archive_link( 'post' );
$docs_url     = ( $attributes['documentsLinkUrl'] ?? '' ) ? $attributes['documentsLinkUrl'] : home_url( '/documents/' );

$hub_posts = get_posts(
	array(
		'post_type'      => 'post',
		'posts_per_page' => 3,
		'post_status'    => 'publish',
		'orderby'        => 'date',
		'order'          => 'DESC',
	)
);

$hub_docs = array_values(
	array_filter(
		hub_gsct2026_get_repeater_setting( 'featured_documents' ),
		static function ( $row ) {
			$row = (array) $row;
			return '' !== trim( (string) ( $row['title'] ?? '' ) ) || ! empty( $row['file'] );
		}
	)
);

if ( ! $hub_posts && ! $hub_docs ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-latest-posts-docs' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( $hub_posts ) {
			?>
			<div data-hub-carousel>
				<?php
				if ( '' !== trim( $posts_title ) ) {
					?>
					<h2 class="hub-related-insights__title"><?= esc_html( $posts_title ); ?></h2>
					<?php
				}
				?>
				<div class="hub-related-insights__track">
					<?php
					foreach ( $hub_posts as $hub_post ) {
						$hub_thumb = get_the_post_thumbnail(
							$hub_post->ID,
							'medium_large',
							array( 'alt' => get_the_title( $hub_post->ID ) )
						);

						$hub_primary_cat = null;
						foreach ( (array) get_the_category( $hub_post->ID ) as $hub_cat ) {
							if ( 'uncategorized' !== $hub_cat->slug ) {
								$hub_primary_cat = $hub_cat;
								break;
							}
						}

						$hub_meta = sprintf(
							'%s · Article',
							get_the_date( 'j M Y', $hub_post->ID )
						);
						?>
					<a class="hub-related-insights__card" data-hub-carousel-card href="<?= esc_url( get_permalink( $hub_post->ID ) ); ?>">
						<span class="hub-related-insights__media<?= $hub_thumb ? '' : ' hub-related-insights__media--empty'; ?>">
							<?= $hub_thumb; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core image function already escapes. ?>
							<?php
							if ( $hub_primary_cat ) {
								?>
							<span class="hub-insight-card__badge"><?= esc_html( $hub_primary_cat->name ); ?></span>
								<?php
							}
							?>
						</span>
						<span class="hub-related-insights__card-title editorial-s"><?= esc_html( get_the_title( $hub_post->ID ) ); ?></span>
						<span class="hub-related-insights__meta"><?= esc_html( $hub_meta ); ?></span>
					</a>
						<?php
					}
					?>
				</div>
				<div class="hub-related-insights__footer">
					<div class="hub-related-insights__dots" aria-hidden="true">
						<?php
						foreach ( array_keys( $hub_posts ) as $hub_dot_index ) {
							?>
						<button type="button" class="hub-related-insights__dot<?= 0 === $hub_dot_index ? ' is-active' : ''; ?>" data-hub-related-dot="<?= esc_attr( $hub_dot_index ); ?>" tabindex="-1"></button>
							<?php
						}
						?>
					</div>
					<a class="text-link hub-related-insights__link" href="<?= esc_url( $insights_url ); ?>">
						<span class="hub-related-insights__link-text">All insights</span>
						<svg class="hub-related-insights__link-arrow" width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 7.4H17M9 13.8L17 7.4L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</a>
				</div>
			</div>
			<?php
		}
		if ( $hub_docs ) {
			?>
			<div data-hub-carousel class="hub-latest-posts-docs__docs">
				<?php
				if ( '' !== trim( $docs_title ) ) {
					?>
					<h2 class="hub-related-insights__title"><?= esc_html( $docs_title ); ?></h2>
					<?php
				}
				?>
				<div class="hub-related-insights__track">
					<?php
					foreach ( $hub_docs as $card ) {
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
								$file_size = hub_gsct2026_format_file_size( filesize( $file_path ) );
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
						<<?= $tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- hardcoded 'a' or 'div', not stored input. ?> class="hub-document-library-hero__card" data-hub-carousel-card<?= $href; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?><?= $file_url ? ' aria-label="' . esc_attr( $label ) . '"' : ''; ?>>
						<?php
						if ( '' !== trim( (string) $card_title ) ) {
							?>
							<h3 class="hub-document-library-hero__card-title h3-data-m"><?= esc_html( $card_title ); ?></h3>
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
						<?php
					}
					?>
				</div>
				<div class="hub-related-insights__footer">
					<div class="hub-related-insights__dots" aria-hidden="true">
						<?php
						foreach ( array_keys( $hub_docs ) as $hub_dot_index ) {
							?>
						<button type="button" class="hub-related-insights__dot<?= 0 === $hub_dot_index ? ' is-active' : ''; ?>" data-hub-related-dot="<?= esc_attr( $hub_dot_index ); ?>" tabindex="-1"></button>
							<?php
						}
						?>
					</div>
					<a class="text-link hub-related-insights__link" href="<?= esc_url( $docs_url ); ?>">
						<span class="hub-related-insights__link-text">All documents</span>
						<svg class="hub-related-insights__link-arrow" width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 7.4H17M9 13.8L17 7.4L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</a>
				</div>
			</div>
			<?php
		}
		?>
	</div>
</section>
