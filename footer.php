<?php
/**
 * The template for displaying the footer
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;
?>
</main>

<footer id="footer">
	<div class="container">
		<div><img src="<?= esc_url( get_template_directory_uri() . '/img/gsct-logo-wo.svg' ); ?>" alt="<?php bloginfo( 'name' ); ?>"></div>
		<?php
		wp_nav_menu(
			array(
				'theme_location' => 'footer',
				'menu_class'     => 'navbar-nav',
				'container'      => false,
				'fallback_cb'    => false,
			)
		);
		?>
	</div>
	<div id="colophon">
		<div class="container">
			<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?></p>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
