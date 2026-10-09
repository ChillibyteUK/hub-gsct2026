<?php
/**
 * Single post template.
 *
 * @package hub-gsct2026
 */

get_header();
?>

<div class="container">
	<?php
	while ( have_posts() ) {
		the_post();

		$hub_author_id = (int) get_post_meta( get_the_ID(), 'author_person_id', true );
		if ( ! $hub_author_id ) {
			$hub_default_author = get_page_by_path( 'gsct', OBJECT, 'person' );
			if ( $hub_default_author ) {
				$hub_author_id = (int) $hub_default_author->ID;
			}
		}
		$hub_author     = $hub_author_id ? get_post( $hub_author_id ) : null;
		$hub_has_author = $hub_author && 'person' === $hub_author->post_type && 'trash' !== $hub_author->post_status;

		$hub_author_name = $hub_has_author ? get_the_title( $hub_author ) : get_the_author();
		$hub_author_role = $hub_has_author ? get_post_meta( $hub_author->ID, 'role', true ) : '';

		$hub_author_thumb_id = $hub_has_author ? (int) get_post_meta( $hub_author->ID, 'author_thumbnail', true ) : 0;
		$hub_meta_avatar     = $hub_author_thumb_id ? wp_get_attachment_image( $hub_author_thumb_id, 'thumbnail' ) : '';
		if ( ! $hub_meta_avatar && $hub_has_author && has_post_thumbnail( $hub_author->ID ) ) {
			$hub_meta_avatar = get_the_post_thumbnail( $hub_author->ID, 'thumbnail' );
		}
		// No generic fallback: gravatars are disabled theme-wide, so
		// get_avatar() would always return an empty string here.

		$hub_author_bio = $hub_has_author ? get_post_meta( $hub_author->ID, 'author_bio', true ) : '';
		if ( ! $hub_author_bio && $hub_has_author ) {
			$hub_author_bio = wp_trim_words( wp_strip_all_tags( $hub_author->post_content ), 55, '…' );
		}

		$hub_minutes = estimate_reading_time_in_minutes( get_the_content(), 300, false );
		?>
		<article <?php post_class(); ?>>
			<h1 class="display-xl pt-6 mb-6"><?php the_title(); ?></h1>
			<div class="hub-post-meta">
				<div class="hub-post-meta__author">
					<span class="hub-post-meta__avatar"><?= $hub_meta_avatar; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core image functions already escape. ?></span>
					<span class="hub-post-meta__text">
						<span class="hub-post-meta__name text-body-medium"><?= esc_html( $hub_author_name ); ?></span>
					<?php
					if ( $hub_author_role ) {
						?>
						<span class="hub-post-meta__sub text-body"><?= esc_html( $hub_author_role ); ?></span>
							<?php
					}
					?>
					</span>
				</div>
				<span class="hub-post-meta__divider" aria-hidden="true"></span>
				<div class="hub-post-meta__text">
					<span class="hub-post-meta__sub text-body"><?= esc_html( sprintf( 'Published %s', get_the_date( 'M j, Y' ) ) ); ?></span>
					<?php
					if ( $hub_minutes > 0 ) {
						?>
					<span class="hub-post-meta__name text-body-medium"><?= esc_html( sprintf( '%d min read', $hub_minutes ) ); ?></span>
						<?php
					}
					?>
				</div>
				<span class="hub-post-meta__divider" aria-hidden="true"></span>
				<button type="button" class="hub-share-btn" data-share data-share-url="<?= esc_url( get_permalink() ); ?>" data-share-title="<?= esc_attr( get_the_title() ); ?>" aria-label="<?= esc_attr__( 'Share this article', 'hub-gsct2026' ); ?>">
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.44238 10.1324L11.5649 13.1176M11.5574 4.88198L6.44238 7.86722M15.75 3.74957C15.75 4.99231 14.7426 5.99975 13.5 5.99975C12.2574 5.99975 11.25 4.99231 11.25 3.74957C11.25 2.50683 12.2574 1.49939 13.5 1.49939C14.7426 1.49939 15.75 2.50683 15.75 3.74957ZM6.75 8.99999C6.75 10.2427 5.74264 11.2502 4.5 11.2502C3.25736 11.2502 2.25 10.2427 2.25 8.99999C2.25 7.75725 3.25736 6.74981 4.5 6.74981C5.74264 6.74981 6.75 7.75725 6.75 8.99999ZM15.75 14.2504C15.75 15.4931 14.7426 16.5006 13.5 16.5006C12.2574 16.5006 11.25 15.4931 11.25 14.2504C11.25 13.0077 12.2574 12.0002 13.5 12.0002C14.7426 12.0002 15.75 13.0077 15.75 14.2504Z" stroke="#333333" stroke-width="2" stroke-linecap="round"/></svg>
				</button>
			</div>
			<?= get_the_post_thumbnail( get_the_ID(), 'full', array( 'class' => 'single-hero mb-5' ) ); ?>
			<div class="article-container">
			<?php
			the_content();
			$hub_post_cats = array_filter(
				(array) get_the_category(),
				static function ( $hub_post_cat ) {
					return 'uncategorized' !== $hub_post_cat->slug;
				}
			);
			if ( $hub_post_cats ) {
				?>
				<div class="hub-post-tags">
				<?php
				foreach ( $hub_post_cats as $hub_post_cat ) {
					?>
					<a class="hub-filter-pill is-active" href="<?= esc_url( get_category_link( $hub_post_cat ) ); ?>"><?= esc_html( $hub_post_cat->name ); ?></a>
					<?php
				}
				?>
				</div>
				<?php
			}

			if ( $hub_has_author ) {
				?>
				<div class="hub-author-box">
					<div class="hub-author-box__text">
						<div class="text-label mb-2">AUTHOR</div>
						<h3 class="hub-author-box__name editorial-m"><?= esc_html( get_the_title( $hub_author ) ); ?></h3>
				<?php
				if ( $hub_author_bio ) {
					?>
						<p class="hub-author-box__bio"><?= nl2br( esc_html( $hub_author_bio ) ); ?></p>
					<?php
				}
				?>
					</div>
				</div>
				<?php
			}
			?>
			</div>
		</article>
		<?php
	}
	?>
</div>

<?php
// Related posts: full-width section after the constrained container —
// naturally viewport-wide, so no vw breakout hack (and its scrollbar
// overflow) is needed.
echo do_blocks( '<!-- wp:hub-gsct2026/hub-related-insights /-->' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
// How to Invest: full-width section after the constrained container —
// naturally viewport-wide, so no vw breakout hack (and its scrollbar
// overflow) is needed.
echo do_blocks( '<!-- wp:hub-gsct2026/hub-how-to-invest /-->' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
?>

<?php
get_footer();
