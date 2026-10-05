/**
 * Announcements (Investis RNS tool) enhancement. The tool renders
 * everything client-side and re-renders on every filter/page change, so
 * this runs once at init plus on every DOM change inside the container —
 * every step is guarded to be a no-op on repeat runs:
 *
 * - moves each row's .form-type category content into a real Category
 *   column (with matching header), leaving rows without one an empty
 *   cell so columns stay aligned. The "Form type" sr-only span moves
 *   with it untouched.
 * - appends a visible "Download" label to the icon-only PDF links.
 * - builds the "Search results / N documents found" heading and the
 *   "Page X of Y (Z results)" footer from the tool's own count text,
 *   hiding the tool's duplicated native counts once parsed.
 */
export function initAnnouncements() {
	document.querySelectorAll( '.hub-announcements' ).forEach( ( section ) => {
		const root = section.querySelector( '.invd-container' );

		if ( ! root ) {
			return;
		}

		const enhance = () => {
			enhanceAnnouncements( section );
		};

		enhance();
		new MutationObserver( enhance ).observe( root, { childList: true, subtree: true } );
	} );
}

function enhanceAnnouncements( section ) {
	const table = section.querySelector( 'table.invd-table' );

	if ( ! table ) {
		return;
	}

	const headRow = table.querySelector( 'thead tr' );

	if ( headRow && ! headRow.querySelector( '.hub-ann-cat-th' ) ) {
		const th = document.createElement( 'th' );
		th.scope = 'col';
		th.className = 'hub-ann-cat-th';
		th.textContent = 'Category';
		const downloadTh = headRow.querySelector( '.invd-download-th' );
		headRow.insertBefore( th, downloadTh );

		const dateTh = headRow.querySelector( '.invd-date-time-th' );
		if ( dateTh && 'Date and time' === ( dateTh.textContent || '' ).trim() ) {
			dateTh.textContent = 'Date';
		}
	}

	// Every step below is self-guarding (not flag-once): the tool hydrates
	// rows progressively, so links and categories can arrive after this has
	// already run over the row. Re-runs converge instead of duplicating.
	table.querySelectorAll( 'tbody tr' ).forEach( ( row ) => {
		let catTd = row.querySelector( '.hub-ann-cat-td' );
		if ( ! catTd ) {
			catTd = document.createElement( 'td' );
			catTd.className = 'hub-ann-cat-td';
			row.insertBefore( catTd, row.querySelector( '.invd-download-td' ) );
		}
		const formType = row.querySelector( '.form-type' );
		if ( formType && formType.parentElement !== catTd ) {
			catTd.appendChild( formType );
		}

		const link = row.querySelector( '.invd-download-td a.pdf' );
		if ( link ) {
			// Swap the tool's large document glyph for the theme's small
			// download arrow — one less specificity fight to win.
			const icon = link.querySelector( '.icon' );
			if ( icon && ! icon.querySelector( 'svg.hub-ann-dl-icon' ) ) {
				icon.innerHTML = '<svg class="hub-ann-dl-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 1v8m0 0 3-3M7 9 4 6M2 11v1.5A.5.5 0 0 0 2.5 13h9a.5.5 0 0 0 .5-.5V11"/></svg>';
			}
			if ( ! link.querySelector( '.hub-ann-dl-text' ) ) {
				const label = document.createElement( 'span' );
				label.className = 'hub-ann-dl-text';
				label.textContent = 'Download';
				link.appendChild( label );
			}
		}
	} );

	// Tag pagination controls with our own classes (styling no longer
	// depends on the tool's selectors). classList is idempotent, so this
	// is observer-safe.
	const pager = section.querySelector( 'cid-pagination' );
	if ( pager ) {
		pager.querySelectorAll( 'a, button' ).forEach( ( el ) => {
			el.classList.add( 'hub-ann-page' );
		} );
	}

	const countSource = section.querySelector( '.news-result-count .msg-alignment' );
	if ( ! countSource ) {
		return;
	}

	const match = ( countSource.textContent || '' ).match( /Displaying\s+(\d+)\s*-\s*(\d+)\s+of\s+([\d,]+)/i );
	if ( ! match ) {
		return;
	}

	const start = parseInt( match[ 1 ], 10 );
	const end = parseInt( match[ 2 ], 10 );
	const total = parseInt( match[ 3 ].replace( /,/g, '' ), 10 );
	if ( ! start || ! end || ! total ) {
		return;
	}

	const pageSize = end - start + 1;
	const page = Math.floor( ( start - 1 ) / pageSize ) + 1;
	const totalPages = Math.ceil( total / pageSize );
	const totalText = total.toLocaleString( 'en-GB' );

	let head = section.querySelector( '.hub-ann-head' );
	if ( ! head ) {
		head = document.createElement( 'div' );
		head.className = 'hub-ann-head';
		const heading = document.createElement( 'h2' );
		heading.className = 'text-body-l-medium';
		heading.textContent = 'Search results';
		const count = document.createElement( 'p' );
		count.className = 'hub-ann-count';
		head.appendChild( heading );
		head.appendChild( count );
		const tableWrap = table.closest( '.table-layout' ) || table;
		tableWrap.parentNode.insertBefore( head, tableWrap );
	}
	// Compare-before-write throughout here: assigning textContent mutates
	// the DOM even when the string is identical, which would re-trigger
	// this same observer forever and hang the page.
	const countEl = head.querySelector( '.hub-ann-count' );
	const countText = `${ totalText } documents found`;
	if ( countEl.textContent !== countText ) {
		countEl.textContent = countText;
	}

	let foot = section.querySelector( '.hub-ann-foot' );
	if ( ! foot ) {
		foot = document.createElement( 'div' );
		foot.className = 'hub-ann-foot';
		const tableWrap = table.closest( '.table-layout' ) || table;
		tableWrap.parentNode.insertBefore( foot, tableWrap.nextSibling );
	}
	const footText = `Page ${ page } of ${ totalPages } (${ totalText } results)`;
	if ( foot.textContent !== footText ) {
		foot.textContent = footText;
	}

	const pagerMarked = section.querySelector( 'cid-pagination' );
	if ( pagerMarked ) {
		pagerMarked.querySelectorAll( 'a, button' ).forEach( ( el ) => {
			const label = ( el.textContent || '' ).trim();
			el.classList.toggle( 'is-current', label === String( page ) );
		} );
	}

	section.classList.add( 'hub-ann-counts-replaced' );
}
