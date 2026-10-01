<?php
/**
 * Insights placeholder importer — one-off script.
 *
 * Creates one empty placeholder post per URL in the Columbia Threadneedle
 * GSCT insights sitemap, using each URL's <lastmod> as the post date.
 *
 * Source sitemap (scraped 2026-10-01, 41 URLs):
 * https://www.columbiathreadneedle.com/the-global-smaller-companies-trust-plc/insights-sitemap.xml
 *
 * Target: regular `post` type. On sites with permalink structure
 * `/insights/%postname%/` these automatically live under /insights/.
 * If your target uses an `insight` CPT instead, set $post_type below.
 *
 * Usage (on the target site, pick one):
 *   wp eval-file import-insights.php        # via WP-CLI / SSH
 *   https://example.com/wp-content/themes/hub-gsct2026/import-insights.php
 *                                           # via browser (must be logged in as admin)
 *
 * Idempotent: existing posts matched by slug (post_name) are skipped,
 * so re-running is safe. Delete this file after use.
 *
 * @package hub-gsct2026
 */

// If loaded directly in a browser, ABSPATH won't be defined yet — bootstrap WP.
if ( ! defined( 'ABSPATH' ) ) {
	$dir = __DIR__;
	for ( $i = 0; $i < 6; $i++ ) {
		if ( file_exists( $dir . '/wp-load.php' ) ) {
			require_once $dir . '/wp-load.php';
			break;
		}
		$dir = dirname( $dir );
	}
}

defined( 'ABSPATH' ) || exit( 'Could not locate wp-load.php.' );

$is_cli = ( defined( 'WP_CLI' ) && WP_CLI ) || 'cli' === php_sapi_name();

// --- Browser mode: admin-only with a confirm step ---------------------------
if ( ! $is_cli ) {
	if ( ! is_user_logged_in() ) {
		auth_redirect();
	}
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to run this importer.', 'hub-gsct2026' ), 403 );
	}

	// Confirm screen before doing anything.
	if ( empty( $_GET['run'] ) ) {
		$run_url = wp_nonce_url( add_query_arg( 'run', '1' ), 'hub_import_insights' );
		?>
		<!doctype html>
		<html><head><meta charset="utf-8"><title>Insights importer</title></head>
		<body style="font-family:sans-serif;max-width:40rem;margin:3rem auto;">
			<h1>Insights placeholder importer</h1>
			<p>Creates <strong>41</strong> empty placeholder posts (regular <code>post</code> type,
			slugs + dates from the GSCT insights sitemap) as <strong>drafts</strong>.
			Existing slugs are skipped, so re-running is safe.</p>
			<p><a href="<?php echo esc_url( $run_url ); ?>" style="display:inline-block;padding:.6rem 1.2rem;background:#2271b1;color:#fff;text-decoration:none;border-radius:4px;">Run import</a></p>
			<p>Delete this file (<code>import-insights.php</code>) when done.</p>
		</body></html>
		<?php
		exit;
	}
	check_admin_referer( 'hub_import_insights' );

	// No caching / no timeout for the import run.
	nocache_headers();
	if ( function_exists( 'set_time_limit' ) ) {
		set_time_limit( 300 );
	}
	echo '<!doctype html><html><head><meta charset="utf-8"><title>Insights importer — running</title></head><body style="font-family:monospace;max-width:60rem;margin:2rem auto;"><h1>Running…</h1><pre>';
}

// --- Config ---------------------------------------------------------------
$post_type   = 'post';   // Change to 'insight' if the target uses a CPT with rewrite slug 'insights'.
$post_status = 'draft';  // Placeholders ship as drafts (no content yet). Flip to 'publish' once content is added.
$author_id   = 1;         // Falls back to the first admin if this ID doesn't exist.

// --- Data: slug | post_date (from sitemap <lastmod>) | title (from page <title>) ---
$posts = array(
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-february-2025', 'date' => '2026-07-27 04:38:27', 'title' => 'The Global Smaller Companies Trust Market Snapshot - February 2025' ),
	array( 'slug' => 'the-anomaly-of-an-investment-trust-on-a-double-digit-discount', 'date' => '2026-07-27 04:30:24', 'title' => 'The anomaly of an investment trust on a double digit discount' ),
	array( 'slug' => 'nish-patels-market-update', 'date' => '2026-06-22 14:50:08', 'title' => 'Nish Patel\'s June Market Update remarks on a strong month for equities' ),
	array( 'slug' => 'gsct-faq', 'date' => '2026-05-25 02:06:08', 'title' => 'The Global Smaller Companies Trust - UK investment trust FAQ' ),
	array( 'slug' => 'why-small-caps-may-thrive-amidst-higher-inflation', 'date' => '2026-04-21 14:31:07', 'title' => 'Why small caps may thrive amidst higher inflation' ),
	array( 'slug' => 'nish-patels-april-market-snapshot', 'date' => '2026-04-21 08:58:56', 'title' => 'Nish Patel\'s April Market Snapshot' ),
	array( 'slug' => 'the-global-smaller-companies-trust-aic-isa-millionaire', 'date' => '2026-04-20 14:38:39', 'title' => 'The Global Smaller Companies Trust named in ISA Millionaire list in AIC research' ),
	array( 'slug' => 'fresh-ideas-if-you-are-exiting-saba', 'date' => '2026-04-07 14:23:32', 'title' => 'Fresh ideas if you are exiting Saba' ),
	array( 'slug' => 'how-can-the-the-global-smaller-companies-trust-offer-diversity-from-the-magnificent-seven', 'date' => '2026-02-06 10:17:16', 'title' => 'How The Global Smaller Companies Trust offers a diversified investment from The Magnificent Seven' ),
	array( 'slug' => 'january-market-snapshot', 'date' => '2026-01-19 11:40:26', 'title' => 'January Market Snapshot' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-november-2025-2', 'date' => '2025-12-18 15:12:08', 'title' => 'The Global Smaller Companies Trust Market Snapshot – December 2025' ),
	array( 'slug' => 'watch-nish-patels-kepler-intelligence-trust-presentation', 'date' => '2025-11-27 11:49:14', 'title' => 'Watch Nish Patel\'s Kepler Intelligence Trust Presentation' ),
	array( 'slug' => 'kepler-trust-intelligence-real-dividend-heroes-growth-giants', 'date' => '2025-11-25 15:52:44', 'title' => 'Kepler Trust Intelligence Presentations – Real Dividend Heroes & Growth Giants' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-november-2025', 'date' => '2025-11-25 15:33:12', 'title' => 'The Global Smaller Companies Trust Market Snapshot – November 2025' ),
	array( 'slug' => 'are-there-opportunities-in-european-mid-and-small-cap-companies', 'date' => '2025-10-17 13:54:08', 'title' => 'Are there opportunities in European mid and small-cap companies?' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-october-2025', 'date' => '2025-10-15 15:00:31', 'title' => 'The Global Smaller Companies Trust Market Snapshot – October 2025' ),
	array( 'slug' => 'how-to-be-a-winner-in-the-upcoming-global-small-cap-recovery', 'date' => '2025-10-10 07:57:57', 'title' => 'Are global small caps on the brink of recovery?' ),
	array( 'slug' => 'getting-to-know-chairman-graham-oldroyd', 'date' => '2025-10-07 13:11:47', 'title' => 'Getting to know Chairman Graham Oldroyd' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-september-2025', 'date' => '2025-09-19 10:50:51', 'title' => 'The Global Smaller Companies Trust Market Snapshot – September 2025' ),
	array( 'slug' => 'trustnet-why-smaller-companies-are-on-the-right-side-of-history', 'date' => '2025-09-15 08:33:13', 'title' => 'Trustnet: Why smaller companies are on the right side of history' ),
	array( 'slug' => 'moneyweek-three-small-companies-with-big-potential', 'date' => '2025-09-09 14:40:45', 'title' => 'MoneyWeek: Nish Patel on the smaller companies landscape' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-august-2025', 'date' => '2025-08-11 16:04:30', 'title' => 'The Global Smaller Companies Trust Market Snapshot – August 2025' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-july-2025', 'date' => '2025-07-22 12:40:09', 'title' => 'The Global Smaller Companies Trust Market Snapshot - July 2025' ),
	array( 'slug' => '3-catalysts-to-spark-a-revival-in-the-shares-of-smaller-companies', 'date' => '2025-07-01 14:03:02', 'title' => '3 catalysts to spark a revival in the shares of smaller companies' ),
	array( 'slug' => 'exploring-the-long-term-benefits-of-investing', 'date' => '2025-07-01 14:02:33', 'title' => 'Exploring the long term benefits of investing' ),
	array( 'slug' => 'the-magic-of-high-quality-smaller-companies', 'date' => '2025-07-01 14:02:08', 'title' => 'The magic of high-quality smaller companies' ),
	// NOTE: the source <title> for this URL currently duplicates the Ashtead case study;
	// title below is humanised from the slug — verify against the live page before publishing.
	array( 'slug' => '200-of-the-most-exciting-companies-on-world-stock-exchanges', 'date' => '2025-07-01 14:01:34', 'title' => '200 of the most exciting companies on world stock exchanges' ),
	array( 'slug' => 'our-investment-philosophy-and-process', 'date' => '2025-07-01 14:00:14', 'title' => 'Our investment philosophy and process' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-june-2025', 'date' => '2025-07-01 08:57:43', 'title' => 'The Global Smaller Companies Trust Market Snapshot - June 2025' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-may-2025', 'date' => '2025-05-27 14:45:42', 'title' => 'The Global Smaller Companies Trust Market Snapshot - May 2025' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-april-2025', 'date' => '2025-04-29 08:17:48', 'title' => 'The Global Smaller Companies Trust Market Snapshot - April 2025' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-march-2025', 'date' => '2025-03-31 08:41:07', 'title' => 'The Global Smaller Companies Trust Market Snapshot - March 2025' ),
	array( 'slug' => 'double-whammy-the-trust-on-a-big-discount-buying-undervalued-companies', 'date' => '2025-03-17 09:13:16', 'title' => 'Double whammy: The trust on a big discount buying undervalued companies' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-january-2025', 'date' => '2025-02-25 12:54:23', 'title' => 'The Global Smaller Companies Trust Market Snapshot - January 2025' ),
	array( 'slug' => 'the-global-smaller-companies-trust-market-snapshot-december-2024', 'date' => '2025-01-22 14:20:04', 'title' => 'The Global Smaller Companies Trust Market Snapshot - December 2024' ),
	array( 'slug' => 'investment-case-study-wex-north-america', 'date' => '2025-01-15 12:16:58', 'title' => 'Investment Case Study - WEX (North America)' ),
	array( 'slug' => 'investment-case-study-4imprint-group-uk', 'date' => '2025-01-09 13:40:57', 'title' => 'Investment Case Study - 4imprint Group (UK)' ),
	array( 'slug' => 'investment-case-study-acceleron-industries-europe', 'date' => '2024-10-09 11:27:27', 'title' => 'Investment Case Study - Acceleron Industries (Europe)' ),
	array( 'slug' => 'investment-case-study-ashtead-technology', 'date' => '2024-05-30 11:11:53', 'title' => 'Investment Case Study – Ashtead Technology' ),
	array( 'slug' => 'investment-case-study-glanbia', 'date' => '2023-07-31 13:23:35', 'title' => 'Investment Case Study – Glanbia' ),
	array( 'slug' => 'investment-case-study-the-ensign-group', 'date' => '2023-07-31 13:12:31', 'title' => 'Investment Case Study – The Ensign Group' ),
);

// --- Resolve author ---------------------------------------------------------
if ( ! get_user_by( 'id', $author_id ) ) {
	$admins    = get_users( array( 'role' => 'administrator', 'number' => 1, 'orderby' => 'ID', 'order' => 'ASC' ) );
	$author_id = ! empty( $admins ) ? (int) $admins[0]->ID : 1;
}

$source_base = 'https://www.columbiathreadneedle.com/the-global-smaller-companies-trust-plc/insights/';

$created = 0;
$skipped = 0;

// In browser mode, buffer lines so they can be HTML-escaped on output.
$log = array();
$emit = static function ( $line ) use ( $is_cli, &$log ) {
	if ( $is_cli ) {
		echo $line . "\n";
	} else {
		$log[] = $line;
	}
};

foreach ( $posts as $item ) {
	$existing = get_page_by_path( $item['slug'], OBJECT, $post_type );

	if ( $existing ) {
		$emit( "SKIP  {$item['slug']} (already exists as ID {$existing->ID})" );
		$skipped++;
		continue;
	}

	$post_id = wp_insert_post(
		array(
			'post_type'     => $post_type,
			'post_title'    => $item['title'],
			'post_name'     => $item['slug'],
			'post_content'  => '',
			'post_status'   => $post_status,
			'post_author'   => $author_id,
			'post_date'     => $item['date'],
			'post_date_gmt' => get_gmt_from_date( $item['date'] ),
			'post_modified' => $item['date'],
			'post_modified_gmt' => get_gmt_from_date( $item['date'] ),
			'meta_input'    => array(
				'_insights_source_url' => $source_base . $item['slug'] . '/',
				'_insights_lastmod'    => $item['date'],
			),
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		$emit( 'ERROR ' . $item['slug'] . ': ' . $post_id->get_error_message() );
		continue;
	}

	$emit( "OK    {$item['slug']} (ID {$post_id}, {$item['date']})" );
	$created++;
}

$emit( '' );
$emit( "Done. Created: {$created}, skipped: {$skipped}." );

if ( ! $is_cli ) {
	foreach ( $log as $line ) {
		echo esc_html( $line ) . "\n";
	}
	echo '</pre><p><strong>Done.</strong> Delete <code>import-insights.php</code> from the theme now.</p></body></html>';
}
