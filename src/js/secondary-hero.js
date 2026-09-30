/**
 * Secondary hero entrance: images start stacked dead-centre and unrotated,
 * then spread to their coverflow spots while rotating into place. Final
 * positions/angles are measured from the real layout (not hardcoded), so
 * missing images or responsive sizes just work — rotation follows the CSS
 * convention (left of centre positive, right negative, centred none).
 *
 * Non-primary images render with inline opacity: 0 (see render.php), so
 * there's no flash of the finished layout before this runs — the timeline
 * fades each one in as it starts moving. Reduced-motion / missing GSAP /
 * register failure all reveal everything immediately instead; only a
 * true no-JS visitor never gets the reveal, and keeps the primary image.
 */
export function initSecondaryHero() {
	const rows = document.querySelectorAll('.hub-secondary-hero__media');
	if (!rows.length) return;

	function revealAll() {
		document.querySelectorAll('.hub-secondary-hero__image').forEach((img) => {
			img.style.opacity = '1';
		});
	}

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		revealAll();
		return;
	}
	if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
		revealAll();
		return;
	}

	try {
		window.gsap.registerPlugin(window.ScrollTrigger);
	} catch (error) {
		revealAll();
		return;
	}

	rows.forEach((media) => {
		const imgs = [...media.querySelectorAll('.hub-secondary-hero__image')].filter(
			(img) => img.getBoundingClientRect().width > 0
		);
		if (!imgs.length) return;

		const mediaRect = media.getBoundingClientRect();
		const centreX = mediaRect.left + mediaRect.width / 2;

		const targets = imgs.map((img) => {
			const rect = img.getBoundingClientRect();
			const dx = centreX - (rect.left + rect.width / 2);
			const rotationY = Math.abs(dx) < 2 ? 0 : dx > 0 ? 30 : -30;
			return { img, dx, rotationY };
		});

		// Stack everything first, then bloom centre-outward.
		targets.forEach(({ img, dx }) => {
			window.gsap.set(img, { x: dx, rotationY: 0 });
		});
		targets.sort((a, b) => Math.abs(a.dx) - Math.abs(b.dx));

		const timeline = window.gsap.timeline({
			scrollTrigger: { trigger: media, start: 'top 85%', once: true },
		});
		targets.forEach(({ img, rotationY }, i) => {
			timeline.to(img, { x: 0, rotationY, opacity: 1, duration: 1.25, ease: 'power3.out' }, i * 0.1);
		});
	});

	// Trigger positions measured above can be stale by the time late assets
	// shift the page — refresh once everything has landed.
	window.addEventListener('load', () => {
		window.ScrollTrigger.refresh();
	});
}
