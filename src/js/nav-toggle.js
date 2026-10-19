/**
 * Mobile nav toggle. Wires any button with aria-controls pointing at a
 * .navbar-collapse to show/hide it and keep aria-expanded in sync — this is
 * the entire replacement for Bootstrap's Collapse component for this use case.
 */
export function initNavToggle() {
	document.querySelectorAll('.navbar-toggler[aria-controls]').forEach((toggler) => {
		const target = document.getElementById(toggler.getAttribute('aria-controls'));
		if (!target) return;

		toggler.addEventListener('click', () => {
			const isOpen = target.classList.toggle('is-open');
			toggler.setAttribute('aria-expanded', String(isOpen));
		});

		const close = () => {
			target.classList.remove('is-open');
			toggler.setAttribute('aria-expanded', 'false');
		};

		// Close after choosing a link only when the click won't leave the
		// page (same-page anchors, or links that don't navigate). Links that
		// navigate keep the menu open until the new page replaces this one —
		// closing first flashed the current page before the next loaded.
		target.querySelectorAll('a').forEach((link) => {
			link.addEventListener('click', (event) => {
				const url = new URL(link.href, window.location.href);
				const samePage =
					url.origin === window.location.origin &&
					url.pathname === window.location.pathname &&
					url.search === window.location.search;
				const opensElsewhere =
					link.target === '_blank' ||
					link.hasAttribute('download') ||
					event.ctrlKey ||
					event.metaKey ||
					event.shiftKey;
				if (samePage || opensElsewhere || !link.getAttribute('href')) {
					close();
				}
			});
		});

		// Back/forward can restore this page from the bfcache with the menu
		// still open from the click that left it.
		window.addEventListener('pageshow', (event) => {
			if (event.persisted) close();
		});
	});
}
