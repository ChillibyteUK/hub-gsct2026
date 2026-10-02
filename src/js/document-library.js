/**
 * Document library filtering ([data-doc-row]) — one category pill at a
 * time (toggle off by clicking again), overflow categories under the More
 * dropdown, and a title substring search. Everything combines client-side
 * with no reload; visible rows are re-striped and re-counted on every
 * pass. Scoped per section so multiple libraries never interfere.
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

		let activeCat = '';

		const setPressed = ( button, on ) => {
			button.classList.toggle( 'active', on );
			button.setAttribute( 'aria-pressed', String( on ) );
		};

		const closeMenu = () => {
			if ( ! menu || ! toggle || menu.hidden ) {
				return;
			}

			menu.hidden = true;
			toggle.setAttribute( 'aria-expanded', 'false' );
		};

		const apply = () => {
			const query = ( search?.value || '' ).trim().toLowerCase();
			let shown = 0;

			rows.forEach( ( row ) => {
				const inCat = ! activeCat || ( row.getAttribute( 'data-cats' ) || '' ).split( ' ' ).includes( activeCat );
				const inQuery = ! query || ( row.getAttribute( 'data-title' ) || '' ).includes( query );
				const visible = inCat && inQuery;

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

			pills.forEach( ( pill ) => {
				setPressed( pill, pill.getAttribute( 'data-cat' ) === activeCat );
			} );

			menuItems.forEach( ( item ) => {
				setPressed( item, item.getAttribute( 'data-cat' ) === activeCat );
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

		if ( toggle && menu ) {
			toggle.addEventListener( 'click', ( event ) => {
				event.stopPropagation();
				const open = menu.hidden;
				menu.hidden = ! open;
				toggle.setAttribute( 'aria-expanded', String( open ) );
			} );

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

		if ( search ) {
			search.addEventListener( 'input', apply );
		}
	} );
}
