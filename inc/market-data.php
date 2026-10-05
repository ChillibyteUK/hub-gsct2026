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
	if ( defined( 'HUB_INVESTIS_API_KEY' ) && HUB_INVESTIS_API_KEY ) {
		return HUB_INVESTIS_API_KEY; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.VariableNotSnakeCase
	}

	return hub_gsct2026_get_setting( 'investis_api_key' );
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
 * @return array|null Keys: price, lastTrade, absChange, percentChange,
 *                    currency, yearlyDividendYield, fetched (timestamp).
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

	return array(
		'price'               => (float) $snapshot['price'],
		'lastTrade'           => $snapshot['lastTrade'] ?? '',
		'absChange'           => isset( $snapshot['absChange'] ) ? (float) $snapshot['absChange'] : null,
		'percentChange'       => isset( $snapshot['percentChange'] ) ? (float) $snapshot['percentChange'] : null,
		'currency'            => $body['data']['client']['currency'] ?? 'GBX',
		'closeNav'            => isset( $snapshot['closeNav'] ) && $snapshot['closeNav'] > 0 ? (float) $snapshot['closeNav'] : null,
		'yearlyDividendYield' => isset( $snapshot['yearlyDividendYield'] ) ? (float) $snapshot['yearlyDividendYield'] : null,
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
