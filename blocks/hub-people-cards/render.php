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
	<div class="container pt-5">
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
	</div>
	<?php
	// Only people explicitly ticked for it: show_in_people_cards
	// defaults to unchecked, so there is no "missing means shown"
	// fallback — people without the tick (e.g. post-only authors)
	// stay out of the cards.
	$q = new WP_Query(
		array(
			'post_type'      => 'person',
			'posts_per_page' => -1,
			'meta_query'     => array(
				array(
					'key'     => 'show_in_people_cards',
					'value'   => '1',
					'compare' => '=',
				),
			),
		)
	);
	if ( $q->have_posts() ) {
		$hub_card_count = 0;
		?>
	<div class="pb-5" data-hub-carousel>
		<div class="container hub-people-cards__slider">
			<div class="row gap-4 hub-people-cards__track" data-hub-carousel-track>
				<?php
				while ( $q->have_posts() ) {
					$q->the_post();
					?>
				<div class="col-12 col-md-4 hub-people-cards__card" data-hub-carousel-card>
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
					<div class="text-body-medium mb-3 hub-people-cards__role"><?= esc_html( get_post_meta( get_the_ID(), 'role', true ) ); ?></div>
					<div><?php the_content(); ?></div>
				</div>
					<?php
					++$hub_card_count;
				}
				wp_reset_postdata();
				?>
			</div>
		</div>
		<div class="container">
			<div class="hub-people-cards__footer">
				<div class="hub-related-insights__dots" aria-hidden="true">
					<?php
					for ( $hub_dot_index = 0; $hub_dot_index < $hub_card_count; $hub_dot_index++ ) {
						?>
					<button type="button" class="hub-related-insights__dot<?= 0 === $hub_dot_index ? ' is-active' : ''; ?>" data-hub-related-dot="<?= esc_attr( $hub_dot_index ); ?>" tabindex="-1"></button>
						<?php
					}
					?>
				</div>
			</div>
		</div>
	</div>
		<?php
	}
	?>
</section>
