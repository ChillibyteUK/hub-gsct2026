/**
 * Dividends block: annual stacked chart with year-range pills, searchable
 * history with progressive disclosure, and CSV export. Scoped per section
 * so multiple blocks never interfere. Table striping (.is-alt) is
 * re-applied to visible rows on every pass, so hiding rows can't break
 * the alternation.
 */
export function initDividends() {
	document.querySelectorAll( '.hub-dividends' ).forEach( ( section ) => {
		initDividendChart( section );
		initDividendHistory( section );
	} );
}

function initDividendChart( section ) {
	const canvas = section.querySelector( '[data-div-chart]' );

	if ( ! canvas || typeof window.Chart === 'undefined' ) {
		return;
	}

	let years = [];
	try {
		years = JSON.parse( canvas.getAttribute( 'data-chart' ) || '[]' );
	} catch ( err ) {
		return;
	}

	if ( ! years.length ) {
		return;
	}

	const chart = new window.Chart( canvas, {
		type: 'bar',
		data: { labels: [], datasets: [] },
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					backgroundColor: '#ffffff',
					titleColor: '#1e1e1e',
					bodyColor: '#1e1e1e',
					borderColor: '#e0e0e0',
					borderWidth: 1,
					padding: 12,
					displayColors: true,
					boxPadding: 4,
					callbacks: {
						title: ( items ) => String( items[ 0 ].label ),
						label: ( context ) => ` ${ context.dataset.label } ${ Number( context.parsed.y ).toFixed( 2 ) } GBp`,
						labelColor: ( context ) => ( {
							borderColor: context.dataset.backgroundColor,
							backgroundColor: context.dataset.backgroundColor,
						} ),
					},
				},
			},
			scales: {
				x: {
					stacked: true,
					grid: { display: false },
				},
				y: {
					stacked: true,
					beginAtZero: true,
					title: {
						display: true,
						text: 'Dividend (GBp)',
					},
					ticks: {
						stepSize: 1,
						autoSkip: false,
					},
					grid: {
						color: '#e5e5e5',
					},
				},
			},
			},
		} );

		const render = ( count ) => {
			const slice = 0 === count ? years : years.slice( -count );
			chart.data.labels = slice.map( ( row ) => row.year );
			chart.data.datasets = [
				{
					label: 'Final',
					data: slice.map( ( row ) => row.final ),
					backgroundColor: '#307eff',
					borderRadius: 3,
					borderSkipped: 'start',
				},
				{
					label: 'Interim',
					data: slice.map( ( row ) => row.interim ),
					backgroundColor: '#7628d4',
					borderRadius: 3,
					borderSkipped: 'start',
				},
			];
			chart.update();
		};

		const pills = section.querySelector( '[data-div-pills]' );

		if ( pills ) {
			pills.querySelectorAll( 'button[data-years]' ).forEach( ( button ) => {
				button.addEventListener( 'click', () => {
					pills.querySelectorAll( 'button[data-years]' ).forEach( ( other ) => {
						other.classList.toggle( 'is-active', other === button );
					} );
					render( parseInt( button.getAttribute( 'data-years' ), 10 ) || 0 );
				} );
			} );
		}

		render( 5 );
	}

function initDividendHistory( section ) {
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
