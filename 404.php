<?php
/**
 * 404 template.
 *
 * @package hub-gsct2026
 */

get_header();
?>

<div class="container">
	<h1><?php esc_html_e( 'Page not found', 'hub-gsct2026' ); ?></h1>
	<p><?php esc_html_e( "The page you're looking for doesn't exist.", 'hub-gsct2026' ); ?></p>
</div>

<?php
get_footer();
