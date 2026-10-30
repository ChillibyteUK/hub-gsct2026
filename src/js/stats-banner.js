/**
 * Stats Banner live figures — see live-stats.js for the refresh and
 * one-hour-staleness rules. This file only knows the banner's own markup.
 */
import { initLiveStats, setStat } from './live-stats';

const DASH = '–';

function setNavDate( banner, iso, label ) {
	const el = banner.querySelector( '[data-stat="nav-date"]' );

	if ( ! el ) {
		return;
	}

	if ( ! iso ) {
		el.hidden = true;
		el.textContent = '';
		return;
	}

	const time = el.querySelector( 'time' );

	if ( time && time.getAttribute( 'datetime' ) === iso && time.textContent === label ) {
		el.hidden = false;
		return;
	}

	const node = document.createElement( 'time' );
	node.setAttribute( 'datetime', iso );
	node.textContent = label;
	el.textContent = 'NAV as at ';
	el.appendChild( node );
	el.hidden = false;
}

export function initStatsBanner() {
	document.querySelectorAll( '.hub-stats-banner[data-endpoint]' ).forEach( ( banner ) => {
		const apply = ( stats ) => {
			setStat( banner, 'price', stats.price );
			setStat( banner, 'nav', stats.nav );
			setStat( banner, 'premium', stats.premium );
			setStat( banner, 'premium-label', stats.premium_label );
			setStat( banner, 'yield', stats.yield );
			setNavDate( banner, stats.nav_date, stats.nav_date_label );
		};

		initLiveStats( banner, {
			apply,
			valid: ( stats ) => typeof stats.price === 'string',
			blank: () => {
				apply( {
					price: DASH,
					nav: DASH,
					premium: DASH,
					premium_label: 'Premium',
					yield: DASH,
					nav_date: '',
					nav_date_label: '',
				} );
			},
		} );
	} );
}
