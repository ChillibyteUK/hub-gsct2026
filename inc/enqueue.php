<?php
/**
 * Enqueue theme CSS/JS. filemtime versioning, no jQuery, no Bootstrap —
 * GSAP/ScrollTrigger/Lenis load vendored from js/vendor/ (see
 * hub_gsct2026_enqueue_vendor()).
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * Enqueue theme.min.css.
 *
 * @return void
 */
function hub_gsct2026_enqueue_styles() {
	$rel = '/css/theme.min.css';
	$abs = get_stylesheet_directory() . $rel;
	if ( file_exists( $abs ) ) {
		wp_enqueue_style( 'hub-gsct2026-theme', get_stylesheet_directory_uri() . $rel, array(), filemtime( $abs ) );
	}
}
add_action( 'wp_enqueue_scripts', 'hub_gsct2026_enqueue_styles' );

/**
 * Enqueue a file from js/vendor/, filemtime-versioned like everything else.
 *
 * Third-party libraries a project needs should be vendored into js/vendor/
 * and committed, the same convention the compiled css/ and js/ output
 * already follows, rather than loaded from a CDN — that avoids extra DNS/TLS
 * handshakes and keeps a vendored stylesheet off a third-party origin. Note
 * the file the upstream version came from in a comment near the call site
 * (e.g. gsap.min.js 3.12.7 cdn.jsdelivr.net/npm/gsap) since it's vendored by
 * hand rather than tracked in package.json.
 *
 * @param string   $handle Handle to register under.
 * @param string   $file   Filename within js/vendor/.
 * @param bool     $is_css True to enqueue as a stylesheet rather than a script.
 * @param string[] $deps   Other registered handles this depends on (e.g. a
 *                         gsap plugin depending on the 'gsap' handle itself).
 * @return void
 */
function hub_gsct2026_enqueue_vendor( $handle, $file, $is_css = false, $deps = array() ) {
	$rel = '/js/vendor/' . $file;
	$abs = get_stylesheet_directory() . $rel;
	if ( ! file_exists( $abs ) ) {
		return;
	}
	$url = get_stylesheet_directory_uri() . $rel;
	if ( $is_css ) {
		wp_enqueue_style( $handle, $url, $deps, filemtime( $abs ) );
	} else {
		wp_enqueue_script( $handle, $url, $deps, filemtime( $abs ), true );
	}
}

/**
 * Enqueue Adobe Fonts (Typekit) — frontend and block editor alike, so the
 * editor iframe renders the same faces as the frontend.
 *
 * @return void
 */
function hub_gsct2026_enqueue_fonts() {
	wp_enqueue_style( 'hub-gsct2026-typekit', 'https://use.typekit.net/aar3vhl.css', array(), null );
}
add_action( 'wp_enqueue_scripts', 'hub_gsct2026_enqueue_fonts' );
add_action( 'enqueue_block_editor_assets', 'hub_gsct2026_enqueue_fonts' );

/**
 * Enqueue theme.min.js, plus GSAP/ScrollTrigger/Lenis vendors.
 *
 * Vendor load order is enforced via $deps (ScrollTrigger extends
 * window.gsap, so must execute after it) and theme.min.js depends on all
 * three — its inits guard missing globals, but when present the vendors
 * must have executed first.
 *
 * @return void
 */
function hub_gsct2026_enqueue_scripts() {

	// gsap.min.js 3.12.5 cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
	hub_gsct2026_enqueue_vendor( 'gsap', 'gsap.min.js' );
	// ScrollTrigger.min.js 3.12.5 cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
	hub_gsct2026_enqueue_vendor( 'gsap-scrolltrigger', 'ScrollTrigger.min.js', false, array( 'gsap' ) );
	// lenis.css / lenis.min.js 1.3.11 unpkg.com/lenis@1.3.11/dist/
	hub_gsct2026_enqueue_vendor( 'lenis-style', 'lenis.css', true );
	hub_gsct2026_enqueue_vendor( 'lenis', 'lenis.min.js' );

	$rel = '/js/theme.min.js';
	$abs = get_stylesheet_directory() . $rel;
	if ( file_exists( $abs ) ) {
		wp_enqueue_script( 'hub-gsct2026-theme', get_stylesheet_directory_uri() . $rel, array( 'gsap', 'gsap-scrolltrigger', 'lenis' ), filemtime( $abs ), true );
	}
}
add_action( 'wp_enqueue_scripts', 'hub_gsct2026_enqueue_scripts' );
