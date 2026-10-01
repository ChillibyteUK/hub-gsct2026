<?php
/**
 * Block template for HUB Related Insights.
 *
 * Same categories first (excluding the current post), topped up with the
 * latest posts when fewer than three match. Outside single posts there is
 * no current post, so it is just the latest three.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$title = isset( $attributes['title'] ) && '' !== $attributes['title'] ? $attributes['title'] : __( 'Related insights and perspectives', 'hub-gsct2026' );

$exclude = array();
$related = array();

if ( is_singular( 'post' ) ) {
	$exclude[] = get_the_ID();

	$hub_cats = array();
	foreach ( (array) get_the_category() as $hub_cat ) {
		if ( 'uncategorized' !== $hub_cat->slug ) {
			$hub_cats[] = (int) $hub_cat->term_id;
		}
	}

	if ( $hub_cats ) {
		$hub_related_query = new WP_Query(
			array(
				'post_type'      => 'post',
				'posts_per_page' => 3,
				'post__not_in'   => $exclude,
				'category__in'   => $hub_cats,
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);

		$related = $hub_related_query->posts;
		wp_reset_postdata();
	}
}

if ( count( $related ) < 3 ) {
	$hub_topup_query = new WP_Query(
		array(
			'post_type'      => 'post',
			'posts_per_page' => 3 - count( $related ),
			'post__not_in'   => array_merge( $exclude, wp_list_pluck( $related, 'ID' ) ),
			'orderby'        => 'date',
			'order'          => 'DESC',
		)
	);

	$related = array_merge( $related, $hub_topup_query->posts );
	wp_reset_postdata();
}

if ( ! $related ) {
	return;
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-related-insights' ) );
$archive_url        = get_post_type_archive_link( 'post' );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<h2 class="hub-related-insights__title"><?= esc_html( $title ); ?></h2>
		<div class="hub-related-insights__track">
			<?php
			foreach ( $related as $hub_post ) {
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
					__( '%s · Article', 'hub-gsct2026' ),
					get_the_date( 'j M Y', $hub_post->ID )
				);
				?>
			<a class="hub-related-insights__card" href="<?= esc_url( get_permalink( $hub_post->ID ) ); ?>">
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
				foreach ( array_keys( $related ) as $hub_dot_index ) {
					?>
				<button type="button" class="hub-related-insights__dot<?= 0 === $hub_dot_index ? ' is-active' : ''; ?>" data-hub-related-dot="<?= esc_attr( $hub_dot_index ); ?>" tabindex="-1"></button>
					<?php
				}
				?>
			</div>
			<a class="text-link hub-related-insights__link" href="<?= esc_url( $archive_url ); ?>">
				<span class="hub-related-insights__link-text"><?= esc_html__( 'All insights', 'hub-gsct2026' ); ?></span>
				<svg class="hub-related-insights__link-arrow" width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 7.4H17M9 13.8L17 7.4L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</a>
		</div>
	</div>
</section>
