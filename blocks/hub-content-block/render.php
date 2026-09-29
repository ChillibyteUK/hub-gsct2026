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
$media_class = 'col-12 col-lg-6 hub-content-block__media' . ( $media_first ? ' hub-content-block__media--first' : '' );

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-content-block' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-5">
		<div class="row gap-6">
			<div class="col-12 col-lg-6 hub-content-block__text">
				<?php
				if ( $eyebrow ) {
					?>
					<div class="text-eyebrow mb-2"><?= esc_html( $eyebrow ); ?></div>
					<?php
				}
				if ( $btitle ) {
					?>
					<h2 class="h2-data-l"><?= esc_html( $btitle ); ?></h2>
					<?php
				}
				if ( $content ) {
					?>
					<div class="hub-content-block__content"><?= wp_kses_post( $content ); ?></div>
					<?php
				}
				if ( $cta_url ) {
					$btns = array(
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
				?>
			</div>
		</div>
	</div>
</section>
