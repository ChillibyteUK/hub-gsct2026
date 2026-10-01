<?php
/**
 * Block template for HUB Content Block.
 *
 * 50/50 text + media row (stacked below lg). Column order comes from the
 * `order` attribute — the media column takes `order: -1` when media goes
 * first, so the markup stays in one place. Video embeds inline in a 16/9
 * frame via hub_gsct2026_get_vimeo_embed_url(); without a valid Vimeo URL
 * nothing renders in the media column.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$eyebrow    = $attributes['eyebrow'] ?? '';
$btitle     = $attributes['title'] ?? '';
$content    = $attributes['content'] ?? '';
$cta_text   = $attributes['ctaText'] ?? '';
$cta_url    = $attributes['ctaUrl'] ?? '';
$order      = $attributes['order'] ?? 'text-media';
$media_type = $attributes['mediaType'] ?? 'image';

$image_url   = $attributes['imageUrl'] ?? '';
$image_alt   = $attributes['imageAlt'] ?? '';
$aspect      = $attributes['aspectRatio'] ?? '16/9';
$video_embed = hub_gsct2026_get_vimeo_embed_url( $attributes['videoUrl'] ?? '' );

$media_first = 'media-text' === $order;
$full_bleed  = ! empty( $attributes['fullBleed'] ) && 'image' === $media_type && $image_url;
$is_quote    = 'quote' === $media_type;
$is_list     = 'list' === $media_type;
$text_class  = $is_list ? 'col-12 col-lg-8 hub-content-block__text my-auto' : 'col-12 col-lg-6 hub-content-block__text my-auto';
$media_class = $is_list ? 'col-12 col-lg-4 hub-content-block__media my-auto' : 'col-12 col-lg-6 hub-content-block__media';
$media_class .= $media_first ? ' hub-content-block__media--first' : '';
if ( $full_bleed ) {
	$media_class .= $media_first ? ' hub-content-block__media--bleed-left' : ' hub-content-block__media--bleed-right';
}
if ( $is_quote ) {
	$media_class .= $media_first ? ' hub-content-block__quote--left' : ' hub-content-block__quote--right';
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-content-block' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-5">
		<div class="row gap-6">
			<div class="<?= esc_attr( $text_class ); ?>">
				<?php
				if ( $eyebrow ) {
					?>
					<div class="text-eyebrow mb-2"><?= esc_html( $eyebrow ); ?></div>
					<?php
				}
				if ( $btitle ) {
					$title_class = 'Red' === ( $attributes['titleColour'] ?? '' ) ? 'has-brand-red-color' : 'has-black-color';
					?>
					<h2 class="editorial-m <?= esc_attr( $title_class ); ?>"><?= esc_html( $btitle ); ?></h2>
					<?php
				}
				if ( $content ) {
					?>
					<div class="hub-content-block__content"><?= wp_kses_post( $content ); ?></div>
					<?php
				}
				if ( $cta_url ) {
					$btns      = array(
						'white'        => 'btn-black-outline',
						'brand-yellow' => 'btn-purple-outline',
					);
					$btn_class = $btns[ $attributes['backgroundColor'] ?? '' ] ?? 'btn-black-outline';
					?>
					<a class="mt-5 btn <?= esc_attr( $btn_class ); ?>" href="<?= esc_url( $cta_url ); ?>"><?= esc_html( $cta_text ? $cta_text : $cta_url ); ?></a>
					<?php
				}
				?>
			</div>
			<div class="<?= esc_attr( $media_class ); ?>">
				<?php
				if ( 'image' === $media_type && $image_url ) {
					?>
					<img class="hub-content-block__image" src="<?= esc_url( $image_url ); ?>" alt="<?= esc_attr( $image_alt ); ?>" style="aspect-ratio: <?= esc_attr( $aspect ); ?>;">
					<?php
				}
				if ( 'video' === $media_type && $video_embed ) {
					$video_thumb = $attributes['videoThumbnailUrl'] ?? '';
					$video_title = $btitle ? $btitle : __( 'Video', 'hub-gsct2026' );
					$play_label  = $btitle ? sprintf( __( 'Play video: %s', 'hub-gsct2026' ), $btitle ) : __( 'Play video', 'hub-gsct2026' );
					if ( $video_thumb ) {
						?>
						<div class="hub-content-block__video" data-video-facade>
							<img class="hub-content-block__video-thumb" src="<?= esc_url( $video_thumb ); ?>" alt="" data-video-thumbnail>
							<button class="hub-content-block__video-play btn-video" type="button" data-video-play aria-label="<?= esc_attr( $play_label ); ?>"></button>
							<div class="hub-content-block__video-frame" data-video-frame hidden>
								<iframe data-src="<?= esc_url( $video_embed ); ?>" title="<?= esc_attr( $video_title ); ?>" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
							</div>
							<svg class="hub-content-block__corner hub-content-block__corner--tl" width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="70" height="4" fill="#7628D4"/><rect width="4" height="70" fill="#7628D4"/></svg>
							<svg class="hub-content-block__corner hub-content-block__corner--br" width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect y="66" width="70" height="4" fill="#7628D4"/><rect x="66" width="4" height="70" fill="#7628D4"/></svg>
						</div>
						<?php
					} else {
						?>
						<div class="hub-content-block__video">
							<iframe src="<?= esc_url( $video_embed ); ?>" title="<?= esc_attr( $video_title ); ?>" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
						</div>
						<?php
					}
				}
				$hub_list_items = array_values(
					array_filter(
						(array) ( $attributes['listItems'] ?? array() ),
						static function ( $row ) {
							$row = (array) $row;
							return '' !== trim( (string) ( $row['title'] ?? '' ) ) || '' !== trim( (string) ( $row['value'] ?? '' ) );
						}
					)
				);
				if ( 'list' === $media_type && $hub_list_items ) {
					?>
					<dl class="hub-content-block__list">
						<?php
						foreach ( $hub_list_items as $hub_list_item ) {
							$hub_list_item = (array) $hub_list_item;
							?>
							<div class="hub-content-block__list-row">
								<dt class="hub-content-block__list-title text-body-medium"><?= esc_html( $hub_list_item['title'] ?? '' ); ?></dt>
								<dd class="hub-content-block__list-value text-body has-medium-grey-color"><?= esc_html( $hub_list_item['value'] ?? '' ); ?></dd>
							</div>
							<?php
						}
						?>
					</dl>
					<?php
				}
				$quote_text = $attributes['quote'] ?? '';
				$quote_attr = $attributes['attribution'] ?? '';
				if ( 'quote' === $media_type && ( $quote_text || $quote_attr ) ) {					?>
					<div class="hub-content-block__quote py-6 px-5 d-flex flex-column justify-content-center" style="height: 600px;">
						<?php
						if ( $quote_text ) {
							?>
							<div class="pullquote-m has-white-color mb-4"><?= wp_kses_post( $quote_text ); ?></div>
							<?php
						}
						if ( $quote_attr ) {
							?>
							<div class="text-attribution has-black-color"><?= esc_html( $quote_attr ); ?></div>
							<?php
						}
						?>
					</div>
					<?php
				}
				?>
			</div>
		</div>
	</div>
</section>
