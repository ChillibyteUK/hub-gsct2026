<?php
/**
 * Header template.
 *
 * @package hub-gsct2026
 */

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
		<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<a class="visually-hidden" href="#main">Skip to content</a>
<?php wp_body_open(); ?>

<!-- HEADER-NAV:START -->
<header id="masthead">
	<nav class="navbar container" aria-label="Primary navigation">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="navbar-brand">
			<img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/img/gsct-logo.svg' ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" width="173" height="48">
		</a>

		<a href="/how-to-invest/" class="btn d-lg-none">How to Invest</a>

		<button class="navbar-toggler" type="button" aria-expanded="false" aria-controls="primary-menu" aria-label="Toggle navigation">
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path d="M2 5h16M2 10h16M2 15h16" />
			</svg>
		</button>

		<div class="navbar-collapse" id="primary-menu">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'menu_class'     => 'navbar-nav',
					'container'      => false,
					'fallback_cb'    => false,
					'walker'         => new Hub_GSCT_2026_Nav_Walker(),
				)
			);
			?>
		<a href="/how-to-invest/" class="btn d-none d-lg-block ms-4 align-self-center">How to Invest</a>
		</div>


	</nav>
</header>
<!-- HEADER-NAV:END -->

<main id="main">
