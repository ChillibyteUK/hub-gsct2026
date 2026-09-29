/*!
 * hub-gsct2026 v1.0.0 (https://github.com/ChillibyteUK/hub-gsct2026)
 * Copyright 2026 Chillibyte - DS
 * Licensed under GPL-3.0
 */
(function () {
	'use strict';

	/**
	 * Mobile nav toggle. Wires any button with aria-controls pointing at a
	 * .navbar-collapse to show/hide it and keep aria-expanded in sync — this is
	 * the entire replacement for Bootstrap's Collapse component for this use case.
	 */
	function initNavToggle() {
	  document.querySelectorAll('.navbar-toggler[aria-controls]').forEach(toggler => {
	    const target = document.getElementById(toggler.getAttribute('aria-controls'));
	    if (!target) return;
	    toggler.addEventListener('click', () => {
	      const isOpen = target.classList.toggle('is-open');
	      toggler.setAttribute('aria-expanded', String(isOpen));
	    });

	    // Close after choosing a link — expected mobile nav behaviour.
	    target.querySelectorAll('a').forEach(link => {
	      link.addEventListener('click', () => {
	        target.classList.remove('is-open');
	        toggler.setAttribute('aria-expanded', 'false');
	      });
	    });
	  });
	}

	/**
	 * Click-to-open nav dropdowns. Each dropdown-toggle button shows/hides its
	 * linked .dropdown-menu and keeps aria-expanded in sync. Clicking elsewhere,
	 * or pressing Escape, closes whatever is open — this is the entire
	 * replacement for hover-based submenus.
	 */
	function initNavDropdowns() {
	  const toggles = document.querySelectorAll('.dropdown-toggle[aria-controls]');
	  function close(toggle) {
	    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
	    if (!menu) return;
	    menu.classList.remove('is-open');
	    toggle.setAttribute('aria-expanded', 'false');
	  }
	  function closeAllExcept(except) {
	    toggles.forEach(toggle => {
	      if (toggle !== except) close(toggle);
	    });
	  }
	  toggles.forEach(toggle => {
	    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
	    if (!menu) return;
	    toggle.addEventListener('click', event => {
	      event.stopPropagation();
	      const isOpen = menu.classList.toggle('is-open');
	      toggle.setAttribute('aria-expanded', String(isOpen));
	      closeAllExcept(toggle);
	    });
	  });
	  document.addEventListener('click', event => {
	    if (event.target.closest('.dropdown-menu')) return;
	    closeAllExcept();
	  });
	  document.addEventListener('keydown', event => {
	    if (event.key !== 'Escape') return;
	    const openToggle = Array.from(toggles).find(toggle => toggle.getAttribute('aria-expanded') === 'true');
	    closeAllExcept();
	    if (openToggle) openToggle.focus();
	  });
	}

	/**
	 * Native <dialog> wiring — replaces Bootstrap's Modal component entirely.
	 * showModal()/close() do the heavy lifting (focus trap, Escape-to-close,
	 * ::backdrop); this just connects trigger/close buttons to a target dialog.
	 *
	 * Markup:
	 *   <button data-dialog-target="my-dialog">Open</button>
	 *   <dialog id="my-dialog">
	 *     <button data-dialog-close>Close</button>
	 *     ...
	 *   </dialog>
	 *
	 * A dialog containing <iframe data-src="..."> (click-to-play video embeds)
	 * only loads the iframe when the dialog opens — nothing is fetched or
	 * tracked until asked for — and unloads it again on close, so background
	 * playback stops the moment the modal closes.
	 */
	function initDialogs() {
	  document.querySelectorAll('[data-dialog-target]').forEach(trigger => {
	    const dialog = document.getElementById(trigger.getAttribute('data-dialog-target'));
	    if (!(dialog instanceof HTMLDialogElement)) return;
	    trigger.addEventListener('click', () => {
	      dialog.querySelectorAll('iframe[data-src]').forEach(frame => {
	        if (!frame.getAttribute('src')) frame.setAttribute('src', frame.getAttribute('data-src'));
	      });
	      dialog.showModal();
	    });
	    dialog.querySelectorAll('[data-dialog-close]').forEach(closeBtn => {
	      closeBtn.addEventListener('click', () => dialog.close());
	    });

	    // Click on the backdrop (the dialog element itself, outside its content) closes it.
	    dialog.addEventListener('click', event => {
	      if (event.target === dialog) dialog.close();
	    });

	    // Unload lazy iframes on close — removes the video from the page so
	    // playback (and tracking) stops, ready to load fresh next open.
	    dialog.addEventListener('close', () => {
	      dialog.querySelectorAll('iframe[data-src]').forEach(frame => {
	        frame.removeAttribute('src');
	      });
	    });
	  });
	}

	/**
	 * Bridges for span popover triggers.
	 *
	 * Popover triggers are <span>s, not <button>s — a button won't flow inline
	 * mid-sentence (it stays an atomic, centred box), while a span wraps with
	 * the surrounding text. Two gaps come with that, both bridged here and
	 * nothing else — Esc/outside-click/× dismiss stays fully native:
	 *
	 * - Click: only <button> invokers fire popovertarget natively, so span
	 *   clicks toggle the popover by hand. Native <button> triggers (e.g. the
	 *   × close buttons) are left to the platform.
	 * - Keyboard: buttons get Enter/Space free, spans don't — a focused span
	 *   trigger synthesises a click, which flows through the bridge above.
	 */
	function initPopovers() {
	  document.addEventListener('click', event => {
	    const trigger = event.target instanceof Element ? event.target.closest('[popovertarget]') : null;
	    if (!trigger || 'BUTTON' === trigger.tagName) {
	      return;
	    }
	    const popover = document.getElementById(trigger.getAttribute('popovertarget'));
	    if (popover instanceof HTMLElement && 'function' === typeof popover.togglePopover) {
	      popover.togglePopover();
	    }
	  });
	  document.addEventListener('keydown', event => {
	    if ('Enter' !== event.key && ' ' !== event.key) {
	      return;
	    }
	    const trigger = event.target instanceof Element ? event.target.closest('[popovertarget]') : null;
	    if (!trigger || 'BUTTON' === trigger.tagName) {
	      return;
	    }
	    event.preventDefault();
	    trigger.click();
	  });
	}

	/**
	 * Click-to-play video facades: thumbnail + play button swap for the real
	 * player on click. The iframe carries data-src only (same lazy pattern as
	 * dialog.js), so nothing is fetched until asked for; thumbnail and button
	 * hide while the frame unhides.
	 */
	function initVideoFacades() {
	  document.querySelectorAll('[data-video-facade]').forEach(root => {
	    const play = root.querySelector('[data-video-play]');
	    const frame = root.querySelector('[data-video-frame]');
	    if (!play || !frame) {
	      return;
	    }
	    play.addEventListener('click', () => {
	      const iframe = frame.querySelector('iframe[data-src]');
	      if (iframe && !iframe.getAttribute('src')) {
	        iframe.setAttribute('src', iframe.getAttribute('data-src'));
	      }
	      frame.hidden = false;
	      play.hidden = true;
	      const thumbnail = root.querySelector('[data-video-thumbnail]');
	      if (thumbnail) {
	        thumbnail.hidden = true;
	      }
	    }, {
	      once: true
	    });
	  });
	}

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
	 * Below 768px the crosshair sits at a fixed spot (horizontally centred, a
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
	  const isSmall = window.matchMedia('(max-width: 767px)').matches;
	  const containerWidth = media.clientWidth;
	  const containerHeight = media.clientHeight;

	  // Below 768px the crosshair sits a fixed 6rem from the top, horizontally
	  // centred, instead of at the focal point's own fraction — match that
	  // here (as fractions of the container, like focalX/focalY) so the image
	  // pans to keep the true focal point there.
	  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
	  const targetXFraction = isSmall ? 0.5 : focalX;
	  const targetYFraction = isSmall ? rootFontSize * 6 / containerHeight : focalY;

	  // Falls back to the hardcoded test asset's own 1169×780 until it loads.
	  const imageWidth = background.naturalWidth || 1169;
	  const imageHeight = background.naturalHeight || 780;

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
	function initPrimaryHero() {
	  const mediaEls = document.querySelectorAll('.hub-primary-hero__media');
	  if (!mediaEls.length) return;
	  mediaEls.forEach(media => {
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
	  const resizeObserver = new ResizeObserver(entries => {
	    entries.forEach(entry => layoutPrimaryHero(entry.target));
	  });
	  mediaEls.forEach(media => resizeObserver.observe(media));
	}

	document.addEventListener('DOMContentLoaded', () => {
	  initNavToggle();
	  initNavDropdowns();
	  initDialogs();
	  initPopovers();
	  initVideoFacades();
	  initPrimaryHero();
	});

})();
//# sourceMappingURL=theme.js.map
