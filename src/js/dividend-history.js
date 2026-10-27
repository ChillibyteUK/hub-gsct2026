/**
 * Dividend history (HUB Dividends): searchable table with progressive
 * disclosure ten rows at a time, plus CSV export. Scoped per section so
 * multiple blocks never interfere. Table striping is re-applied to visible
 * rows on every pass (.is-alt), so hiding rows can't break the alternation.
 */
export function initDividendHistory() {
	document.querySelectorAll( '.hub-dividends' ).forEach( ( section ) => {
		initHistory( section );
	} );
}

function initHistory( section ) {
	const rows = Array.from( section.querySelectorAll( '[data-div-row]' ) );

	if ( ! rows.length ) {
		return;
	}

	const search = section.querySelector( '[data-div-search]' );
	const more = section.querySelector( '[data-div-more]' );
	const count = section.querySelector( '[data-div-count]' );
	const csv = section.querySelector( '[data-div-csv]' );
	const table = section.querySelector( '[data-div-export]' );
	let shown = 10;

	const apply = () => {
		const query = ( search?.value || '' ).trim().toLowerCase();
		const matches = rows.filter( ( row ) => ! query || ( row.getAttribute( 'data-search' ) || '' ).includes( query ) );
		let visible = 0;

		rows.forEach( ( row ) => {
			const show = matches.includes( row ) && visible < shown;

			if ( show ) {
				visible += 1;
				row.classList.toggle( 'is-alt', 0 === visible % 2 );
			} else {
				row.classList.remove( 'is-alt' );
			}

			row.hidden = ! show;
		} );

		if ( count ) {
			count.textContent = `${ visible } of ${ matches.length }`;
		}

		if ( more ) {
			more.hidden = visible >= matches.length;
		}
	};

	rows.forEach( ( row, index ) => {
		if ( index < 10 ) {
			row.classList.toggle( 'is-alt', 0 === ( index + 1 ) % 2 );
		}
	} );

	if ( search ) {
		search.addEventListener( 'input', () => {
			shown = 10;
			apply();
		} );
	}

	if ( more ) {
		more.addEventListener( 'click', () => {
			shown += 10;
			apply();
		} );
	}

	if ( csv && table ) {
		csv.addEventListener( 'click', () => {
			let all = [];
			try {
				all = JSON.parse( table.getAttribute( 'data-div-export' ) || '[]' );
			} catch ( err ) {
				return;
			}

			const lines = [ 'Ex-dividend date,Payment date,Dividend type,Dividend (GBp)' ].concat(
				all.map( ( cells ) => cells.map( ( cell ) => `"${ String( cell ).replace( /"/g, '""' ) }"` ).join( ',' ) )
			);

			const blob = new Blob( [ lines.join( '\r\n' ) ], { type: 'text/csv' } );
			const link = document.createElement( 'a' );
			link.href = URL.createObjectURL( blob );
			link.download = 'dividend-history.csv';
			document.body.appendChild( link );
			link.click();
			URL.revokeObjectURL( link.href );
			link.remove();
		} );
	}

	apply();
}
