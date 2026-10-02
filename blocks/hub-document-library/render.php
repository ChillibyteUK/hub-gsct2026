<?php
/**
 * Block template for HUB Document Library.
 *
 * Every published document post in one table (title, category, release
 * date, format) — no pagination. Category pills single-select-toggle the
 * list; overflow categories live under the More dropdown; the search box
 * matches document titles only for now (hooking full file-content search
 * up later means swapping the client-side matcher in
 * src/js/document-library.js, not this template). All filtering is
 * instant client-side via data attributes; stripe classes are re-applied
 * to the visible rows on every pass so hiding rows can't break the
 * alternation (same approach as HUB Holdings).
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

$hub_title      = $attributes['title'] ?? '';
$hub_pill_count = max( 1, (int) ( $attributes['pillCount'] ?? 5 ) );

$hub_docs = get_posts(
	array(
		'post_type'      => 'document',
		'posts_per_page' => -1,
		'post_status'    => 'publish',
		'orderby'        => 'title',
		'order'          => 'ASC',
	)
);

$hub_terms = get_terms(
	array(
		'taxonomy'   => 'doc_category',
		'hide_empty' => true,
		'orderby'    => 'name',
		'order'      => 'ASC',
	)
);

if ( is_wp_error( $hub_terms ) ) {
	$hub_terms = array();
}

$hub_visible_terms = array_slice( $hub_terms, 0, $hub_pill_count );
$hub_hidden_terms  = array_slice( $hub_terms, $hub_pill_count );

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'hub-document-library' ) );
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() already escapes. ?>>
	<div class="container">
		<?php
		if ( '' !== trim( $hub_title ) ) {
			?>
			<h2 class="hub-document-library__title h2-data-l"><?= esc_html( $hub_title ); ?></h2>
			<?php
		}
		if ( $hub_docs ) {
			?>
			<?php
			$hub_search_id = wp_unique_id( 'hub-document-library-search-' );
			?>
			<div class="hub-document-library__search">
				<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="m13 13 4 4"/></svg>
				<label class="screen-reader-text" for="<?= esc_attr( $hub_search_id ); ?>">Search documents</label>
				<input type="search" id="<?= esc_attr( $hub_search_id ); ?>" class="hub-document-library__search-input" placeholder="Keywords" autocomplete="off" data-document-library-search>
			</div>
			<?php
			if ( $hub_terms ) {
				?>
				<div class="hub-document-library__filters">
					<?php
					foreach ( $hub_visible_terms as $hub_term ) {
						?>
						<button type="button" class="hub-document-library__pill" data-cat="<?= esc_attr( $hub_term->slug ); ?>" aria-pressed="false"><?= esc_html( $hub_term->name ); ?></button>
						<?php
					}
					if ( $hub_hidden_terms ) {
						?>
						<div class="hub-document-library__more">
							<button type="button" class="hub-document-library__pill hub-document-library__more-toggle" aria-expanded="false" aria-haspopup="true">
								More
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
							</button>
							<div class="hub-document-library__menu" hidden>
								<?php
								foreach ( $hub_hidden_terms as $hub_term ) {
									?>
									<button type="button" class="hub-document-library__menu-item" data-cat="<?= esc_attr( $hub_term->slug ); ?>" aria-pressed="false"><?= esc_html( $hub_term->name ); ?></button>
									<?php
								}
								?>
							</div>
						</div>
						<?php
					}
					?>
				</div>
				<?php
			}
			?>
			<div class="hub-document-library__table-wrap">
				<table class="hub-document-library__table">
					<thead>
						<tr>
							<th scope="col">Document title</th>
							<th scope="col">Category</th>
							<th scope="col">Release date</th>
							<th scope="col" class="hub-document-library__format-col">Format</th>
						</tr>
					</thead>
					<tbody>
						<?php
						$hub_pos = 0;
						foreach ( $hub_docs as $hub_doc ) {
							$hub_doc_terms = wp_get_post_terms( $hub_doc->ID, 'doc_category' );
							$hub_cat_name  = '';
							$hub_cat_slugs = array();

							if ( ! is_wp_error( $hub_doc_terms ) ) {
								foreach ( $hub_doc_terms as $hub_doc_term ) {
									$hub_cat_slugs[] = $hub_doc_term->slug;

									if ( '' === $hub_cat_name ) {
										$hub_cat_name = $hub_doc_term->name;
									}
								}
							}

							$hub_release = get_post_meta( $hub_doc->ID, 'release_date', true );
							$hub_file_id = (int) get_post_meta( $hub_doc->ID, 'document_file', true );
							$hub_url     = get_post_meta( $hub_doc->ID, 'document_url', true );

							$hub_href       = '';
							$hub_format     = '';
							$hub_is_file    = false;
							$hub_new_tab    = false;

							if ( $hub_file_id ) {
								$hub_file_url = wp_get_attachment_url( $hub_file_id );

								if ( $hub_file_url ) {
									$hub_href    = $hub_file_url;
									$hub_is_file = true;

									$hub_filetype = wp_check_filetype( $hub_file_url );
									$hub_ext      = $hub_filetype['ext'] ? strtoupper( $hub_filetype['ext'] ) : '';

									$hub_path = get_attached_file( $hub_file_id );
									$hub_size = ( $hub_path && file_exists( $hub_path ) ) ? hub_gsct2026_format_file_size( filesize( $hub_path ) ) : '';

									if ( $hub_ext && $hub_size ) {
										$hub_format = $hub_ext . ' (' . $hub_size . ')';
									} elseif ( $hub_ext ) {
										$hub_format = $hub_ext;
									} elseif ( $hub_size ) {
										$hub_format = '(' . $hub_size . ')';
									}
								}
							}

							if ( ! $hub_href && $hub_url ) {
								$hub_href    = $hub_url;
								$hub_new_tab = true;
								$hub_format  = 'Open link';
							}

							++$hub_pos;
							?>
							<tr
								data-doc-row
								data-cats="<?= esc_attr( implode( ' ', $hub_cat_slugs ) ); ?>"
								data-title="<?= esc_attr( mb_strtolower( get_the_title( $hub_doc ) ) ); ?>"
								<?= 0 === $hub_pos % 2 ? 'class="is-alt"' : ''; ?>
							>
								<td><?= esc_html( get_the_title( $hub_doc ) ); ?></td>
								<td><?= esc_html( $hub_cat_name ); ?></td>
								<td><?= esc_html( $hub_release ); ?></td>
								<td class="hub-document-library__format-col">
									<?php
									if ( $hub_href ) {
										?>
										<a href="<?= esc_url( $hub_href ); ?>"<?= $hub_is_file ? ' download' : ' target="_blank" rel="noopener"'; ?>>
											<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 1v8m0 0 3-3M7 9 4 6M2 11v1.5A.5.5 0 0 0 2.5 13h9a.5.5 0 0 0 .5-.5V11"/></svg>
											<?= esc_html( $hub_format ); ?>
										</a>
										<?php
									} else {
										?>
										<span aria-hidden="true">&mdash;</span>
										<?php
									}
									?>
								</td>
							</tr>
							<?php
						}
						?>
						<tr class="hub-document-library__empty" data-doc-empty hidden>
							<td colspan="4">No documents found. Try different keywords or filters.</td>
						</tr>
					</tbody>
				</table>
			</div>
			<?php
		}
		?>
	</div>
</section>
