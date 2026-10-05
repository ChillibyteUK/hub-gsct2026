/**
 * Cards Section entrance: on desktop the cards start stacked on the left
 * underneath card 1, then deal out rightward in order when the row scrolls
 * into view — card 2 slides out first, then card 3 from under it. Card 1
 * never moves; it sits on top of the starting pile via explicit z-order,
 * cleared once everything lands. Final positions are measured from the
 * real layout (not hardcoded), so any card count or responsive width just
 * works.
 *
 * Everything happens through gsap.set() inside the animated path, so
 * reduced-motion / missing GSAP / register failure / no-JS all simply
 * render the finished layout with nothing to reveal. Below 768px (the
 * block's own stacking breakpoint — see src/blocks/cards-section.css)
 * there is no animation at all, just the normal stacked cards.
 */
export function initCardsSections() {
	const rows = document.querySelectorAll( '.hub-cards-section__cards' );

	// Clear the parse-time pre-stack first (see inline script in render.php)
	// — every early return below must leave the finished layout behind.
	rows.forEach( ( row ) => {
		row.querySelectorAll( '.hub-cards-section__card' ).forEach( ( card ) => {
			card.style.transform = '';
			card.style.zIndex = '';
		} );
	} );

	if ( window.matchMedia( '(max-width: 767px)' ).matches ) {
		return;
	}
	if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
		return;
	}
	if ( typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined' ) {
		return;
	}

	try {
		window.gsap.registerPlugin( window.ScrollTrigger );
	} catch ( error ) {
		return;
	}

	rows.forEach( ( row ) => {
		const cards = [ ...row.querySelectorAll( '.hub-cards-section__card' ) ].filter(
			( card ) => card.getBoundingClientRect().width > 0
		);
		if ( cards.length < 2 ) return;

		const firstRect = cards[ 0 ].getBoundingClientRect();
		const firstCentreX = firstRect.left + firstRect.width / 2;

		const targets = cards.map( ( card ) => {
			const rect = card.getBoundingClientRect();
			return { card, dx: firstCentreX - ( rect.left + rect.width / 2 ) };
		} );

		// Pile everything under card 1 (first on top), then deal out in
		// DOM order — card 2 slides out, then card 3 from under it.
		targets.forEach( ( { card, dx }, i ) => {
			window.gsap.set( card, { x: dx, zIndex: targets.length - i } );
		} );

		const timeline = window.gsap.timeline( {
			scrollTrigger: { trigger: row, start: 'top 85%', once: true },
		} );
		targets.forEach( ( { card }, i ) => {
			if ( 0 === i ) return;
			timeline.to( card, { x: 0, duration: 1, ease: 'power3.out' }, ( i - 1 ) * 0.25 );
		} );
		timeline.set( cards, { clearProps: 'zIndex' } );
	} );

	// Trigger positions measured above can be stale by the time late assets
	// shift the page — refresh once everything has landed.
	window.addEventListener( 'load', () => {
		window.ScrollTrigger.refresh();
	} );
}
