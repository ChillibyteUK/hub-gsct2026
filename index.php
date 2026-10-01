<?php
/**
 * Insights listing — blog home and category archives.
 *
 * First post renders featured full width, posts 2–5 at half width, post 6
 * onwards at a third (each prefixed col-12 so they stack on mobile).
 *
 * @package hub-gsct2026
 */

get_header();

$is_filtered    = is_category();
$current_cat_id = $is_filtered ? get_queried_object_id() : 0;

// Filter pills: every used category except Uncategorized. If none exist yet,
// the row is just "All perspectives".
$uncategorised = get_term_by( 'slug', 'uncategorized', 'category' );
$filter_cats   = get_categories(
	array(
		'hide_empty' => true,
		'exclude'    => $uncategorised ? array( (int) $uncategorised->term_id ) : array(),
	)
);

$page_for_posts_id = get_option( 'page_for_posts' );

if ( $is_filtered ) {
	$hero_title = single_cat_title( '', false );
	$hero_text  = category_description();
} else {
	$hero_title = 'Insights';
	$hero_text  = get_the_content( null, false, $page_for_posts_id );
}
?>

<section class="hub-insights-hero">
	<div class="container pt-6">
		<h1 class="display-xl pb-4"><?= esc_html( $hero_title ); ?></h1>
		<?php
		if ( $hero_text ) {
			?>
		<div class="hub-insights-hero__intro text-body-l pb-5"><?= wp_kses_post( $hero_text ); ?></div>
			<?php
		}
		?>
		<nav class="hub-insights-filters pb-4" aria-label="Filter insights by category">
			<a
				class="hub-filter-pill<?= 0 === $current_cat_id ? ' is-active' : ''; ?>"
				href="<?= esc_url( get_post_type_archive_link( 'post' ) ); ?>"
				<?= 0 === $current_cat_id ? 'aria-current="page"' : ''; ?>
			>All perspectives</a>
			<?php
			foreach ( $filter_cats as $cat ) {
				?>
				<a
					class="hub-filter-pill<?= $current_cat_id === (int) $cat->term_id ? ' is-active' : ''; ?>"
					href="<?= esc_url( get_category_link( $cat ) ); ?>"
					<?= $current_cat_id === (int) $cat->term_id ? 'aria-current="page"' : ''; ?>
				><?= esc_html( $cat->name ); ?></a>
				<?php
			}
			?>
		</nav>
	</div>
</section>

<div class="hub-insights-list">
	<div class="container">
		<?php if ( have_posts() ) : ?>
			<div class="row">
				<?php
				$hub_insight_index = 0;
				while ( have_posts() ) {
					the_post();
					++$hub_insight_index;

					// First assigned category (skipping Uncategorized) for the badge.
					$hub_primary_cat = null;
					foreach ( (array) get_the_category() as $hub_cat ) {
						if ( 'uncategorized' !== $hub_cat->slug ) {
							$hub_primary_cat = $hub_cat;
							break;
						}
					}
					$hub_meta = sprintf(
						'%s · Article',
						get_the_date( 'j M Y' )
					);

					$hub_thumb = get_the_post_thumbnail(
						null,
						1 === $hub_insight_index ? 'large' : 'medium_large',
						array( 'alt' => the_title_attribute( array( 'echo' => false ) ) )
					);

					if ( 1 === $hub_insight_index ) {
						$hub_span = 'col-12';
					} elseif ( $hub_insight_index <= 5 ) {
						$hub_span = 'col-12 col-md-6';
					} else {
						$hub_span = 'col-12 col-md-6 col-lg-4';
					}
					?>
					<div class="<?= esc_attr( $hub_span ); ?>">
						<?php if ( 1 === $hub_insight_index ) : ?>
							<article <?php post_class( 'hub-insight-card hub-insight-card--featured' ); ?>>
								<a class="hub-insight-card__media<?= $hub_thumb ? '' : ' hub-insight-card__media--empty'; ?>" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
									<?= $hub_thumb; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									<?php if ( $hub_primary_cat ) : ?>
										<span class="hub-insight-card__badge"><?= esc_html( $hub_primary_cat->name ); ?></span>
									<?php endif; ?>
								</a>
								<p class="hub-insight-card__meta"><?= esc_html( $hub_meta ); ?></p>
								<div class="row hub-insight-card__body">
									<h2 class="hub-insight-card__title editorial-m col-12 col-lg-7">
										<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
									</h2>
									<?php if ( has_excerpt() ) : ?>
										<div class="hub-insight-card__excerpt text-body col-12 col-lg-5"><?php the_excerpt(); ?></div>
									<?php endif; ?>
								</div>
							</article>
						<?php else : ?>
							<article <?php post_class( 'hub-insight-card' ); ?>>
								<a class="hub-insight-card__media<?= $hub_thumb ? '' : ' hub-insight-card__media--empty'; ?>" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
									<?= $hub_thumb; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									<?php if ( $hub_primary_cat ) : ?>
										<span class="hub-insight-card__badge"><?= esc_html( $hub_primary_cat->name ); ?></span>
									<?php endif; ?>
								</a>
								<p class="hub-insight-card__meta"><?= esc_html( $hub_meta ); ?></p>
								<h2 class="hub-insight-card__title h3-data-m">
									<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
								</h2>
								<?php if ( has_excerpt() ) : ?>
									<div class="hub-insight-card__excerpt text-body"><?php the_excerpt(); ?></div>
								<?php endif; ?>
							</article>
						<?php endif; ?>
					</div>
					<?php
				}
				?>
			</div>

			<?php
			the_posts_pagination(
				array(
					'prev_text' => __( 'Previous', 'hub-gsct2026' ),
					'next_text' => __( 'Next', 'hub-gsct2026' ),
				)
			);
			?>
		<?php else : ?>
			<p><?php esc_html_e( 'Nothing found.', 'hub-gsct2026' ); ?></p>
		<?php endif; ?>
	</div>
</div>

<?php
get_footer();
