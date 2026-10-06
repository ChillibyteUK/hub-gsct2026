/**
 * Dividend calculator form ([data-div-calc]) — submits its dates and
 * share count to GET hub/v1/dividend-calc and renders the total plus
 * yield, with failures shown inline. Scoped per section.
 */
export function initDividendCalculator() {
	document.querySelectorAll( '[data-div-calc]' ).forEach( ( form ) => {
		const section = form.closest( '.hub-dividend-calculator' ) || document;
		const submit = form.querySelector( '[data-div-calc-submit]' );
		const error = form.querySelector( '[data-div-calc-error]' );
		const results = section.querySelector( '[data-div-calc-results]' );
		const total = section.querySelector( '[data-div-calc-total]' );
		const payments = section.querySelector( '[data-div-calc-payments]' );
		const paymentRows = section.querySelector( '[data-div-calc-payment-rows]' );
		let lastYieldText = '–';

		const gbp = ( value ) => Number( value ).toLocaleString( 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 } );

		// Recompute per-row amounts plus the grand total from the row
		// inputs. Yield is per-share by definition, so row edits move the
		// amounts/total but never the yield.
		const recalc = () => {
			let grand = 0;

			if ( paymentRows ) {
				paymentRows.querySelectorAll( 'tr' ).forEach( ( row ) => {
					const input = row.querySelector( 'input' );
					const amount = row.querySelector( '[data-div-calc-amount]' );

					if ( ! input || ! amount ) {
						return;
					}

					const shares = Math.max( 0, parseInt( input.value, 10 ) || 0 );
					const value = parseFloat( input.getAttribute( 'data-value' ) ) || 0;
					const rowTotal = shares * value;

					amount.textContent = gbp( rowTotal );
					grand += rowTotal;
				} );
			}

			if ( total ) {
				total.textContent = gbp( grand );
			}
			if ( live ) {
				live.textContent = `Total dividend amount ${ gbp( grand ) } GBp. Dividend yield ${ lastYieldText }.`;
			}
		};

		if ( paymentRows ) {
			paymentRows.addEventListener( 'input', recalc );
		}
		const yieldOut = section.querySelector( '[data-div-calc-yield]' );
		const yieldNote = section.querySelector( '[data-div-calc-yield-note]' );
		const live = section.querySelector( '[data-div-calc-live]' );

		const endpoint = form.getAttribute( 'data-endpoint' );

		if ( ! endpoint ) {
			return;
		}

		form.addEventListener( 'submit', async ( event ) => {
			event.preventDefault();

			const params = new URLSearchParams( new FormData( form ) );

			if ( error ) {
				error.hidden = true;
			}
			if ( submit ) {
				submit.disabled = true;
			}

			try {
				const response = await fetch( `${ endpoint }?${ params.toString() }`, {
					headers: { Accept: 'application/json' },
				} );

				const data = await response.json();

				if ( ! response.ok ) {
					throw new Error( data?.message || 'Calculation failed.' );
				}

				const totalText = `${ Number( data.total_gbp ).toLocaleString( 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 } ) }`;
				const yieldText = null === data.yield_pct ? '–' : `${ Number( data.yield_pct ).toFixed( 2 ) }%`;

				if ( total ) {
					total.textContent = totalText;
				}
				if ( yieldOut ) {
					yieldOut.textContent = yieldText;
				}
				if ( yieldNote ) {
					const noteText = data.yield_note || '';
					yieldNote.textContent = noteText;
					yieldNote.hidden = '' === noteText;
				}
				if ( results ) {
					results.hidden = false;
				}
				lastYieldText = yieldText;

				if ( payments && paymentRows ) {
					paymentRows.textContent = '';

					const formShares = Math.max( 0, parseInt( new FormData( form ).get( 'shares' ), 10 ) || 0 );

					( data.payments || [] ).forEach( ( payment ) => {
						const row = document.createElement( 'tr' );
						[ payment.ex, payment.pay, payment.type, Number( payment.value ).toFixed( 2 ) ].forEach( ( cell, index ) => {
							const td = document.createElement( 'td' );
							td.textContent = cell ?? '';
							if ( 3 === index ) {
								td.className = 'hub-dividends__value-col';
							}
							row.appendChild( td );
						} );

						const sharesTd = document.createElement( 'td' );
						const sharesInput = document.createElement( 'input' );
						sharesInput.type = 'number';
						sharesInput.min = '0';
						sharesInput.step = '1';
						sharesInput.value = String( formShares );
						sharesInput.setAttribute( 'data-value', String( payment.value ) );
						sharesInput.setAttribute( 'aria-label', `Shares held for dividend paid ${ payment.pay }` );
						sharesTd.appendChild( sharesInput );
						row.appendChild( sharesTd );

						const amountTd = document.createElement( 'td' );
						amountTd.className = 'hub-dividends__value-col';
						amountTd.setAttribute( 'data-div-calc-amount', '' );
						amountTd.textContent = gbp( formShares * Number( payment.value ) );
						row.appendChild( amountTd );

						paymentRows.appendChild( row );
					} );

					payments.hidden = 0 === ( data.payments || [] ).length;
				}
				if ( live ) {
					live.textContent = `Total dividend amount ${ totalText } GBp. Dividend yield ${ yieldText }.`;
				}
			} catch ( err ) {
				if ( error ) {
					error.textContent = err?.message || 'Calculation failed.';
					error.hidden = false;
				}
				if ( results ) {
					results.hidden = true;
				}
				if ( payments ) {
					payments.hidden = true;
				}
			} finally {
				if ( submit ) {
					submit.disabled = false;
				}
			}
		} );
	} );
}
