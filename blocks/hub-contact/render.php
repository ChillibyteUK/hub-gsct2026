<?php
/**
 * Block template for HUB Contact.
 *
 * Fixed three-point variant of HUB 3 Points Hero: Call us, Email us, Write
 * to us — each a title and a textarea of content (shortcodes expand). Shares
 * the hub-3-points classes so the desktop layout (numbered circles, rules
 * between columns) is identical; below md the numbers swap for icons, the
 * points centre and the rules drop (see src/blocks/contact.css).
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle = $attributes['title'] ?? '';
$intro  = do_shortcode( $attributes['intro'] ?? '' );

$icons = array(
	'call'  => '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13.4927 15.6306C13.2722 15.6857 13.0395 15.664 12.8329 15.5692C10.0551 14.2059 7.80723 11.9607 6.44044 9.18466C6.33921 8.97701 6.31299 8.74073 6.36622 8.51595C6.41945 8.29117 6.54886 8.09174 6.73246 7.95156L7.2005 7.60053C7.44891 7.41422 7.65053 7.17263 7.7894 6.8949C7.92826 6.61717 8.00056 6.31091 8.00056 6.0004V3.00016C8.00056 2.46968 7.78983 1.96094 7.41473 1.58583C7.03962 1.21073 6.53088 1 6.0004 1H3.00016C2.46968 1 1.96094 1.21073 1.58583 1.58583C1.21073 1.96094 1 2.46968 1 3.00016C1 7.77444 2.89658 12.3532 6.2725 15.7291C9.64843 19.105 14.2272 21.0016 19.0014 21.0016C19.5319 21.0016 20.0407 20.7909 20.4158 20.4158C20.7909 20.0407 21.0016 19.5319 21.0016 19.0014V16.0012C21.0016 15.4707 20.7909 14.962 20.4158 14.5869C20.0407 14.2118 19.5319 14.001 19.0014 14.001H16.0012C15.6907 14.001 15.3844 14.0733 15.1067 14.2122C14.829 14.3511 14.5874 14.5527 14.4011 14.8011L14.046 15.2661C13.9084 15.447 13.7132 15.5755 13.4927 15.6306Z" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
	'email' => '<svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21.0016 3.9997L12.0099 9.72613C11.7048 9.90332 11.3582 9.99665 11.0053 9.99665C10.6524 9.99665 10.3059 9.90332 10.0007 9.72613L1 3.9997M3.00016 1H19.0014C20.1061 1 21.0016 1.89534 21.0016 2.9998V14.9986C21.0016 16.1031 20.1061 16.9984 19.0014 16.9984H3.00016C1.8955 16.9984 1 16.1031 1 14.9986V2.9998C1 1.89534 1.8955 1 3.00016 1Z" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
	'write' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13.999 1.99921H5.9998C5.46942 1.99921 4.96076 2.20994 4.58573 2.58504C4.21069 2.96015 4 3.46889 4 3.99937V20.0006C4 20.5311 4.21069 21.0399 4.58573 21.415C4.96076 21.7901 5.46942 22.0008 5.9998 22.0008H17.9986C18.529 22.0008 19.0376 21.7901 19.4127 21.415C19.7877 21.0399 19.9984 20.5311 19.9984 20.0006V7.99969M13.999 1.99921C14.3155 1.9987 14.629 2.06082 14.9214 2.18199C15.2139 2.30317 15.4794 2.48101 15.7028 2.70527L19.2905 6.29355C19.5153 6.51708 19.6936 6.78294 19.8151 7.07578C19.9366 7.36862 19.9989 7.68263 19.9984 7.99969M13.999 1.99921V6.99961C13.999 7.26484 14.1043 7.51922 14.2919 7.70677C14.4794 7.89432 14.7337 7.99969 14.9989 7.99969L19.9984 7.99969" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
);

$points = array();
foreach ( array( 'call', 'email', 'write' ) as $key ) {
	$points[ $key ] = array(
		'title'   => $attributes[ $key . 'Title' ] ?? '',
		'content' => do_shortcode( $attributes[ $key . 'Content' ] ?? '' ),
	);
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-3-points hub-contact' ) );

/**
 * Lets email addresses wrap after the @ (and nowhere else): inserts a <wbr>
 * after each @ in text nodes only, leaving tags and attributes (mailto:
 * hrefs) untouched.
 *
 * @param string $html Sanitised HTML.
 * @return string
 */
$hub_wrap_at = static function ( $html ) {
	return preg_replace_callback(
		'/(<[^>]*>)|@/',
		static function ( $m ) {
			return '' !== ( $m[1] ?? '' ) ? $m[1] : '@<wbr>';
		},
		$html
	);
};
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-6">
		<?php
		if ( $btitle ) {
			?>
			<h1 class="display-xl"><?= esc_html( $btitle ); ?></h1>
			<?php
		}
		if ( $intro ) {
			?>
			<div class="mb-5 hub-3-points__intro"><?= wp_kses_post( wpautop( $intro ) ); ?></div>
			<?php
		}
		?>
		<div class="row gap-5 hub-3-points__points">
			<?php
			$loop_index = 0;
			foreach ( $points as $key => $point ) {
				?>
				<div class="col-12 col-md-4 hub-3-points__point">
					<div class="number text-number-label">
						<span class="hub-contact__num"><?= esc_html( $loop_index + 1 ); ?></span>
						<span class="hub-contact__icon"><?= $icons[ $key ]; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG markup. ?></span>
					</div>
					<?php
					if ( $point['title'] ) {
						?>
						<h3 class="h3-data-m"><?= esc_html( $point['title'] ); ?></h3>
						<?php
					}
					if ( $point['content'] ) {
						?>
						<div><?= $hub_wrap_at( wp_kses_post( wpautop( $point['content'] ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- already kses-filtered; only adds <wbr>. ?></div>
						<?php
					}
					?>
				</div>
				<?php
				++$loop_index;
			}
			?>
		</div>
	</div>
</section>
