/**
 * Related Insights carousel dots. Each section's dots mirror its swipe
 * track: tapping a dot scrolls to that card, and scrolling updates the
 * active dot. Desktop shows a plain grid (no overflow), so the dots stay
 * hidden there and this is a no-op.
 */
export function initRelatedInsights() {
	const reduceMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;

	document
		.querySelectorAll( '.hub-related-insights' )
		.forEach( ( section ) => {
			const track = section.querySelector(
				'.hub-related-insights__track'
			);
			const cards = Array.from(
				section.querySelectorAll( '.hub-related-insights__card' )
			);
			const dots = Array.from(
				section.querySelectorAll( '[data-hub-related-dot]' )
			);

			if ( ! track || cards.length === 0 || dots.length === 0 ) return;

			const setActive = ( index ) => {
				dots.forEach( ( dot, i ) => {
					dot.classList.toggle( 'is-active', i === index );
				} );
			};

			dots.forEach( ( dot, index ) => {
				dot.addEventListener( 'click', () => {
					track.scrollTo( {
						left:
							cards[ index ].offsetLeft -
							track.offsetLeft -
							parseFloat(
								getComputedStyle( track ).paddingLeft
							),
						behavior: reduceMotion ? 'auto' : 'smooth',
					} );
				} );
			} );

			let ticking = false;
			track.addEventListener(
				'scroll',
				() => {
					if ( ticking ) return;
					ticking = true;
					window.requestAnimationFrame( () => {
						let nearest = 0;
						let nearestDistance = Infinity;
						cards.forEach( ( card, index ) => {
							const distance = Math.abs(
								card.offsetLeft -
									track.offsetLeft -
									parseFloat(
										getComputedStyle( track ).paddingLeft
									) -
									track.scrollLeft
							);
							if ( distance < nearestDistance ) {
								nearestDistance = distance;
								nearest = index;
							}
						} );
						setActive( nearest );
						ticking = false;
					} );
				},
				{ passive: true }
			);
		} );
}
