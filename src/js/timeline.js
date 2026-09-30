/**
 * Timeline slider arrows: each click lands the next (or previous) card
 * exactly on the track's left padding edge — computed from live geometry,
 * not by nudging a fixed card width, so partially-scrolled positions still
 * resolve to a clean card. Includes disabled states at each end. Reduced
 * motion gets instant jumps instead of smooth scrolling.
 */
export function initTimelines() {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const behavior = reduceMotion ? 'auto' : 'smooth';

	document.querySelectorAll('.hub-timeline__track-wrap').forEach((wrap) => {
		const track = wrap.querySelector('.hub-timeline__track');
		const prev = wrap.querySelector('.hub-timeline__prev');
		const next = wrap.querySelector('.hub-timeline__next');
		if (!track || !prev || !next) return;

		const padStart = () => parseFloat(getComputedStyle(track).paddingInlineStart) || 0;

		// The scrollLeft that would park this slide on the padding edge.
		const slideScroll = (slide) => {
			const trackRect = track.getBoundingClientRect();
			const slideRect = slide.getBoundingClientRect();
			return track.scrollLeft + (slideRect.left - trackRect.left) - padStart();
		};

		const slides = () => [...track.querySelectorAll('.hub-timeline__slide')];

		const syncDisabled = () => {
			const max = track.scrollWidth - track.clientWidth;
			prev.disabled = track.scrollLeft <= 1;
			next.disabled = track.scrollLeft >= max - 1;
		};

		prev.addEventListener('click', () => {
			const current = track.scrollLeft;
			const target = [...slides()].reverse().find((slide) => slideScroll(slide) < current - 1);
			track.scrollTo({ left: target ? slideScroll(target) : 0, behavior });
		});
		next.addEventListener('click', () => {
			const current = track.scrollLeft;
			const target = slides().find((slide) => slideScroll(slide) > current + 1);
			if (target) {
				track.scrollTo({ left: slideScroll(target), behavior });
			}
		});
		track.addEventListener('scroll', syncDisabled, { passive: true });

		syncDisabled();
	});
}
