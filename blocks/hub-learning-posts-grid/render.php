<?php
/**
 * Block template for HUB Learning Posts Grid.
 *
 * First two tag posts at half width, the rest in rows of three — same
 * hub-insight-card markup and classes as index.php. The load-more button
 * pulls further 3-card rows via the core posts REST endpoint (see
 * src/js/learning-posts-grid.js); initial offset and tag travel as data
 * attributes. Title spans render brand-purple (bare <span> only — kses
 * strips attributes).
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle = $attributes['title'] ?? '';
$intro  = $attributes['intro'] ?? '';

$category = get_term_by( 'slug', 'learning-series', 'category' );

$posts       = array();
$total_posts = 0;
if ( $category ) {
	$query = new WP_Query(
		array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			'category__in'   => array( (int) $category->term_id ),
			'posts_per_page' => 5,
		)
	);
	$posts       = $query->posts;
	$total_posts = (int) $query->found_posts;
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-learning-posts-grid' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( $btitle ) {
			?>
			<h2 class="hub-learning-posts-grid__title display-m"><?= wp_kses_post( $btitle ); ?></h2>
			<?php
		}
		if ( $intro ) {
			?>
			<div class="hub-learning-posts-grid__intro"><?= wp_kses_post( $intro ); ?></div>
			<?php
		}
		if ( $posts ) {
			?>
			<div class="row hub-learning-posts-grid__grid" data-category="<?= $category ? esc_attr( (int) $category->term_id ) : ''; ?>" data-offset="5" data-per-page="3" data-total="<?= esc_attr( $total_posts ); ?>">
				<?php
				foreach ( $posts as $index => $post ) {
					setup_postdata( $post );
					$span = $index < 2 ? 'col-12 col-md-6' : 'col-12 col-md-6 col-lg-4';
					echo hub_gsct2026_learning_card( $post, $span ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped internally.
				}
				wp_reset_postdata();
				?>
			</div>
			<?php
			if ( $total_posts > count( $posts ) ) {
				?>
				<button class="btn btn-outline hub-learning-posts-grid__more" type="button"><?= esc_html__( 'See more', 'hub-gsct2026' ); ?></button>
				<?php
			}
		}
		?>
	</div>
</section>
