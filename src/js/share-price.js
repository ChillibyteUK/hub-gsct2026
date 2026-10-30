/**
 * Share Price block live figures — see live-stats.js for the refresh and
 * one-hour-staleness rules. This file only knows the block's own markup.
 */
import { initLiveStats, setStat } from './live-stats';

const DASH = '–';
const FIELDS = [ 'price', 'change', 'updated', 'open', 'prev', 'day_low', 'day_high', 'volume', 'mcap', 'year_low', 'year_high' ];

export function initSharePrice() {
	document.querySelectorAll( '.hub-share-price[data-endpoint]' ).forEach( ( block ) => {
		const apply = ( stats ) => {
			FIELDS.forEach( ( field ) => setStat( block, field, stats[ field ] ) );

			const change = block.querySelector( '[data-stat="change"]' );

			if ( change ) {
				change.classList.toggle( 'is-up', 'is-up' === stats.change_class );
				change.classList.toggle( 'is-down', 'is-down' === stats.change_class );
			}

			const status = block.querySelector( '[data-stat="status"]' );

			if ( status ) {
				status.hidden = ! stats.status;
				setStat( block, 'status', stats.status || '' );
			}
		};

		initLiveStats( block, {
			apply,
			valid: ( stats ) => typeof stats.price === 'string',
			blank: () => {
				const blanks = { change_class: '', status: '' };
				FIELDS.forEach( ( field ) => {
					blanks[ field ] = DASH;
				} );
				apply( blanks );
			},
		} );
	} );
}
