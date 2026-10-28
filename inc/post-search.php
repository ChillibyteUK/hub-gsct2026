<?php
/**
 * Post search for the Insights index and the Learning posts grid.
 *
 *   GET /wp-json/hub/v1/post-search?q=dividend+policy[&category=12]
 *   -> { "results": [ { id, title, url, date, category, snippet }, … ] }
 *
 * All words must appear (title, excerpt or body, any order), newest first.
 * The snippet is cut around the first matching word in the body; the
 * client wraps the searched words in <mark> (src/js/post-search.js).
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Search form markup shared by index.php and the learning posts grid.
 *
 * @param int    $category_id Restrict results to this category (0 = all).
 * @param string $results_id  ID of the element the JS fills with results.
 * @param string $hide        Selector list of the normal view to hide while searching.
 * @param string $label       Accessible label.
 * @param string $filters     Selector of category pill links ([data-cat-id]) that narrow the search instead of navigating while it has a term.
 * @return string Markup (escaped inside).
 */
function hub_gsct2026_post_search_form( $category_id, $results_id, $hide, $label = 'Search articles', $filters = '' ) {
	$input_id = wp_unique_id( 'hub-post-search-' );

	ob_start();
	?>
	<div class="hub-post-search">
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="m13 13 4 4"/></svg>
		<label class="screen-reader-text" for="<?= esc_attr( $input_id ); ?>"><?= esc_html( $label ); ?></label>
		<input
			type="search"
			id="<?= esc_attr( $input_id ); ?>"
			class="hub-post-search__input"
			placeholder="Keywords"
			autocomplete="off"
			data-post-search
			data-endpoint="<?= esc_url( rest_url( 'hub/v1/post-search' ) ); ?>"
			data-category="<?= esc_attr( (string) (int) $category_id ); ?>"
			data-results="#<?= esc_attr( $results_id ); ?>"
			data-hide="<?= esc_attr( $hide ); ?>"
			data-filters="<?= esc_attr( $filters ); ?>"
		>
	</div>
	<?php
	return ob_get_clean();
}

add_action(
	'rest_api_init',
	static function () {
		register_rest_route(
			'hub/v1',
			'/post-search',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'args'                => array(
					'q'        => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'category' => array(
						'type'              => 'integer',
						'default'           => 0,
						'sanitize_callback' => 'absint',
					),
				),
				'callback'            => 'hub_gsct2026_rest_post_search',
			)
		);
	}
);

/**
 * Handle a post search.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function hub_gsct2026_rest_post_search( WP_REST_Request $request ) {
	$query = mb_substr( trim( (string) $request->get_param( 'q' ) ), 0, 100 );
	$terms = array_slice(
		array_values(
			array_filter(
				preg_split( '/\s+/u', $query ),
				static function ( $t ) {
					return mb_strlen( $t ) >= 2;
				}
			)
		),
		0,
		6
	);

	if ( ! $terms ) {
		return new WP_REST_Response( array( 'results' => array() ) );
	}

	$args = array(
		'post_type'           => 'post',
		'post_status'         => 'publish',
		's'                   => implode( ' ', $terms ),
		'posts_per_page'      => 50,
		'orderby'             => 'date',
		'order'               => 'DESC',
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
	);

	$category = (int) $request->get_param( 'category' );
	if ( $category ) {
		$args['cat'] = $category;
	}

	$results = array();

	foreach ( ( new WP_Query( $args ) )->posts as $post ) {
		$text = strip_shortcodes( $post->post_content );
		$text = excerpt_remove_blocks( $text );
		$text = trim( (string) preg_replace( '/\s+/u', ' ', wp_strip_all_tags( $text ) ) );

		// Window around the earliest match in the body; falls back to the
		// opening words when the match was only in the title.
		$pos = false;
		foreach ( $terms as $term ) {
			$found = mb_stripos( $text, $term );
			if ( false !== $found && ( false === $pos || $found < $pos ) ) {
				$pos = $found;
			}
		}

		if ( false === $pos ) {
			$snippet = wp_trim_words( $text, 30, '…' );
		} else {
			$start   = max( 0, $pos - 80 );
			$snippet = ( $start > 0 ? '…' : '' ) . trim( mb_substr( $text, $start, 240 ) ) . ( $start + 240 < mb_strlen( $text ) ? '…' : '' );
		}

		$cat_name = '';
		foreach ( (array) get_the_category( $post->ID ) as $cat ) {
			if ( 'uncategorized' !== $cat->slug ) {
				$cat_name = $cat->name;
				break;
			}
		}

		$results[] = array(
			'id'       => $post->ID,
			'title'    => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
			'url'      => get_permalink( $post ),
			'date'     => get_the_date( 'd M Y', $post ),
			'category' => html_entity_decode( $cat_name, ENT_QUOTES, 'UTF-8' ),
			'snippet'  => $snippet,
		);
	}

	return new WP_REST_Response( array( 'results' => $results ) );
}
