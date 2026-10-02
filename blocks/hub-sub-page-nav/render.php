<?php
/**
 * Block template for HUB Sub-Page Nav.
 *
 * Tab-style nav across a hand-picked set of pages (not a WP nav menu —
 * editors just pick pages straight from this block). The current page gets
 * the same red-underline accent `.nav-link.active` gets in the main nav
 * (src/css/nav.css), reused here rather than inventing a second "this is
 * the active one" visual language. Rows with a deleted/unpublished page
 * are skipped; a row's own `label` overrides that page's title when set.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$rows = array_values( (array) ( $attributes['pages'] ?? array() ) );

$items = array();
foreach ( $rows as $row ) {
	$row     = (array) $row;
	$page_id = (int) ( $row['pageId'] ?? 0 );

	if ( ! $page_id ) {
		continue;
	}

	$page = get_post( $page_id );

	if ( ! $page || 'page' !== $page->post_type || 'publish' !== $page->post_status ) {
		continue;
	}

	$items[] = array(
		'label' => '' !== trim( (string) ( $row['label'] ?? '' ) ) ? $row['label'] : get_the_title( $page ),
		'url'   => get_permalink( $page ),
		'id'    => $page_id,
	);
}

if ( ! $items ) {
	return;
}

$hub_queried_id = get_queried_object_id();

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-sub-page-nav' ) );
?>
<nav <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?> aria-label="<?= esc_attr__( 'Section pages', 'hub-gsct2026' ); ?>">
	<div class="container">
		<ul class="hub-sub-page-nav__list">
			<?php
			foreach ( $items as $item ) {
				$is_active = $item['id'] === $hub_queried_id;
				?>
				<li class="hub-sub-page-nav__item">
					<a class="hub-sub-page-nav__link<?= $is_active ? ' active' : ''; ?>" href="<?= esc_url( $item['url'] ); ?>"<?= $is_active ? ' aria-current="page"' : ''; ?>>
						<?= esc_html( $item['label'] ); ?>
					</a>
				</li>
				<?php
			}
			?>
		</ul>
	</div>
</nav>
