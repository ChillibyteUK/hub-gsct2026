<?php
/**
 * Block template for HUB Definition List.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$btitle = $attributes['title'] ?? '';
$terms  = $attributes['terms'] ?? array();

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-definition-list' ) );
?>
<section <?= $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container py-6">
		<?php
		if ( $btitle ) {
			?>
		<h2 class="hub-definition-list__title has-brand-red-color"><?= esc_html( $btitle ); ?></h2>
			<?php
		}
		if ( $terms ) {
			?>
		<div class="hub-definition-list__facts">
			<?php
			foreach ( $terms as $item ) {
				?>
			<div class="hub-definition-list__fact">
				<?php
				$term = $item['term'] ?? '';
				if ( $term ) {
					?>
				<div class="hub-definition-list__term text-body-medium"><?= esc_html( $term ); ?></div>
					<?php
				} 
				$definition = $item['definition'] ?? '';
				if ( $definition ) {
					?>
				<div class="hub-definition-list__definition"><?= wp_kses_post( wpautop( $definition ) ); ?></div>
					<?php
				}
				?>
			</div>
				<?php
			}
			?>
		</div>
			<?php
		}
		?>
	</div>
</section>
