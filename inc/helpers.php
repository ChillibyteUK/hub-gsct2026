<?php
/**
 * Project-specific helpers.
 *
 * Reusable functions that only make sense for this project (unlike
 * inc/utilities.php, which stays project-agnostic). Add to this file rather
 * than scattering one-off functions across templates.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Site-wide date format: DD Mon YYYY, e.g. 02 Nov 2026.
 *
 * For dates typed as free text (document release dates, featured document
 * cards): tries the day-first formats people actually enter and re-formats
 * to the standard. Anything it can't read is returned untouched, so odd
 * text ("Autumn 2026") is never mangled. Real post dates should use
 * get_the_date( 'd M Y' ) directly.
 *
 * @param string $raw Date as entered.
 * @return string
 */
function hub_gsct2026_format_date( $raw ) {
	$raw = trim( (string) $raw );

	if ( '' === $raw ) {
		return '';
	}

	// Two-digit-year formats come before their four-digit twins: PHP's "Y"
	// happily reads "26" as the year 26.
	$formats = array( 'd M y', 'j M y', 'd M Y', 'j M Y', 'd F Y', 'j F Y', 'd/m/y', 'j/n/y', 'd/m/Y', 'j/n/Y', 'd-m-y', 'j-n-y', 'd-m-Y', 'j-n-Y', 'd.m.y', 'j.n.y', 'd.m.Y', 'j.n.Y', 'Y-m-d', 'M j, Y', 'M j Y', 'F j, Y', 'F j Y' );
	$utc     = new DateTimeZone( 'UTC' );
	// "Sept" is common in UK text but isn't a PHP month abbreviation.
	$clean   = preg_replace( '/\bSept\b/i', 'Sep', $raw );

	foreach ( $formats as $format ) {
		$date   = DateTimeImmutable::createFromFormat( '!' . $format, $clean, $utc );
		$errors = DateTimeImmutable::getLastErrors();

		if ( $date && ( ! $errors || ( 0 === $errors['warning_count'] && 0 === $errors['error_count'] ) ) ) {
			return $date->format( 'd M Y' );
		}
	}

	return $raw;
}

/**
 * Excerpt derived from the post's own content, ignoring the manual excerpt
 * field entirely.
 *
 * Unlike get_the_excerpt() (which prefers a hand-written excerpt that may be
 * stale, empty, or auto-filled by an SEO plugin), this always reads
 * post_content: block delimiters, shortcodes and tags are stripped, whitespace
 * collapsed, and the remainder trimmed to $length words. Returns '' when the
 * post has no readable text (e.g. an empty placeholder), so callers can hide
 * the excerpt element altogether.
 *
 * @param int|WP_Post|null $post   Post to excerpt. Defaults to the loop post.
 * @param int               $length Words to keep.
 * @return string Plain-text excerpt (unescaped — escape at output).
 */
function hub_gsct2026_content_excerpt( $post = null, $length = 30 ) {
	$post = get_post( $post );

	if ( ! $post ) {
		return '';
	}

	$text = strip_shortcodes( $post->post_content );
	$text = excerpt_remove_blocks( $text );
	$text = wp_strip_all_tags( $text );
	$text = trim( preg_replace( '/\s+/', ' ', $text ) );

	if ( '' === $text ) {
		return '';
	}

	return wp_trim_words( $text, absint( $length ), '…' );
}

/**
 * Standard insight card markup, shared by index.php and the learning posts
 * grid (whose load-more JS rebuilds the same structure client-side — keep
 * the two in sync). Thirds variant: media, date badge line, h3 title,
 * 25-word excerpt. Everything escaped inside; echo the return value with
 * the usual phpcs escape bypass.
 *
 * @param int|WP_Post $post Post to render.
 * @param string      $span Column classes, e.g. 'col-12 col-md-6 col-lg-4'.
 * @return string Card markup (never echoes).
 */
function hub_gsct2026_learning_card( $post, $span = 'col-12 col-md-6 col-lg-4' ) {
	$post = get_post( $post );

	if ( ! $post ) {
		return '';
	}

	$primary_cat = null;
	foreach ( (array) get_the_category( $post->ID ) as $cat ) {
		if ( 'uncategorized' !== $cat->slug ) {
			$primary_cat = $cat;
			break;
		}
	}

	$thumb = get_the_post_thumbnail(
		$post,
		'full',
		array( 'alt' => get_the_title( $post ) )
	);

	$excerpt = hub_gsct2026_content_excerpt( $post, 25 );

	ob_start();
	?>
	<div class="<?= esc_attr( $span ); ?>">
		<a <?php post_class( 'hub-insight-card', $post->ID ); ?> href="<?= esc_url( get_permalink( $post ) ); ?>">
			<div class="hub-insight-card__media<?= $thumb ? '' : ' hub-insight-card__media--empty'; ?>">
				<?= $thumb; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core-generated markup. ?>
				<?php
				if ( $primary_cat ) {
					?>
					<span class="hub-insight-card__badge"><?= esc_html( $primary_cat->name ); ?></span>
					<?php
				}
				?>
			</div>
			<?php /* <!-- <p class="hub-insight-card__meta"><?= esc_html( sprintf( '%s · Article', get_the_date( 'd M Y', $post ) ) ); ?></p> --> */ ?>
			<h2 class="hub-insight-card__title h3-data-m"><?= esc_html( get_the_title( $post ) ); ?></h2>
			<?php
			if ( $excerpt ) {
				?>
				<p class="hub-insight-card__excerpt text-body"><?= esc_html( $excerpt ); ?></p>
				<?php
			}
			?>
		</a>
	</div>
	<?php
	return ob_get_clean();
}
