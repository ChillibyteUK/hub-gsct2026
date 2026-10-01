<?php
/**
 * Block template for HUB Multi Video.
 *
 * Title + intro, then a two-column grid of Vimeo embeds — same
 * click-to-play facade markup as HUB Content Block's video media type
 * (hub-content-block__video*, data-video-facade/-play/-frame/-thumbnail,
 * wired up once globally by src/js/video-facade.js), reused as-is per
 * video row instead of duplicating the facade pattern. Each row's title/
 * subtitle render as a caption below its player. Rows without a usable
 * Vimeo URL are skipped entirely.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle = $attributes['title'] ?? '';
$intro  = $attributes['intro'] ?? '';
$videos = array_values( (array) ( $attributes['videos'] ?? array() ) );

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-multi-video' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-6">
		<?php
		if ( $btitle ) {
			?>
			<h2 class="h2-data-l"><?= esc_html( $btitle ); ?></h2>
			<?php
		}
		if ( $intro ) {
			?>
			<div class="mb-5 hub-multi-video__intro"><?= wp_kses_post( wpautop( $intro ) ); ?></div>
			<?php
		}
		if ( $videos ) {
			?>
			<div class="row gap-5 hub-multi-video__videos">
				<?php
				foreach ( $videos as $video ) {
					$video        = (array) $video;
					$video_embed  = hub_gsct2026_get_vimeo_embed_url( $video['videoUrl'] ?? '' );
					if ( ! $video_embed ) {
						continue;
					}
					$video_title    = $video['videoTitle'] ?? '';
					$video_subtitle = $video['videoSubtitle'] ?? '';
					$video_thumb    = $video['videoThumbnailUrl'] ?? '';
					$frame_title    = $video_title ? $video_title : __( 'Video', 'hub-gsct2026' );
					$play_label     = $video_title ? sprintf( __( 'Play video: %s', 'hub-gsct2026' ), $video_title ) : __( 'Play video', 'hub-gsct2026' );
					?>
					<div class="col-12 col-md-6 hub-multi-video__item">
						<?php
						if ( $video_thumb ) {
							?>
							<div class="hub-content-block__video" data-video-facade>
								<img class="hub-content-block__video-thumb" src="<?= esc_url( $video_thumb ); ?>" alt="" data-video-thumbnail>
								<button class="hub-content-block__video-play btn-video" type="button" data-video-play aria-label="<?= esc_attr( $play_label ); ?>"></button>
								<div class="hub-content-block__video-frame" data-video-frame hidden>
									<iframe data-src="<?= esc_url( $video_embed ); ?>" title="<?= esc_attr( $frame_title ); ?>" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
								</div>
								<svg class="hub-content-block__corner hub-content-block__corner--tl" width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="70" height="4" fill="#fff039"/><rect width="4" height="70" fill="#fff039"/></svg>
								<svg class="hub-content-block__corner hub-content-block__corner--br" width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect y="66" width="70" height="4" fill="#fff039"/><rect x="66" width="4" height="70" fill="#fff039"/></svg>
							</div>
							<?php
						} else {
							?>
							<div class="hub-content-block__video">
								<iframe src="<?= esc_url( $video_embed ); ?>" title="<?= esc_attr( $frame_title ); ?>" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
							</div>
							<?php
						}
						if ( $video_title ) {
							?>
							<h3 class="text-body-l-medium mt-3 mb-2"><?= esc_html( $video_title ); ?></h3>
							<?php
						}
						if ( $video_subtitle ) {
							?>
							<p class="text-body"><?= esc_html( $video_subtitle ); ?></p>
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
		?>
	</div>
</section>
