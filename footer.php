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
		<div class="row">
			<div class="col-12 col-lg-4">
				tagline
			</div>
			<div class="col-12 col-lg-4">
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
			<div class="col-12 col-lg-4">
				button
			</div>
		</div>
		<div id="colophon">
			<div>colophon</div>
			<div class="d-flex flex-wrap justify-content-between">
				<div>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?></div>
				<div>
					<a href="/privacy-policy/">Privacy Policy</a>
					<a href="/terms-of-use/">Terms of Use</a>
					<a href="/cookie-policy/">Cookie Policy</a>
				</div>
			</div>
			<div>disclaimers</div>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
