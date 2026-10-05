/**
 * 3 Points fade-in: each numbered .hub-3-points__point fades in
 * consecutively when its row scrolls into view (covers both HUB 3 Points
 * and HUB 3 Points Hero — they share the markup). Only the numbered
 * variant animates — a point showing a big stat renders as-is. Numbered
 * points start at opacity 0 from CSS gated on scripting:enabled (see
 * src/blocks/3-points.css), so reduced-motion / missing GSAP / register
 * failure just clear back to visible instead of animating; no-JS keeps
 * the finished layout with nothing to reveal.
 */
export function initThreePoints() {
	const rows = document.querySelectorAll( '.hub-3-points__points' );
	if ( ! rows.length ) return;

	function revealAll() {
		document.querySelectorAll( '.hub-3-points__point' ).forEach( ( point ) => {
			point.style.opacity = '1';
		} );
	}

	if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
		revealAll();
		return;
	}
	if ( typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined' ) {
		revealAll();
		return;
	}

	try {
		window.gsap.registerPlugin( window.ScrollTrigger );
	} catch ( error ) {
		revealAll();
		return;
	}

	rows.forEach( ( row ) => {
		const points = [ ...row.querySelectorAll( '.hub-3-points__point' ) ].filter(
			( point ) => point.getBoundingClientRect().width > 0 && point.querySelector( ':scope > .number' )
		);
		if ( ! points.length ) return;

		const timeline = window.gsap.timeline( {
			scrollTrigger: { trigger: row, start: 'top 85%', once: true },
		} );
		timeline.to( points, { opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.2 } );
	} );

	// Trigger positions measured above can be stale by the time late assets
	// shift the page — refresh once everything has landed.
	window.addEventListener( 'load', () => {
		window.ScrollTrigger.refresh();
	} );
}
