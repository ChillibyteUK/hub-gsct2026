// Keeps a fraction a hair away from 0 or 1 — the zoom formula below divides
// by fraction and by (1 - fraction), which would divide by zero for a focal
// point dragged exactly to an edge.
function clampFraction(value) {
	return Math.min(0.999, Math.max(0.001, value));
}

/**
 * Primary Hero block: positions the background image so the chosen focal point
 * lands exactly under the crosshair.
 *
 * Below 992px the crosshair sits at a fixed spot (horizontally centred, a
 * fixed distance from the top — src/blocks/primary-hero.css) rather than at
 * the focal point's own position. Moving an off-centre focal point to a
 * *different* target spot means the image has to be shifted sideways
 * within its box — plain object-fit: cover doesn't leave any room for that
 * shift: it scales the image up only as far as needed to cover the
 * container with zero slack in whichever axis isn't the limiting one, so
 * asking it to shift in that axis ran the image off the edge and exposed a
 * bare strip of the container behind it. The fix is exactly what it sounds
 * like it should be — zoom in enough to create that slack — but "enough"
 * depends on how far off-centre the focal point is and where it needs to
 * end up, so it's computed per-axis from those two fractions rather than a
 * flat extra multiplier (which would either still fall short for an
 * extreme focal point, or zoom in needlessly far for a centred one).
 */
function requiredZoom(focal, target) {
	const f = clampFraction(focal);
	const t = clampFraction(target);
	return Math.max(t / f, (1 - t) / (1 - f));
}

function layoutPrimaryHero(media) {
	const background = media.querySelector('.hub-primary-hero__background');
	if (!background) return;

	const style = getComputedStyle(media);
	const focalX = parseFloat(style.getPropertyValue('--focal-x')) || 0.5;
	const focalY = parseFloat(style.getPropertyValue('--focal-y')) || 0.5;
	const isSmall = window.matchMedia('(max-width: 991px)').matches;

	const containerWidth = media.clientWidth;
	const containerHeight = media.clientHeight;

	// Below 992px the crosshair is top-anchored 2rem down (not centred),
	// so the focal point lands at its vertical centre: 2rem plus half the
	// rendered graphic height (min(440px, 90vw) wide at the svg's 631:473
	// ratio — same geometry as the mobile padding in
	// src/blocks/primary-hero.css, keep them in sync). Match that here (as
	// fractions of the container, like focalX/focalY) so the image pans to
	// keep the true focal point there.
	const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
	const targetXFraction = isSmall ? 0.5 : focalX;
	const crosshairHeight = isSmall ? Math.min(440, containerWidth * 0.9) / (631 / 473) : 0;
	const targetYFraction = isSmall ? (rootFontSize * 2 + crosshairHeight / 2) / containerHeight : focalY;

	// Falls back to the hardcoded test asset's own 1169×780 until it loads.
	const imageWidth = background.naturalWidth || 1169;
	const imageHeight = background.naturalHeight || 780;
	const ratio = imageWidth / imageHeight;

	// Plain cover scale (uniform, so both axes use whichever is larger).
	const coverScale = Math.max(containerWidth / imageWidth, containerHeight / imageHeight);
	// Extra zoom needed on top of that so both axes have enough slack to
	// actually shift the focal point to its target, not just cover the box.
	const zoom = Math.max(requiredZoom(focalX, targetXFraction), requiredZoom(focalY, targetYFraction));
	const scale = coverScale * zoom;

	const scaledWidth = imageWidth * scale;
	const scaledHeight = imageHeight * scale;

	background.style.width = `${scaledWidth}px`;
	background.style.height = `${scaledHeight}px`;
	background.style.left = `${targetXFraction * containerWidth - focalX * scaledWidth}px`;
	background.style.top = `${targetYFraction * containerHeight - focalY * scaledHeight}px`;
}

export function initPrimaryHero() {
	const mediaEls = document.querySelectorAll('.hub-primary-hero__media');
	if (!mediaEls.length) return;

	mediaEls.forEach((media) => {
		const background = media.querySelector('.hub-primary-hero__background');
		if (background && !background.complete) {
			background.addEventListener('load', () => layoutPrimaryHero(media));
		}
	});

	// A window resize listener alone isn't enough: .hub-primary-hero__media
	// is sized off the section's content (see primary-hero.css), so its own box
	// can change size from things that aren't a viewport resize at all — a
	// web font swapping in and reflowing the heading/intro, for instance.
	// Missing one of those left the image sized/positioned for a container
	// that had since grown, showing as a blank strip where the stale
	// cover geometry fell short. ResizeObserver catches the container's
	// actual size whenever it changes, for any reason, and (per spec) also
	// fires once immediately on observe() — no separate initial call needed.
	const resizeObserver = new ResizeObserver((entries) => {
		entries.forEach((entry) => layoutPrimaryHero(entry.target));
	});
	mediaEls.forEach((media) => resizeObserver.observe(media));
}
