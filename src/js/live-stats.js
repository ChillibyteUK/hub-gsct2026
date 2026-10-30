/**
 * Shared refresh loop for blocks whose figures come from a REST route
 * (Stats Banner, Share Price). The block's HTML can be served from a page
 * cache (Kinsta) long after its figures went stale, while REST routes
 * bypass that cache — so on load, and every minute while the tab is
 * visible, this fetches the block's data-endpoint and hands the result to
 * the block's own `apply`.
 *
 * If the route can't be reached, the server-rendered values stay only
 * while the data behind them (data-as-of: the oldest underlying fetch,
 * Unix seconds) is under an hour old — the same limit the server applies
 * to its own fallback data. Past that, `blank` is called so every figure
 * becomes a dash instead of showing something stale. The server's own
 * clock (returned as `now`) is used for that age check once known, so a
 * wrong visitor clock can't blank or keep figures wrongly.
 *
 * @param {HTMLElement} root  Block element carrying data-endpoint / data-as-of.
 * @param {Object}      hooks `apply( stats )` paints a response; `blank()`
 *                            dashes everything; `valid( stats )` (optional)
 *                            rejects an unexpected response shape.
 */
const REFRESH_MS = 60 * 1000;
const MAX_AGE_S = 60 * 60;

export function initLiveStats( root, { apply, blank, valid = () => true } ) {
	const endpoint = root.dataset.endpoint;
	let asOf = Number( root.dataset.asOf ) || 0;
	let clockOffsetMs = 0;
	let inFlight = false;

	const blankIfStale = () => {
		const nowS = ( Date.now() + clockOffsetMs ) / 1000;

		if ( ! asOf || nowS - asOf > MAX_AGE_S ) {
			blank();
		}
	};

	const refresh = async () => {
		if ( inFlight ) {
			return;
		}

		inFlight = true;

		try {
			const response = await fetch( endpoint, {
				cache: 'no-store',
				headers: { Accept: 'application/json' },
			} );

			if ( ! response.ok ) {
				throw new Error( `HTTP ${ response.status }` );
			}

			const stats = await response.json();

			if ( ! stats || ! valid( stats ) ) {
				throw new Error( 'Unexpected response' );
			}

			clockOffsetMs = ( Number( stats.now ) || 0 ) * 1000 - Date.now();
			asOf = Number( stats.as_of ) || 0;
			apply( stats );
		} catch ( error ) {
			blankIfStale();
		} finally {
			inFlight = false;
		}
	};

	refresh();

	window.setInterval( () => {
		if ( ! document.hidden ) {
			refresh();
		}
	}, REFRESH_MS );

	document.addEventListener( 'visibilitychange', () => {
		if ( ! document.hidden ) {
			refresh();
		}
	} );
}

/**
 * Set the text of a root's [data-stat="name"] element, only when it
 * actually changes (keeps the DOM, and screen readers, quiet).
 */
export function setStat( root, name, text ) {
	const el = root.querySelector( `[data-stat="${ name }"]` );

	if ( el && el.textContent !== text ) {
		el.textContent = text;
	}

	return el;
}
