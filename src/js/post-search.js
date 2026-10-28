/**
 * Post search (Insights index, Learning posts grid). Typing swaps the card
 * grid for a list of matching articles — title, date · category and a
 * snippet around the match, with the searched words wrapped in <mark> —
 * fetched from hub/v1/post-search (inc/post-search.php). Clearing the box
 * restores the grid. Which view to hide and where to put results travel as
 * data attributes on the input ([data-post-search]).
 */
export function initPostSearch() {
	document.querySelectorAll( '[data-post-search]' ).forEach( ( input ) => {
		const results = document.querySelector( input.getAttribute( 'data-results' ) || '' );
		const hideSelector = input.getAttribute( 'data-hide' ) || '';
		const endpoint = input.getAttribute( 'data-endpoint' );
		const initialCategory = input.getAttribute( 'data-category' ) || '0';
		let category = initialCategory;
		const pills = Array.from( document.querySelectorAll( ( input.getAttribute( 'data-filters' ) || '' ) + ' [data-cat-id]' ) );

		if ( ! results || ! endpoint ) {
			return;
		}

		const hidden = new Map();
		let timer = null;
		let pending = null;

		const escapeRegExp = ( text ) => text.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

		const highlight = ( el, text, words ) => {
			el.textContent = '';

			if ( ! words.length ) {
				el.textContent = text;
				return;
			}

			text.split( new RegExp( '(' + words.map( escapeRegExp ).join( '|' ) + ')', 'i' ) ).forEach( ( part, index ) => {
				if ( index % 2 ) {
					const mark = document.createElement( 'mark' );
					mark.textContent = part;
					el.appendChild( mark );
				} else if ( part ) {
					el.appendChild( document.createTextNode( part ) );
				}
			} );
		};

		const setView = ( searching ) => {
			document.querySelectorAll( hideSelector ).forEach( ( el ) => {
				if ( searching ) {
					if ( ! hidden.has( el ) ) {
						hidden.set( el, el.hidden );
					}
					el.hidden = true;
				} else if ( hidden.has( el ) ) {
					el.hidden = hidden.get( el );
					hidden.delete( el );
				}
			} );

			results.hidden = ! searching;
		};

		const render = ( items, query ) => {
			const words = query.split( /\s+/ ).filter( ( word ) => word.length > 1 );

			results.textContent = '';

			const status = document.createElement( 'p' );
			status.className = 'hub-post-results__status';
			status.setAttribute( 'role', 'status' );
			status.textContent = items.length
				? `${ items.length } ${ 1 === items.length ? 'article' : 'articles' } found`
				: 'No articles found. Try different keywords.';
			results.appendChild( status );

			if ( ! items.length ) {
				return;
			}

			const list = document.createElement( 'ul' );
			list.className = 'hub-post-results__list';

			items.forEach( ( item ) => {
				const li = document.createElement( 'li' );
				li.className = 'hub-post-results__item';

				const meta = document.createElement( 'p' );
				meta.className = 'hub-post-results__meta';
				meta.textContent = [ item.date, item.category ].filter( Boolean ).join( ' · ' );

				const title = document.createElement( 'h3' );
				title.className = 'hub-post-results__title h3-data-m';
				const link = document.createElement( 'a' );
				link.href = item.url;
				highlight( link, item.title, words );
				title.appendChild( link );

				li.append( meta, title );

				if ( item.snippet ) {
					const snippet = document.createElement( 'p' );
					snippet.className = 'hub-post-results__snippet';
					highlight( snippet, item.snippet, words );
					li.appendChild( snippet );
				}

				list.appendChild( li );
			} );

			results.appendChild( list );
		};

		const setCategory = ( id ) => {
			category = id;

			pills.forEach( ( pill ) => {
				const on = pill.getAttribute( 'data-cat-id' ) === id;
				pill.classList.toggle( 'is-active', on );
				if ( on ) {
					pill.setAttribute( 'aria-current', 'page' );
				} else {
					pill.removeAttribute( 'aria-current' );
				}
			} );
		};

		const run = () => {
			const query = input.value.trim();

			pending?.abort();

			if ( query.length < 2 ) {
				results.removeAttribute( 'aria-busy' );
				setView( false );

				// Back to the page's own category once the search is cleared.
				if ( category !== initialCategory ) {
					setCategory( initialCategory );
				}
				return;
			}

			pending = new AbortController();
			results.setAttribute( 'aria-busy', 'true' );

			fetch( `${ endpoint }?q=${ encodeURIComponent( query ) }&category=${ encodeURIComponent( category ) }`, { signal: pending.signal } )
				.then( ( response ) => ( response.ok ? response.json() : null ) )
				.then( ( data ) => {
					if ( ! data ) {
						return;
					}

					render( data.results || [], query );
					setView( true );
					results.removeAttribute( 'aria-busy' );
				} )
				.catch( ( error ) => {
					if ( 'AbortError' !== error.name ) {
						results.removeAttribute( 'aria-busy' );
					}
				} );
		};

		// While there's a search term the pills narrow it (links otherwise).
		pills.forEach( ( pill ) => {
			pill.addEventListener( 'click', ( event ) => {
				if ( input.value.trim().length < 2 ) {
					return;
				}

				event.preventDefault();
				setCategory( pill.getAttribute( 'data-cat-id' ) || '0' );
				run();
			} );
		} );

		input.addEventListener( 'input', () => {
			clearTimeout( timer );

			if ( input.value.trim().length < 2 ) {
				run();
				return;
			}

			timer = setTimeout( run, 250 );
		} );
	} );
}
