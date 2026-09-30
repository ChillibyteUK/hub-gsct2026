<?php
/**
 * Block template for HUB People Cards.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle = $attributes['title'] ?? '';
$intro  = $attributes['intro'] ?? '';

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-people-cards' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-5">
		<div class="hub-people-cards__intro">
		<?php
		if ( $btitle ) {
			?>
		<h2 class="has-brand-red-color"><?= esc_html( $btitle ); ?></h2>
			<?php
		}
		if ( $intro ) {
			?>
		<div><?= esc_html( $intro ); ?></div>
			<?php
		}
		?>
		</div>
		<div class="row gap-4">
			<?php
			// Output People cards here.
			$q = new WP_Query(
				array(
					'post_type'      => 'person',
					'posts_per_page' => -1,
				)
			);
			if ( $q->have_posts() ) {
				while ( $q->have_posts() ) {
					$q->the_post();
					?>
				<div class="col-12 col-md-4 hub-people-cards__card">
					<?php
					if ( has_post_thumbnail() ) {
						?>
					<div class="hub-people-cards__card-image">
						<?php the_post_thumbnail( 'large' ); ?>
					</div>
						<?php
					}
					?>
					<h3><?php the_title(); ?></h3>
					<div class="text-body-medium mb-3"><?= esc_html( get_post_meta( get_the_ID(), 'role', true ) ); ?></div>
					<div><?php the_content(); ?></div>
				</div>
					<?php
				}
				wp_reset_postdata();
			}
			?>
	</div>
</section>
