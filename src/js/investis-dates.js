/**
 * Investis dividend tools (HUB Dividends / HUB Dividend Calculator) print
 * dates as US month/day/year ("09/18/2026") whatever the data-lang. The site
 * standard is DD Mon YYYY (18 Sep 2026), so every such date in the tools'
 * output is rewritten in place. The tools render client-side and re-render
 * when the range or calculator inputs change, so this watches for changes
 * rather than running once. Only whole-text-node matches are touched, and
 * never anything inside an input.
 */
const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
const usDate = /\b(\d{2})\/(\d{2})\/(\d{4})\b/g;

function convert( text ) {
	return text.replace( usDate, ( match, month, day, year ) => {
		const m = Number( month );
		return m >= 1 && m <= 12 ? `${ day } ${ months[ m - 1 ] } ${ year }` : match;
	} );
}

function rewrite( root ) {
	const walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT );
	let node = walker.nextNode();

	while ( node ) {
		if ( usDate.test( node.nodeValue ) && ! node.parentElement?.closest( 'input, textarea, script, style' ) ) {
			node.nodeValue = convert( node.nodeValue );
		}
		usDate.lastIndex = 0;
		node = walker.nextNode();
	}
}

// The calculator's date pickers (Duet) also show and parse US month/day/year.
// Duet exposes a dateAdapter for exactly this: DD/MM/YYYY out, and DD/MM/YYYY
// (or . or - separated) in. Set once per picker after it has hydrated; the
// value is then nudged so the input redraws in the new format. The picker's
// own value stays ISO (YYYY-MM-DD), so the calculator itself is unaffected.
const pad = ( n ) => String( n ).padStart( 2, '0' );
const dateAdapter = {
	parse( value = '', createDate ) {
		const match = String( value ).trim().match( /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/ );
		return match ? createDate( match[ 3 ], match[ 2 ], match[ 1 ] ) : undefined;
	},
	format( date ) {
		return `${ pad( date.getDate() ) }/${ pad( date.getMonth() + 1 ) }/${ date.getFullYear() }`;
	},
};

function fixPickers( root ) {
	root.querySelectorAll( 'duet-date-picker.hydrated:not([data-hub-dmy])' ).forEach( ( picker ) => {
		picker.setAttribute( 'data-hub-dmy', '' );
		picker.dateAdapter = dateAdapter;
		const value = picker.value;
		if ( value ) {
			picker.value = '';
			window.setTimeout( () => {
				picker.value = value;
			}, 50 );
		}
	} );
}

export function initInvestisDates() {
	document.querySelectorAll( '.gsct-dvc-overview, .gsct-dvc-calc' ).forEach( ( root ) => {
		let queued = false;
		const run = () => {
			queued = false;
			rewrite( root );
			fixPickers( root );
		};

		new MutationObserver( () => {
			if ( ! queued ) {
				queued = true;
				window.requestAnimationFrame( run );
			}
		} ).observe( root, { childList: true, subtree: true, characterData: true } );

		rewrite( root );
		fixPickers( root );
	} );
}
