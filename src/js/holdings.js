/**
 * Holdings block: exclusion toggle plus column-width locking. The toggle
 * keeps exactly the first 10 rows visible, either unfiltered or skipping
 * rows tagged data-hub-holdings-excluded (sector 'Collective
 * investments'). Widths are locked as percentages derived from the full
 * row set, so they stay fluid with the viewport yet identical filtered or
 * unfiltered. Scoped per section so multiple holdings blocks never
 * interfere.
 */
function lockColumnWidths( section ) {
	const table = section.querySelector( '.hub-holdings__table' );
	const headCells = Array.from(
		section.querySelectorAll( '.hub-holdings__table thead th' )
	);

	if ( ! table || ! headCells.length ) {
		return;
	}

	const rows = Array.from(
		section.querySelectorAll( '.hub-holdings__table tbody tr' )
	);

	// Reveal every row so the measured widths account for the full content
	// set — not just the 10 currently visible — then restore. Synchronous,
	// so nothing paints mid-way. Percentages keep the columns fluid with
	// the viewport while staying identical filtered or unfiltered.
	const hidden = rows.filter( ( row ) => row.hidden );
	hidden.forEach( ( row ) => {
		row.hidden = false;
	} );

	const tableWidth = table.getBoundingClientRect().width;
	const widths = headCells.map(
		( th ) => th.getBoundingClientRect().width
	);

	hidden.forEach( ( row ) => {
		row.hidden = true;
	} );

	// Bail on a zero render (block inside a hidden container etc.) rather
	// than locking everything to 0.
	if ( ! tableWidth || widths.some( ( width ) => ! width ) ) {
		return;
	}

	headCells.forEach( ( th, index ) => {
		th.style.width = `${ ( widths[ index ] / tableWidth ) * 100 }%`;
	} );
}

export function initHoldings() {
	document.querySelectorAll( '.hub-holdings' ).forEach( ( section ) => {
		lockColumnWidths( section );

		// Re-lock once webfonts settle — a late font swap can change text
		// widths after the first lock.
		if ( document.fonts && document.fonts.ready ) {
			document.fonts.ready.then( () => lockColumnWidths( section ) );
		}

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
