<?php
/**
 * The template for displaying the footer
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$tagline     = hub_gsct2026_get_setting( 'footer_tagline' );
$colophon    = hub_gsct2026_get_setting( 'footer_colophon' );
$disclaimers = hub_gsct2026_get_setting( 'footer_disclaimers' );

?>
</main>

<footer id="footer">
	<div class="container">
		<div class="mb-5"><img src="<?= esc_url( get_template_directory_uri() . '/img/gsct-logo-wo.svg' ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"></div>
		<div class="row hub-footer-divided">
			<div class="col-12 col-lg-4">
				<?= esc_html( $tagline ); ?>
			</div>
			<div class="col-12 col-lg-4">
				<h3 class="text-eyebrow text-uppercase">Site sections</h3>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'footer',
						'menu_class'     => 'footer-nav',
						'container'      => false,
						'fallback_cb'    => false,
					)
				);
				?>
			</div>
			<div class="col-12 col-lg-4 text-lg-center">
				<a href="/how-to-invest/" class="btn btn-yellow-outline">How to Invest</a>
			</div>
		</div>
		<div class="colophon">
			<div class="mb-3"><?= esc_html( $colophon ); ?></div>
			<div class="d-flex flex-wrap justify-content-between">
				<div>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> The Global Smaller Companies Trust PLC</div>
				<?php
				wp_nav_menu(
					array(
						'theme_location'  => 'colophon',
						'container'       => 'nav',
						'container_class' => 'colophon-nav',
						'container_aria_label' => 'Legal',
						'menu_class'      => 'colophon-nav__list',
						'depth'           => 1,
						'fallback_cb'     => static function () {
							// Until a menu is assigned in Appearance > Menus.
							?>
							<nav class="colophon-nav" aria-label="Legal">
								<ul class="colophon-nav__list">
									<li><a href="/privacy-policy/">Privacy Policy</a></li>
									<li><a href="https://www.columbiathreadneedle.com/en/terms-and-conditions/" target="_blank" rel="noopener">Terms of Use</a></li>
									<li><a href="/cookie-policy/">Cookie Policy</a></li>
								</ul>
							</nav>
							<?php
						},
					)
				);
				?>
			</div>
			<div class="mt-5"><?= wp_kses_post( wpautop( $disclaimers ) ); ?></div>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
