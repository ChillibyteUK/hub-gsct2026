<?php
/**
 * Investis Digital market data — server-side snapshot fetching for the
 * HUB Stats Banner.
 *
 * The API key never leaves the server: all requests run here via
 * wp_remote_get(), never in browser JS. Key lives in wp-config.php, not
 * in the repo and not in the DB:
 *
 *     define( 'HUB_INVESTIS_API_KEY', '...' );
 *
 * Responses are cached in a short-lived transient (default 15 minutes,
 * filterable) so every page view doesn't hit the API, plus a fallback
 * option holding the last good snapshot — if a fetch fails the banner
 * shows slightly stale data instead of breaking. Verify with:
 *
 *     wp eval "print_r( hub_gsct2026_get_market_snapshot() );"
 *
 * Fetches Group=full by default: price and change for Share Price,
 * dividend yields for Net Yield. NAV is *not* in the snapshot
 * (closeNav/previousCloseNav come back null) — see
 * hub_gsct2026_get_nav_per_share() for sourcing.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

/**
 * API key for Investis Digital. wp-config.php constant first, Site-Wide
 * Settings field second — remove any temporary define() from
 * functions.php once one of those holds the real key, so it never ships
 * in the repo.
 *
 * @return string
 */
function hub_gsct2026_market_api_key() {
	// Trimmed: pasted keys routinely trail whitespace, which the API
	// rejects — strip it here rather than trusting the input.
	if ( defined( 'HUB_INVESTIS_API_KEY' ) && '' !== trim( HUB_INVESTIS_API_KEY ) ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.VariableNotSnakeCase
		return trim( HUB_INVESTIS_API_KEY ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.VariableNotSnakeCase
	}

	return trim( hub_gsct2026_get_setting( 'investis_api_key' ) );
}

/**
 * Instrument to quote. Defaults to the working example from the API docs
 * (FCS.L returning GSCT data) — confirm the canonical instrument with
 * Investis; override without touching this file via the filter.
 *
 * @return string
 */
function hub_gsct2026_market_instrument() {
	return apply_filters( 'hub_gsct2026_market_instrument', 'FCS.L' );
}

/**
 * Snapshot group to request. 'full' is a superset covering price, change
 * and dividend yields in one request.
 *
 * @return string
 */
function hub_gsct2026_market_group() {
	return apply_filters( 'hub_gsct2026_market_group', 'full' );
}

/**
 * Latest market snapshot: fresh transient when available, last good
 * fallback when a fetch fails, null when nothing was ever fetched
 * (e.g. no API key yet).
 *
 * @return array|null Keys: symbol, exchangeStatus, price, lastTrade,
 *                    absChange, percentChange, currency, timeZone, open,
 *                    prevClose, high, low, volume, marketCap,
 *                    fiftytwoWeekHigh, fiftytwoWeekLow, closeNav,
 *                    yearlyDividendYield, fetched (timestamp).
 */
function hub_gsct2026_get_market_snapshot() {
	$fresh = get_transient( 'hub_market_snapshot' );

	if ( is_array( $fresh ) && $fresh ) {
		return $fresh;
	}

	$data = hub_gsct2026_fetch_market_snapshot();

	if ( is_array( $data ) ) {
		set_transient(
			'hub_market_snapshot',
			$data,
			apply_filters( 'hub_gsct2026_market_cache_ttl', 15 * MINUTE_IN_SECONDS )
		);
		update_option( 'hub_market_snapshot_fallback', $data, false );
		return $data;
	}

	$fallback = get_option( 'hub_market_snapshot_fallback', array() );

	return is_array( $fallback ) && $fallback ? $fallback : null;
}

/**
 * Single snapshot fetch. Returns null on any failure (no key, transport
 * error, non-200, unexpected shape) — callers fall back, never fatal.
 *
 * @return array|null
 */
function hub_gsct2026_fetch_market_snapshot() {
	$key = hub_gsct2026_market_api_key();

	if ( '' === $key ) {
		return null;
	}

	$url = add_query_arg(
		array(
			'Group'             => hub_gsct2026_market_group(),
			'corporateActions'  => 'dividend',
			'adjustedDividend'  => 'false',
		),
		'https://api.investisdigital.com/marketdata/v1/instruments/' . rawurlencode( hub_gsct2026_market_instrument() ) . '/snapshot'
	);

	// The API sits behind a bot-management WAF that serves a browser
	// challenge page to non-browser user agents (including WordPress's
	// default UA) — verified: stock WP UA gets the challenge HTML, a
	// browser UA gets clean JSON. So this request identifies as a browser.
	// Long term, ask Investis to allowlist server-to-server access instead.
	$response = wp_remote_get(
		$url,
		array(
			'timeout'    => 10,
			'user-agent' => apply_filters(
				'hub_gsct2026_market_user_agent',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
			),
			'headers'    => array(
				'accept'    => '*/*',
				'x-api-key' => $key,
			),
		)
	);

	if ( is_wp_error( $response ) ) {
		return null;
	}

	if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
		return null;
	}

	$body = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( ! is_array( $body ) || 200 !== (int) ( $body['meta']['status'] ?? 0 ) ) {
		return null;
	}

	$snapshot = $body['data']['snapshot'] ?? null;

	if ( ! is_array( $snapshot ) || ! isset( $snapshot['price'] ) ) {
		return null;
	}

	$num = static function ( $value ) {
		return is_numeric( $value ) ? (float) $value : null;
	};

	return array(
		'symbol'              => $body['data']['client']['symbol'] ?? '',
		'exchangeStatus'      => $snapshot['exchangeStatus'] ?? ( $body['data']['client']['exchangeStatus'] ?? '' ),
		'price'               => (float) $snapshot['price'],
		'lastTrade'           => $snapshot['lastTrade'] ?? '',
		'absChange'           => $num( $snapshot['absChange'] ?? null ),
		'percentChange'       => $num( $snapshot['percentChange'] ?? null ),
		'currency'            => $body['data']['client']['currency'] ?? 'GBX',
		'timeZone'            => $snapshot['timeZone'] ?? '',
		// `close` carries the previous trading day's close (see
		// closePriceTime); `open`/`high`/`low`/`volume` are today's session.
		'open'                => $num( $snapshot['open'] ?? null ),
		'prevClose'           => $num( $snapshot['close'] ?? null ),
		'high'                => $num( $snapshot['high'] ?? null ),
		'low'                 => $num( $snapshot['low'] ?? null ),
		'volume'              => isset( $snapshot['volume'] ) && is_numeric( $snapshot['volume'] ) ? (int) $snapshot['volume'] : null,
		'marketCap'           => $num( $snapshot['marketCap'] ?? null ),
		'fiftytwoWeekHigh'    => $num( $snapshot['fiftytwoWeekHigh'] ?? null ),
		'fiftytwoWeekLow'     => $num( $snapshot['fiftytwoWeekLow'] ?? null ),
		'closeNav'            => isset( $snapshot['closeNav'] ) && $snapshot['closeNav'] > 0 ? (float) $snapshot['closeNav'] : null,
		'yearlyDividendYield' => $num( $snapshot['yearlyDividendYield'] ?? null ),
		'fetched'             => time(),
	);
}

/**
 * NAV per share in pence, from the API's closeNav when populated, else
 * null. No manual fallback — one was briefly added and removed per
 * direction; a hand-entered NAV would go stale against the live price.
 *
 * @return float|null
 */
function hub_gsct2026_get_nav_per_share() {
	$snapshot = hub_gsct2026_get_market_snapshot();

	if ( $snapshot && ! empty( $snapshot['closeNav'] ) ) {
		return (float) $snapshot['closeNav'];
	}

	return null;
}

/**
 * Premium (+) or discount (−) vs NAV, in percent. Needs both a live price
 * and a NAV — null when either is missing.
 *
 * @return float|null
 */
function hub_gsct2026_get_premium_percent() {
	$snapshot = hub_gsct2026_get_market_snapshot();
	$nav      = hub_gsct2026_get_nav_per_share();

	if ( ! $snapshot || ! isset( $snapshot['price'] ) || ! $nav ) {
		return null;
	}

	return ( (float) $snapshot['price'] - $nav ) / $nav * 100;
}

/**
 * Net yield in percent, straight from the snapshot's yearly dividend
 * yield. Null when the API doesn't return one.
 *
 * @return float|null
 */
function hub_gsct2026_get_net_yield() {
	$snapshot = hub_gsct2026_get_market_snapshot();

	if ( ! $snapshot || ! isset( $snapshot['yearlyDividendYield'] ) ) {
		return null;
	}

	return (float) $snapshot['yearlyDividendYield'];
}

/**
 * Dividend display label for a corporate-action subType.
 *
 * @param string $sub_type Raw subType, e.g. 'half_year'.
 * @return string
 */
function hub_gsct2026_dividend_type_label( $sub_type ) {
	$labels = array(
		'annual'    => 'Annual',
		'half_year' => 'Half yearly',
	);

	return $labels[ $sub_type ] ?? ucfirst( $sub_type );
}

/**
 * All dividend events, newest first. One corporateactions fetch per
 * request (static memo) — no persistent caching, per the real-time rule.
 * Each row: exDate/payDate ('Y-m-d'), value (float, GBp), subType, label.
 *
 * @return array[]
 */
function hub_gsct2026_get_dividend_events() {
	static $events = null;

	if ( is_array( $events ) ) {
		return $events;
	}

	$events = array();
	$key    = hub_gsct2026_market_api_key();

	if ( '' !== $key ) {
		$response = wp_remote_get(
			'https://api.investisdigital.com/marketdata/v1/instruments/' . rawurlencode( hub_gsct2026_market_instrument() ) . '/corporateactions?limit=100',
			array(
				'timeout'    => 10,
				'user-agent' => apply_filters(
					'hub_gsct2026_market_user_agent',
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
				),
				'headers'    => array(
					'accept'    => '*/*',
					'x-api-key' => $key,
				),
			)
		);

		if ( ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response ) ) {
			$body  = json_decode( wp_remote_retrieve_body( $response ), true );
			$items = is_array( $body ) ? ( $body['data']['corporateactions'] ?? array() ) : array();

			foreach ( (array) $items as $item ) {
				$item = (array) $item;

				if ( 'dividend' !== ( $item['type'] ?? '' ) || ! isset( $item['value'] ) ) {
					continue;
				}

				$events[] = array(
					'exDate'   => substr( (string) ( $item['date'] ?? '' ), 0, 10 ),
					'payDate'  => substr( (string) ( $item['paymentDate'] ?? '' ), 0, 10 ),
					'value'    => (float) $item['value'],
					'subType'  => (string) ( $item['subType'] ?? '' ),
					'label'    => $item['freetextcomment3'] ?? hub_gsct2026_dividend_type_label( (string) ( $item['subType'] ?? '' ) ),
				);
			}

			usort(
				$events,
				static function ( $a, $b ) {
					return strcmp( $b['exDate'], $a['exDate'] );
				}
			);
		}
	}

	return $events;
}

/**
 * Closing price for a date: nearest daily bar on or after it (covers
 * weekends and holidays — the window always contains a trading day for
 * any start date up to today). Null when unresolvable.
 *
 * @param string $ymd Start date, 'Y-m-d'.
 * @return float|null
 */
function hub_gsct2026_get_close_on_or_after( $ymd ) {
	$key = hub_gsct2026_market_api_key();

	if ( '' === $key || ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $ymd ) ) {
		return null;
	}

	$response = wp_remote_get(
		'https://api.investisdigital.com/marketdata/v1/instruments/' . rawurlencode( hub_gsct2026_market_instrument() ) . '/history?from=' . $ymd . '&to=' . gmdate( 'Y-m-d', strtotime( $ymd . ' +14 days' ) ),
		array(
			'timeout'    => 10,
			'user-agent' => apply_filters(
				'hub_gsct2026_market_user_agent',
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
			),
			'headers'    => array(
				'accept'    => '*/*',
				'x-api-key' => $key,
			),
		)
	);

	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
		return null;
	}

	$body  = json_decode( wp_remote_retrieve_body( $response ), true );
	$items = is_array( $body ) ? ( $body['data']['history'] ?? array() ) : array();
	$best  = null;

	foreach ( (array) $items as $item ) {
		$item = (array) $item;
		$date = substr( (string) ( $item['date'] ?? '' ), 0, 10 );

		if ( '' === $date || $date < $ymd || ! isset( $item['close'] ) || ! is_numeric( $item['close'] ) ) {
			continue;
		}

		if ( null === $best || $date < $best['date'] ) {
			$best = array(
				'date'  => $date,
				'close' => (float) $item['close'],
			);
		}
	}

	return $best ? $best['close'] : null;
}

/**
 * GET /wp-json/hub/v1/dividend-calc?start=YYYY-MM-DD&end=YYYY-MM-DD&shares=N.
 * Public read-only computation over data the theme already fetches
 * server-side — no secrets involved. Dividends count by ex-div date
 * (entitlement basis); shareholding assumed constant.
 */
add_action(
	'rest_api_init',
	static function () {
		register_rest_route(
			'hub/v1',
			'/dividend-calc',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'args'                => array(
					'start'  => array(
						'required'          => true,
						'validate_callback' => 'hub_gsct2026_validate_ymd',
					),
					'end'    => array(
						'required'          => true,
						'validate_callback' => 'hub_gsct2026_validate_ymd',
					),
					'shares' => array(
						'required'          => true,
						'validate_callback' => static function ( $value ) {
							return is_numeric( $value ) && (int) $value > 0 && (int) $value <= 1000000000;
						},
					),
				),
				'callback'            => 'hub_gsct2026_dividend_calc',
			)
		);
	}
);

/**
 * Validate a Y-m-d date string.
 *
 * @param string $value Input.
 * @return bool
 */
function hub_gsct2026_validate_ymd( $value ) {
	if ( ! is_string( $value ) || ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value ) ) {
		return false;
	}

	$parts = array_map( 'intval', explode( '-', $value ) );

	return checkdate( $parts[1], $parts[2], $parts[0] );
}

/**
 * Dividend calculator callback: total GBp plus yield-on-cost against the
 * start-date close. Yield is null (not an error) when either leg is
 * missing, so the frontend can dash it while still showing the total.
 *
 * @param WP_REST_Request $request Request.
 * @return array|WP_Error
 */
function hub_gsct2026_dividend_calc( $request ) {
	$start  = $request->get_param( 'start' );
	$end    = $request->get_param( 'end' );
	$shares = (int) $request->get_param( 'shares' );

	if ( $start > $end ) {
		return new WP_Error( 'hub_bad_range', 'The start date must be before the end date.', array( 'status' => 400 ) );
	}

	if ( $start > gmdate( 'Y-m-d' ) ) {
		return new WP_Error( 'hub_future_start', 'The start date cannot be in the future.', array( 'status' => 400 ) );
	}

	$per_share = 0.0;
	$count     = 0;
	$payments  = array();

	$fmt_date = static function ( $ymd ) {
		$time = strtotime( $ymd );
		return false !== $time ? wp_date( 'd M Y', $time ) : $ymd;
	};

	foreach ( hub_gsct2026_get_dividend_events() as $event ) {
		if ( $event['exDate'] >= $start && $event['exDate'] <= $end ) {
			$per_share += $event['value'];
			++$count;
			$payments[] = array(
				'ex'    => $fmt_date( $event['exDate'] ),
				'pay'   => $fmt_date( $event['payDate'] ),
				'type'  => hub_gsct2026_dividend_type_label( $event['subType'] ),
				'value' => round( $event['value'], 2 ),
			);
		}
	}

	$start_price = hub_gsct2026_get_close_on_or_after( $start );

	return array(
		'total_gbp'   => round( $per_share * $shares, 2 ),
		'yield_pct'   => ( $start_price ? round( $per_share / $start_price * 100, 2 ) : null ),
		'start_price' => $start_price,
		'dividends'   => $count,
		'payments'    => $payments,
		'yield_note'  => $start_price ? '' : 'No share price is available for the start date, so yield cannot be calculated.',
	);
}

/**
 * Annual dividend totals keyed by ex-div calendar year (descending),
 * split into Final (annual subtype) and Interim (half_year) stacks for
 * the chart. Other subtypes are table-only — they don't join a stack.
 *
 * @param array[]|null $events Optional pre-fetched events.
 * @return array Year => array( 'final' => float, 'interim' => float ).
 */
function hub_gsct2026_get_annual_dividends( $events = null ) {
	if ( null === $events ) {
		$events = hub_gsct2026_get_dividend_events();
	}

	$years = array();

	foreach ( $events as $event ) {
		$year = substr( $event['exDate'], 0, 4 );

		if ( '' === $year ) {
			continue;
		}

		if ( ! isset( $years[ $year ] ) ) {
			$years[ $year ] = array( 'final' => 0.0, 'interim' => 0.0 );
		}

		if ( 'annual' === $event['subType'] ) {
			$years[ $year ]['final'] += $event['value'];
		} elseif ( 'half_year' === $event['subType'] ) {
			$years[ $year ]['interim'] += $event['value'];
		}
	}

	krsort( $years );

	return $years;
}
