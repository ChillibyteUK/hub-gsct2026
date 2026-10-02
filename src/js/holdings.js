/**
 * Holdings exclusion toggle — within each .hub-holdings section, keeps
 * exactly the first 10 rows visible, either unfiltered or skipping rows
 * tagged data-hub-holdings-excluded (sector 'Collective investments').
 * Scoped per section so multiple holdings blocks never interfere.
 */
export function initHoldings() {
	document.querySelectorAll( '.hub-holdings' ).forEach( ( section ) => {
		const toggle = section.querySelector( '.hub-holdings__toggle' );

		if ( ! toggle ) {
			return;
		}

		const rows = Array.from(
			section.querySelectorAll( '.hub-holdings__table tbody tr' )
		);

		const apply = ( excluding ) => {
			let shown = 0;
			rows.forEach( ( row ) => {
				if ( excluding && row.hasAttribute( 'data-hub-holdings-excluded' ) ) {
					row.hidden = true;
					row.classList.remove( 'is-alt' );
					return;
				}
				if ( shown < 10 ) {
					row.hidden = false;
					shown += 1;
					const rank = row.querySelector( '.hub-holdings__rank-col' );
					if ( rank ) {
						rank.textContent = String( shown );
					}
					row.classList.toggle( 'is-alt', 0 === shown % 2 );
				} else {
					row.hidden = true;
					row.classList.remove( 'is-alt' );
				}
			} );
		};

		toggle.addEventListener( 'click', () => {
			const excluding = 'true' !== toggle.getAttribute( 'aria-pressed' );
			toggle.setAttribute( 'aria-pressed', String( excluding ) );
			apply( excluding );
		} );
	} );
}
