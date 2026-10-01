<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Lightweight nav walker. Outputs nav-link/dropdown-menu class names (kept
 * for familiarity) but has none of Bootstrap's navwalker complexity — no
 * linkmod/icon handling, no Bootstrap 4/5 branching. Submenus are shown via
 * dropdown-toggle buttons, which are accessible and work with keyboard navigation.
 *
 * Classes added to a menu item in the WP menu editor ("CSS Classes") are
 * passed through onto the link (or dropdown-toggle button) alongside
 * nav-link — WordPress's own bookkeeping classes (menu-item-*,
 * current-*, page-item-*) are filtered out. Note this walker replaces
 * core's start_el() wholesale, so the nav_menu_css_class /
 * nav_menu_link_attributes filters never run here; this passthrough is
 * what keeps editor classes working.
 *
 * @package hub-gsct2026
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Hub_GSCT_2026_Nav_Walker' ) ) {

	/**
	 * Custom nav walker.
	 */
	class Hub_GSCT_2026_Nav_Walker extends Walker_Nav_Menu {

		/**
		 * Holds the id of the submenu currently being opened, so start_lvl()
		 * can target the same id the preceding start_el() pointed its
		 * dropdown-toggle button's aria-controls at.
		 *
		 * @var string
		 */
		protected $current_submenu_id = '';

		/**
		 * Starts the list before the elements are added.
		 *
		 * @param string   $output Passed by reference.
		 * @param int      $depth  Depth of menu item.
		 * @param stdClass $args   Menu args.
		 * @return void
		 */
		public function start_lvl( &$output, $depth = 0, $args = null ) {
			$output .= '<ul class="dropdown-menu" id="' . esc_attr( $this->current_submenu_id ) . '">';
		}

		/**
		 * Ends the list after the elements are added.
		 *
		 * @param string   $output Passed by reference.
		 * @param int      $depth  Depth of menu item.
		 * @param stdClass $args   Menu args.
		 * @return void
		 */
		public function end_lvl( &$output, $depth = 0, $args = null ) {
			$output .= '</ul>';
		}

		/**
		 * Starts the element output.
		 *
		 * @param string   $output Passed by reference.
		 * @param WP_Post  $item   Menu item.
		 * @param int      $depth  Depth of menu item.
		 * @param stdClass $args   Menu args.
		 * @param int      $id     Menu item ID.
		 * @return void
		 */
		public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
			$item_classes   = is_array( $item->classes ) ? $item->classes : array();
			$has_children   = in_array( 'menu-item-has-children', $item_classes, true );
			$is_current     = in_array( 'current-menu-item', $item_classes, true ) || in_array( 'current_page_item', $item_classes, true );
			$is_ancestor    = false;

			// Ancestor state wears both hyphen and underscore spellings
			// (current-menu-ancestor, current_page_parent, ...). Anything
			// current* that isn't the item itself counts.
			foreach ( $item_classes as $item_class ) {
				if ( ! is_string( $item_class ) ) {
					continue;
				}

				if ( 'current-menu-item' === $item_class || 'current_page_item' === $item_class ) {
					continue;
				}

				if ( 0 === strpos( $item_class, 'current-' ) || 0 === strpos( $item_class, 'current_' ) ) {
					$is_ancestor = true;
					break;
				}
			}

			$is_active      = $is_current || $is_ancestor;
			$custom_classes = array_values( array_unique( array_filter( $item_classes, 'hub_gsct2026_nav_menu_custom_class' ) ) );

			$li_classes = array( 'nav-item' );
			if ( $has_children ) {
				$li_classes[] = 'dropdown';
			}

			$output .= '<li class="' . esc_attr( implode( ' ', $li_classes ) ) . '">';

			if ( $has_children ) {
				// Dropdown parents never navigate — the whole item is the toggle.
				// Ancestor state still surfaces here: WordPress's own
				// current-* classes never reach the markup (filtered above),
				// so the toggle carries `active` when this item is current or
				// an ancestor of the current page.
				$this->current_submenu_id = 'dropdown-' . $item->ID;
				$toggle_classes           = array_merge( array( 'nav-link', 'dropdown-toggle' ), $custom_classes );
				if ( $is_active ) {
					$toggle_classes[] = 'active';
				}
				$output                  .= '<button type="button" class="' . esc_attr( implode( ' ', $toggle_classes ) ) . '" aria-haspopup="true" aria-expanded="false" aria-controls="' . esc_attr( $this->current_submenu_id ) . '">';
				$output                  .= '<span>' . esc_html( $item->title ) . '</span>';
				$output                  .= '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>';
				$output                  .= '</button>';
			} else {
				$link_classes = array_merge( array( 'nav-link' ), $custom_classes );
				if ( $is_current ) {
					$link_classes[] = 'active';
				}

				$output .= '<a class="' . esc_attr( implode( ' ', $link_classes ) ) . '" href="' . esc_url( $item->url ) . '"';
				if ( $is_current ) {
					$output .= ' aria-current="page"';
				}
				$output .= '>' . esc_html( $item->title ) . '</a>';
			}
		}

		/**
		 * Ends the element output.
		 *
		 * @param string   $output Passed by reference.
		 * @param WP_Post  $item   Menu item.
		 * @param int      $depth  Depth of menu item.
		 * @param stdClass $args   Menu args.
		 * @return void
		 */
		public function end_el( &$output, $item, $depth = 0, $args = null ) {
			$output .= '</li>';
		}
	}
}

/**
 * Keep a menu item's editor-added classes, drop WordPress's own
 * bookkeeping ones (menu-item-*, current-* in both hyphen and underscore
 * spellings, page-item-*).
 *
 * @param string $class Single class from the menu item's class list.
 * @return bool
 */
function hub_gsct2026_nav_menu_custom_class( $class ) {
	if ( ! is_string( $class ) || '' === $class ) {
		return false;
	}

	foreach ( array( 'menu-item', 'current-', 'current_', 'page-item', 'page_item' ) as $prefix ) {
		if ( 0 === strpos( $class, $prefix ) ) {
			return false;
		}
	}

	return true;
}
