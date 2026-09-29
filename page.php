<?php
/**
 * Page template.
 *
 * Most projects build page layouts from native blocks rather than the_content()
 * directly — override this per project as needed.
 *
 * @package hub-gsct2026
 */

get_header();

while ( have_posts() ) {
	the_post();
	the_content();
}

get_footer();
