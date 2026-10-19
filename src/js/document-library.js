/**
 * Document library filtering ([data-doc-row]) — one category pill at a
 * time (toggle off by clicking again), overflow categories under the More
 * dropdown, and a keyword search. Which pills show is rebalanced from the
 * available width on load, resize and font settle (the server split is only
 * the no-JS fallback). The search matches titles instantly and, after a
 * short pause, asks the hub/v1/doc-search endpoint which documents contain
 * the words in their file text (shown with a snippet). Everything combines
 * client-side with no reload; visible rows are re-striped and re-counted
 * on every pass. Scoped per section so multiple libraries never interfere.
 */
export function initDocumentLibraries() {
	document.querySelectorAll( '.hub-document-library' ).forEach( ( section ) => {
		const rows = Array.from( section.querySelectorAll( '[data-doc-row]' ) );
		const empty = section.querySelector( '[data-doc-empty]' );
		const search = section.querySelector( '[data-document-library-search]' );
		const pills = Array.from( section.querySelectorAll( '.hub-document-library__pill[data-cat]' ) );
		const more = section.querySelector( '.hub-document-library__more' );
		const toggle = section.querySelector( '.hub-document-library__more-toggle' );
		const menu = section.querySelector( '.hub-document-library__menu' );
		const menuItems = menu ? Array.from( menu.querySelectorAll( '.hub-document-library__menu-item' ) ) : [];

		if ( 0 === rows.length ) {
			return;
		}

		const endpoint = section.getAttribute( 'data-search-endpoint' );
		let activeCat = '';
		let contentHits = new Map();
		let contentQuery = '';
		let pending = null;
		let timer = null;

		const setPressed = ( button, on ) => {
			button.classList.toggle( 'active', on );
			button.setAttribute( 'aria-pressed', String( on ) );
		};

		// The menu opens under the More button, which usually sits at the far
		// right of the row, so shift it just far enough to stay inside the
		// viewport (one rem of breathing room each side). Measured from its
		// natural left:0 position every time, so a resize while open re-fits.
		const fitMenu = () => {
			if ( ! menu || menu.hidden ) {
				return;
			}

			menu.style.left = '';
			const rect = menu.getBoundingClientRect();
			const viewport = document.documentElement.clientWidth;
			const margin = parseFloat( getComputedStyle( document.documentElement ).fontSize ) || 16;
			let shift = 0;

			if ( rect.right > viewport - margin ) {
				shift = viewport - margin - rect.right;
			}
			if ( rect.left + shift < margin ) {
				shift = margin - rect.left;
			}
			if ( 0 !== shift ) {
				menu.style.left = `${ shift }px`;
			}
		};

		const closeMenu = () => {
			if ( ! menu || ! toggle || menu.hidden ) {
				return;
			}

			menu.hidden = true;
			toggle.setAttribute( 'aria-expanded', 'false' );
		};

		const escapeRegExp = ( text ) => text.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

		// Snippet under the title, with the searched words wrapped in <mark>.
		const setSnippet = ( row, text, query ) => {
			const cell = row.querySelector( 'td' );
			let el = row.querySelector( '.hub-document-library__snippet' );

			if ( ! cell ) {
				return;
			}

			if ( ! text ) {
				el?.remove();
				return;
			}

			if ( ! el ) {
				el = document.createElement( 'p' );
				el.className = 'hub-document-library__snippet';
				cell.appendChild( el );
			}

			el.textContent = '';

			const words = query.split( /\s+/ ).filter( ( word ) => word.length > 1 );
			const parts = words.length ? text.split( new RegExp( '(' + words.map( escapeRegExp ).join( '|' ) + ')', 'i' ) ) : [ text ];

			parts.forEach( ( part, index ) => {
				if ( index % 2 ) {
					const mark = document.createElement( 'mark' );
					mark.textContent = part;
					el.appendChild( mark );
				} else {
					el.appendChild( document.createTextNode( part ) );
				}
			} );
		};

		const apply = () => {
			const query = ( search?.value || '' ).trim().toLowerCase();
			const hitsCurrent = contentQuery === query;
			let shown = 0;

			rows.forEach( ( row ) => {
				const inCat = ! activeCat || ( row.getAttribute( 'data-cats' ) || '' ).split( ' ' ).includes( activeCat );
				const inTitle = ! query || ( row.getAttribute( 'data-title' ) || '' ).includes( query );
				const snippet = query && hitsCurrent ? contentHits.get( row.getAttribute( 'data-doc-id' ) ) : undefined;
				const visible = inCat && ( inTitle || undefined !== snippet );

				setSnippet( row, snippet, query );
				row.hidden = ! visible;

				if ( visible ) {
					shown += 1;
					row.classList.toggle( 'is-alt', 0 === shown % 2 );
				} else {
					row.classList.remove( 'is-alt' );
				}
			} );

			if ( empty ) {
				empty.hidden = shown > 0;
			}
		};

		const selectCat = ( slug ) => {
			activeCat = activeCat === slug ? '' : slug;

			// Live query — rebalancing moves buttons between the row and
			// the menu, so the init-time arrays may be stale.
			section.querySelectorAll( '[data-cat]' ).forEach( ( button ) => {
				setPressed( button, button.getAttribute( 'data-cat' ) === activeCat );
			} );

			if ( toggle ) {
				const inMenu = menuItems.some( ( item ) => item.getAttribute( 'data-cat' ) === activeCat );
				toggle.classList.toggle( 'active', inMenu );
			}

			apply();
		};

		pills.forEach( ( pill ) => {
			pill.addEventListener( 'click', () => {
				selectCat( pill.getAttribute( 'data-cat' ) || '' );
			} );
		} );

		menuItems.forEach( ( item ) => {
			item.addEventListener( 'click', () => {
				selectCat( item.getAttribute( 'data-cat' ) || '' );
				closeMenu();
			} );
		} );

		// Pills moved into the menu by rebalancing keep their own listener
		// (selectCat) but not the menu's auto-close — delegate that.
		if ( menu ) {
			menu.addEventListener( 'click', ( event ) => {
				if ( event.target.closest( '[data-cat]' ) ) {
					closeMenu();
				}
			} );
		}

		if ( toggle && menu ) {
			toggle.addEventListener( 'click', ( event ) => {
				event.stopPropagation();
				const open = menu.hidden;
				menu.hidden = ! open;
				toggle.setAttribute( 'aria-expanded', String( open ) );
				fitMenu();
			} );

			window.addEventListener( 'resize', fitMenu );

			document.addEventListener( 'click', ( event ) => {
				if ( more && ! more.contains( event.target ) ) {
					closeMenu();
				}
			} );

			document.addEventListener( 'keydown', ( event ) => {
				if ( 'Escape' === event.key ) {
					closeMenu();
				}
			} );
		}

		// Width-based pill overflow: fit as many pills as the row holds, the
	// rest go in the More menu (prepended in order). Moved nodes keep
	// their listeners; classes swap so each location's styling applies.
	// The server-rendered split is only the no-JS fallback.
	const filters = section.querySelector( '.hub-document-library__filters' );

	const rebalancePills = () => {
		if ( ! filters || ! more || ! menu ) {
			return;
		}

		Array.from( menu.children ).forEach( ( item ) => {
			item.classList.remove( 'hub-document-library__menu-item' );
			item.classList.add( 'hub-document-library__pill' );
			filters.insertBefore( item, more );
		} );

		// Keep More in flow while measuring so its own width counts.
		more.hidden = false;

		for ( ;; ) {
			const visible = Array.from(
				filters.querySelectorAll( ':scope > .hub-document-library__pill[data-cat]' )
			);

			if ( ! visible.length ) {
				break;
			}

			const row = filters.getBoundingClientRect();
			const box = more.getBoundingClientRect();
			const fits = box.top <= row.top + 1 && box.right <= row.right + 1;

			if ( fits ) {
				break;
			}

			const last = visible[ visible.length - 1 ];
			last.classList.remove( 'hub-document-library__pill' );
			last.classList.add( 'hub-document-library__menu-item' );
			menu.prepend( last );
		}

		more.hidden = ! menu.children.length;
	};

	rebalancePills();

	if ( document.fonts && document.fonts.ready ) {
		document.fonts.ready.then( () => rebalancePills() );
	}

	let rebalanceTimer = null;
	window.addEventListener( 'resize', () => {
		clearTimeout( rebalanceTimer );
		rebalanceTimer = setTimeout( () => rebalancePills(), 150 );
	} );

	// Ask the server which documents contain the words in their file text.
		const fetchContent = ( query ) => {
			pending?.abort();

			if ( ! endpoint || query.length < 3 ) {
				contentHits = new Map();
				contentQuery = query;
				apply();
				return;
			}

			pending = new AbortController();
			section.setAttribute( 'aria-busy', 'true' );

			fetch( endpoint + '?q=' + encodeURIComponent( query ), { signal: pending.signal } )
				.then( ( response ) => ( response.ok ? response.json() : null ) )
				.then( ( data ) => {
					if ( ! data ) {
						return;
					}

					contentHits = new Map( Object.entries( data.hits || {} ) );
					contentQuery = query;
					section.removeAttribute( 'aria-busy' );
					apply();
				} )
				.catch( ( error ) => {
					if ( 'AbortError' !== error.name ) {
						section.removeAttribute( 'aria-busy' );
					}
				} );
		};

		if ( search ) {
			search.addEventListener( 'input', () => {
				apply();
				clearTimeout( timer );
				timer = setTimeout( () => fetchContent( search.value.trim().toLowerCase() ), 250 );
			} );
		}
	} );
}
