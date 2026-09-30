<?php
/**
 * Block template for HUB Secondary Hero.
 *
 * Five images (image 3 is the primary, carrying --primary for distinct
 * styling) plus a title. Layout is per-instance CSS.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle = $attributes['title'] ?? '';

$images = array();
for ( $i = 1; $i <= 5; $i++ ) {
	$url = $attributes[ "image{$i}Url" ] ?? '';
	if ( ! $url ) {
		continue;
	}
	$images[] = array(
		'url'      => $url,
		'alt'      => $attributes[ "image{$i}Alt" ] ?? '',
		'position' => $i,
		'primary'  => 3 === $i,
	);
}

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-secondary-hero' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( $images ) {
			?>
			<div class="hub-secondary-hero__media">
				<?php
				foreach ( $images as $image ) {
					$class = 'hub-secondary-hero__image hub-secondary-hero__image--' . $image['position'] . ( $image['primary'] ? ' hub-secondary-hero__image--primary' : '' );
					$style = $image['primary'] ? '' : ' style="opacity: 0;"';
					?>
					<img class="<?= esc_attr( $class ); ?>" src="<?= esc_url( $image['url'] ); ?>" alt="<?= esc_attr( $image['alt'] ); ?>"<?= $style; ?>>
					<?php
				}
				?>
			</div>
			<?php
		}
		if ( $btitle ) {
			?>
			<h1 class="hub-secondary-hero__title display-xl"><?= esc_html( $btitle ); ?></h1>
			<?php
		}
		?>
	</div>
</section>
