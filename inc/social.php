<?php
/**
 * Social sharing tags — og:image and og:description fallbacks.
 *
 * Pages here are built from blocks, so they rarely have a featured image or
 * a hand-written meta description, and Yoast (or any SEO plugin) then
 * outputs no og:image / og:description at all: shared links on LinkedIn or
 * Teams show no picture and no summary. This fills those gaps from the page
 * itself, only ever when the SEO plugin has nothing of its own:
 *
 *   image:       featured image → first image set on one of the page's
 *                blocks (hero background, content-block image, …) → the
 *                site's logo/icon.
 *   description: excerpt → first intro/description text on one of the page's
 *                blocks → first paragraph.
 *
 * With Yoast active this hooks its filters (its own values always win — set
 * a real meta description or social image in Yoast and that is used). With no
 * SEO plugin at all (e.g. local) it prints basic Open Graph / Twitter tags
 * itself so the behaviour can be seen and tested.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Walk a parsed block tree, calling $visit( $block ) on each block until it
 * returns something non-empty, and return that.
 *
 * @param array    $blocks Parsed blocks.
 * @param callable $visit  Receives a block array.
 * @return mixed|null
 */
function hub_gsct2026_social_find_in_blocks( $blocks, $visit ) {
	foreach ( $blocks as $block ) {
		$found = $visit( $block );
		if ( $found ) {
			return $found;
		}
		if ( ! empty( $block['innerBlocks'] ) ) {
			$found = hub_gsct2026_social_find_in_blocks( $block['innerBlocks'], $visit );
			if ( $found ) {
				return $found;
			}
		}
	}
	return null;
}

/**
 * Attachment ID to use as the social image for a post.
 *
 * @param WP_Post $post Post.
 * @return int 0 when nothing suitable.
 */
function hub_gsct2026_social_image_id( $post ) {
	$thumb = get_post_thumbnail_id( $post );
	if ( $thumb ) {
		return (int) $thumb;
	}

	$id = hub_gsct2026_social_find_in_blocks(
		parse_blocks( $post->post_content ),
		static function ( $block ) {
			foreach ( (array) ( $block['attrs'] ?? array() ) as $key => $value ) {
				// image / image1 / backgroundId etc.; not badges or logos.
				if ( is_numeric( $value ) && (int) $value > 0 && preg_match( '/^(image\d*|background)Id$/i', $key ) && wp_attachment_is_image( (int) $value ) ) {
					return (int) $value;
				}
			}
			return null;
		}
	);

	return $id ? (int) $id : 0;
}

/**
 * Description to use for sharing, trimmed to snippet length.
 *
 * @param WP_Post $post Post.
 * @return string
 */
function hub_gsct2026_social_description( $post ) {
	$text = '';

	if ( has_excerpt( $post ) ) {
		$text = get_the_excerpt( $post );
	}

	if ( '' === trim( $text ) ) {
		$text = (string) hub_gsct2026_social_find_in_blocks(
			parse_blocks( $post->post_content ),
			static function ( $block ) {
				foreach ( array( 'intro', 'introText', 'description', 'subtitle' ) as $key ) {
					$value = $block['attrs'][ $key ] ?? '';
					if ( is_string( $value ) && '' !== trim( wp_strip_all_tags( $value ) ) ) {
						return $value;
					}
				}
				if ( 'core/paragraph' === ( $block['blockName'] ?? '' ) && '' !== trim( wp_strip_all_tags( $block['innerHTML'] ) ) ) {
					return $block['innerHTML'];
				}
				return null;
			}
		);
	}

	$text = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( strip_shortcodes( $text ) ) ) );

	return '' === $text ? '' : wp_html_excerpt( $text, 155, '…' );
}

/**
 * Social image URL (1200px-wide where the file allows) for the current
 * singular request, falling back to the site logo/icon. Empty when none.
 *
 * @param WP_Post|null $post Post, or null for the queried object.
 * @return string
 */
function hub_gsct2026_social_image_url( $post = null ) {
	$post = $post ? $post : get_queried_object();
	$id   = $post instanceof WP_Post ? hub_gsct2026_social_image_id( $post ) : 0;

	if ( $id ) {
		$src = wp_get_attachment_image_src( $id, 'full' );
		if ( $src ) {
			return $src[0];
		}
	}

	$logo = (int) get_theme_mod( 'custom_logo' );
	if ( $logo && wp_attachment_is_image( $logo ) ) {
		$src = wp_get_attachment_image_src( $logo, 'full' );
		if ( $src ) {
			return $src[0];
		}
	}

	return (string) get_site_icon_url( 512 );
}

if ( defined( 'WPSEO_VERSION' ) ) {
	/**
	 * Yoast: add an image only when it found none of its own.
	 *
	 * @param object $images Yoast Images container.
	 * @return object
	 */
	function hub_gsct2026_yoast_social_image( $images ) {
		if ( ! is_singular() || ( method_exists( $images, 'has_images' ) && $images->has_images() ) ) {
			return $images;
		}
		$post = get_queried_object();
		$id   = $post instanceof WP_Post ? hub_gsct2026_social_image_id( $post ) : 0;
		if ( $id && method_exists( $images, 'add_image_by_id' ) ) {
			$images->add_image_by_id( $id );
		} elseif ( method_exists( $images, 'add_image' ) ) {
			$url = hub_gsct2026_social_image_url( $post );
			if ( $url ) {
				$images->add_image( array( 'url' => $url ) );
			}
		}
		return $images;
	}
	add_filter( 'wpseo_add_opengraph_images', 'hub_gsct2026_yoast_social_image' );

	/**
	 * Yoast: fill an empty description (meta, Open Graph and Twitter).
	 *
	 * @param string $description Yoast's value.
	 * @return string
	 */
	function hub_gsct2026_yoast_social_description( $description ) {
		if ( '' !== trim( (string) $description ) || ! is_singular() ) {
			return $description;
		}
		$post = get_queried_object();
		return $post instanceof WP_Post ? hub_gsct2026_social_description( $post ) : $description;
	}
	add_filter( 'wpseo_metadesc', 'hub_gsct2026_yoast_social_description' );
	add_filter( 'wpseo_opengraph_desc', 'hub_gsct2026_yoast_social_description' );
	add_filter( 'wpseo_twitter_description', 'hub_gsct2026_yoast_social_description' );
} else {
	/**
	 * No SEO plugin: print basic Open Graph / Twitter tags.
	 *
	 * @return void
	 */
	function hub_gsct2026_print_social_tags() {
		if ( ! is_singular() ) {
			return;
		}
		$post  = get_queried_object();
		$title = wp_get_document_title();
		$desc  = hub_gsct2026_social_description( $post );
		$image = hub_gsct2026_social_image_url( $post );

		$tags = array(
			'og:locale'      => get_locale(),
			'og:type'        => 'article' === $post->post_type || 'post' === $post->post_type ? 'article' : 'website',
			'og:title'       => $title,
			'og:description' => $desc,
			'og:url'         => get_permalink( $post ),
			'og:site_name'   => get_bloginfo( 'name' ),
			'og:image'       => $image,
		);
		foreach ( $tags as $property => $content ) {
			if ( '' !== (string) $content ) {
				printf( '<meta property="%s" content="%s" />' . "\n", esc_attr( $property ), 'og:url' === $property || 'og:image' === $property ? esc_url( $content ) : esc_attr( $content ) );
			}
		}
		printf( '<meta name="twitter:card" content="%s" />' . "\n", $image ? 'summary_large_image' : 'summary' );
		if ( '' !== $desc ) {
			printf( '<meta name="description" content="%s" />' . "\n", esc_attr( $desc ) );
		}
	}
	add_action( 'wp_head', 'hub_gsct2026_print_social_tags', 5 );
}
