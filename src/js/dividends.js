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

	// Bar geometry: bars max out at 40px (26px on mobile) with 32px between
	// them, so a category "pitch" tops out at 72px (58px). With plenty of
	// width the plot area is narrowed to years x pitch and left-aligned to
	// the axis (the spare width goes into the chart's right padding), so the
	// spacing never exceeds 32px. When there are more years than fit (the
	// All view) the plot fills the width and bars shrink in the same
	// bar:gap proportion.
	const mobileQuery = window.matchMedia( '(max-width: 767px)' );
	const geometry = () => ( mobileQuery.matches ? { bar: 26, gap: 32 } : { bar: 40, gap: 32 } );
	let axisWidth = 60; // y-axis width from the previous layout pass.

	const fitPlotArea = {
		id: 'hubDividendsFit',
		beforeLayout( instance ) {
			const count = instance.data.labels.length;
			if ( ! count ) {
				return;
			}
			const { bar, gap } = geometry();
			const free = instance.width - axisWidth - count * ( bar + gap );
			instance.options.layout.padding.right = Math.max( 0, free );
		},
		// The plot area stops short of the canvas edge, so carry the y gridlines
		// (including the zero baseline) on across the spare width — the chart
		// reads as full width while the bars stay left-aligned.
		beforeDatasetsDraw( instance ) {
			const { ctx, chartArea, scales, width } = instance;
			const y = scales.y;
			if ( ! y || chartArea.right >= width - 0.5 ) {
				return;
			}
			ctx.save();
			ctx.strokeStyle = y.options.grid.color;
			ctx.lineWidth = 1;
			ctx.beginPath();
			y.ticks.forEach( ( tick ) => {
				const py = Math.round( y.getPixelForValue( tick.value ) ) + 0.5;
				ctx.moveTo( chartArea.right, py );
				ctx.lineTo( width, py );
			} );
			ctx.stroke();
			ctx.restore();
		},
		afterLayout( instance ) {
			const actual = instance.scales.y ? instance.scales.y.width : axisWidth;
			if ( Math.abs( actual - axisWidth ) > 0.5 ) {
				axisWidth = actual;
				window.requestAnimationFrame( () => instance.update( 'none' ) );
			}
		},
	};

	const chart = new window.Chart( canvas, {
		type: 'bar',
		data: { labels: [], datasets: [] },
		plugins: [ fitPlotArea ],
		options: {
			responsive: true,
			maintainAspectRatio: false,
			layout: { padding: { right: 0 } },
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

		// Scriptable so a viewport change between mobile and desktop picks up
		// the right bar:pitch ratio on the next layout without a rebuild.
		const barShare = () => {
			const { bar, gap } = geometry();
			return bar / ( bar + gap );
		};

		const render = ( count ) => {
			const slice = 0 === count ? years : years.slice( -count );
		chart.data.labels = slice.map( ( row ) => row.year );
		// Stack order: first dataset sits at the bottom — Interim (purple)
		// below, Final (blue) on top.
		chart.data.datasets = [
			{
				label: 'Interim',
				data: slice.map( ( row ) => row.interim ),
				backgroundColor: '#7628d4',
				categoryPercentage: 1,
				barPercentage: barShare,
				borderRadius: 3,
				borderSkipped: 'start',
			},
			{
				label: 'Final',
				data: slice.map( ( row ) => row.final ),
				backgroundColor: '#307eff',
				categoryPercentage: 1,
				barPercentage: barShare,
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
