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

	/**
	 * Smooth scroll via Lenis, synced with GSAP ScrollTrigger through a single
	 * gsap-ticker-driven loop — this sync is the whole point: Lenis on its own
	 * rAF loop leaves ScrollTrigger reading native scroll positions that no
	 * longer match what's on screen, desyncing every scroll-driven trigger on
	 * the page. Self-guarding: no-ops if the Lenis global isn't present;
	 * reduced-motion visitors get native scrolling instead of a hijacked one.
	 */
	function initLenis() {
	  if (typeof window.Lenis === 'undefined') return;
	  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	  const lenis = new window.Lenis({
	    lerp: 0.1
	  });
	  if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
	    try {
	      window.gsap.registerPlugin(window.ScrollTrigger);
	      lenis.on('scroll', window.ScrollTrigger.update);
	      window.gsap.ticker.add(time => {
	        lenis.raf(time * 1000);
	      });
	      window.gsap.ticker.lagSmoothing(0);
	      return;
	    } catch (error) {
	      // Fall through to a standalone rAF loop below.
	    }
	  }
	  function raf(time) {
	    lenis.raf(time);
	    requestAnimationFrame(raf);
	  }
	  requestAnimationFrame(raf);
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
	function initSecondaryHero() {
	  const rows = document.querySelectorAll('.hub-secondary-hero__media');
	  if (!rows.length) return;
	  function revealAll() {
	    document.querySelectorAll('.hub-secondary-hero__image').forEach(img => {
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
	  rows.forEach(media => {
	    const imgs = [...media.querySelectorAll('.hub-secondary-hero__image')].filter(img => img.getBoundingClientRect().width > 0);
	    if (!imgs.length) return;
	    const mediaRect = media.getBoundingClientRect();
	    const centreX = mediaRect.left + mediaRect.width / 2;
	    const targets = imgs.map(img => {
	      const rect = img.getBoundingClientRect();
	      const dx = centreX - (rect.left + rect.width / 2);
	      const rotationY = Math.abs(dx) < 2 ? 0 : dx > 0 ? 30 : -30;
	      return {
	        img,
	        dx,
	        rotationY
	      };
	    });

	    // Stack everything first, then bloom centre-outward.
	    targets.forEach(({
	      img,
	      dx
	    }) => {
	      window.gsap.set(img, {
	        x: dx,
	        rotationY: 0
	      });
	    });
	    targets.sort((a, b) => Math.abs(a.dx) - Math.abs(b.dx));
	    const timeline = window.gsap.timeline({
	      scrollTrigger: {
	        trigger: media,
	        start: 'top 85%',
	        once: true
	      }
	    });
	    targets.forEach(({
	      img,
	      rotationY
	    }, i) => {
	      timeline.to(img, {
	        x: 0,
	        rotationY,
	        opacity: 1,
	        duration: 1.25,
	        ease: 'power3.out'
	      }, i * 0.1);
	    });
	  });

	  // Trigger positions measured above can be stale by the time late assets
	  // shift the page — refresh once everything has landed.
	  window.addEventListener('load', () => {
	    window.ScrollTrigger.refresh();
	  });
	}

	/**
	 * Cards Section entrance: on desktop the cards start stacked on the left
	 * underneath card 1, then deal out rightward in order when the row scrolls
	 * into view — card 2 slides out first, then card 3 from under it. Card 1
	 * never moves; it sits on top of the starting pile via explicit z-order,
	 * cleared once everything lands. Final positions are measured from the
	 * real layout (not hardcoded), so any card count or responsive width just
	 * works.
	 *
	 * Everything happens through gsap.set() inside the animated path, so
	 * reduced-motion / missing GSAP / register failure / no-JS all simply
	 * render the finished layout with nothing to reveal. Below 768px (the
	 * block's own stacking breakpoint — see src/blocks/cards-section.css)
	 * there is no animation at all, just the normal stacked cards.
	 */
	function initCardsSections() {
	  const rows = document.querySelectorAll('.hub-cards-section__cards');

	  // Clear the parse-time pre-stack first (see inline script in render.php)
	  // — every early return below must leave the finished layout behind.
	  rows.forEach(row => {
	    row.querySelectorAll('.hub-cards-section__card').forEach(card => {
	      card.style.transform = '';
	      card.style.zIndex = '';
	    });
	  });
	  if (window.matchMedia('(max-width: 767px)').matches) {
	    return;
	  }
	  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	    return;
	  }
	  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
	    return;
	  }
	  try {
	    window.gsap.registerPlugin(window.ScrollTrigger);
	  } catch (error) {
	    return;
	  }
	  rows.forEach(row => {
	    const cards = [...row.querySelectorAll('.hub-cards-section__card')].filter(card => card.getBoundingClientRect().width > 0);
	    if (cards.length < 2) return;
	    const firstRect = cards[0].getBoundingClientRect();
	    const firstCentreX = firstRect.left + firstRect.width / 2;
	    const targets = cards.map(card => {
	      const rect = card.getBoundingClientRect();
	      return {
	        card,
	        dx: firstCentreX - (rect.left + rect.width / 2)
	      };
	    });

	    // Pile everything under card 1 (first on top), then deal out in
	    // DOM order — card 2 slides out, then card 3 from under it.
	    targets.forEach(({
	      card,
	      dx
	    }, i) => {
	      window.gsap.set(card, {
	        x: dx,
	        zIndex: targets.length - i
	      });
	    });
	    const timeline = window.gsap.timeline({
	      scrollTrigger: {
	        trigger: row,
	        start: 'top 85%',
	        once: true
	      }
	    });
	    targets.forEach(({
	      card
	    }, i) => {
	      if (0 === i) return;
	      timeline.to(card, {
	        x: 0,
	        duration: 1,
	        ease: 'power3.out'
	      }, (i - 1) * 0.25);
	    });
	    timeline.set(cards, {
	      clearProps: 'zIndex'
	    });
	  });

	  // Trigger positions measured above can be stale by the time late assets
	  // shift the page — refresh once everything has landed.
	  window.addEventListener('load', () => {
	    window.ScrollTrigger.refresh();
	  });
	}

	/**
	 * 3 Points fade-in: each numbered .hub-3-points__point fades in
	 * consecutively when its row scrolls into view (covers both HUB 3 Points
	 * and HUB 3 Points Hero — they share the markup). Only the numbered
	 * variant animates — a point showing a big stat renders as-is. Numbered
	 * points start at opacity 0 from CSS gated on scripting:enabled (see
	 * src/blocks/3-points.css), so reduced-motion / missing GSAP / register
	 * failure just clear back to visible instead of animating; no-JS keeps
	 * the finished layout with nothing to reveal.
	 */
	function initThreePoints() {
	  const rows = document.querySelectorAll('.hub-3-points__points');
	  if (!rows.length) return;
	  function revealAll() {
	    document.querySelectorAll('.hub-3-points__point').forEach(point => {
	      point.style.opacity = '1';
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
	  rows.forEach(row => {
	    const points = [...row.querySelectorAll('.hub-3-points__point')].filter(point => point.getBoundingClientRect().width > 0 && point.querySelector(':scope > .number'));
	    if (!points.length) return;
	    const timeline = window.gsap.timeline({
	      scrollTrigger: {
	        trigger: row,
	        start: 'top 85%',
	        once: true
	      }
	    });
	    timeline.to(points, {
	      opacity: 1,
	      duration: 0.8,
	      ease: 'power2.out',
	      stagger: 0.2
	    });
	  });

	  // Trigger positions measured above can be stale by the time late assets
	  // shift the page — refresh once everything has landed.
	  window.addEventListener('load', () => {
	    window.ScrollTrigger.refresh();
	  });
	}

	/**
	 * Timeline slider arrows: each click lands the next (or previous) card
	 * exactly on the track's left padding edge — computed from live geometry,
	 * not by nudging a fixed card width, so partially-scrolled positions still
	 * resolve to a clean card. Includes disabled states at each end. Reduced
	 * motion gets instant jumps instead of smooth scrolling.
	 */
	function initTimelines() {
	  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	  const behavior = reduceMotion ? 'auto' : 'smooth';
	  document.querySelectorAll('.hub-timeline__track-wrap').forEach(wrap => {
	    const track = wrap.querySelector('.hub-timeline__track');
	    const prev = wrap.querySelector('.hub-timeline__prev');
	    const next = wrap.querySelector('.hub-timeline__next');
	    if (!track || !prev || !next) return;
	    const padStart = () => parseFloat(getComputedStyle(track).paddingInlineStart) || 0;

	    // The scrollLeft that would park this slide on the padding edge.
	    const slideScroll = slide => {
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
	      const target = [...slides()].reverse().find(slide => slideScroll(slide) < current - 1);
	      track.scrollTo({
	        left: target ? slideScroll(target) : 0,
	        behavior
	      });
	    });
	    next.addEventListener('click', () => {
	      const current = track.scrollLeft;
	      const target = slides().find(slide => slideScroll(slide) > current + 1);
	      if (target) {
	        track.scrollTo({
	          left: slideScroll(target),
	          behavior
	        });
	      }
	    });
	    track.addEventListener('scroll', syncDisabled, {
	      passive: true
	    });
	    syncDisabled();
	  });
	}

	/**
	 * Share buttons ([data-share]) — the icon-only share control on single posts.
	 *
	 * Uses the Web Share API where the browser offers it (mobile), otherwise
	 * copies the article URL to the clipboard with a brief "Copied" confirmation.
	 * No share-provider links are rendered: nothing to style per network, no
	 * third-party endpoints, and it degrades to a plain copy on desktop.
	 */
	function initShareButtons() {
	  const buttons = document.querySelectorAll('[data-share]');
	  buttons.forEach(button => {
	    button.addEventListener('click', async () => {
	      const url = button.getAttribute('data-share-url') || window.location.href;
	      const title = button.getAttribute('data-share-title') || document.title;
	      if (navigator.share) {
	        try {
	          await navigator.share({
	            title,
	            url
	          });
	        } catch (err) {
	          // User dismissed the sheet — not an error.
	        }
	        return;
	      }
	      let copied = false;
	      if (navigator.clipboard) {
	        try {
	          await navigator.clipboard.writeText(url);
	          copied = true;
	        } catch (err) {
	          copied = false;
	        }
	      }
	      if (!copied) {
	        const input = document.createElement('textarea');
	        input.value = url;
	        input.setAttribute('readonly', '');
	        input.style.position = 'absolute';
	        input.style.left = '-9999px';
	        document.body.appendChild(input);
	        input.select();
	        try {
	          copied = document.execCommand('copy');
	        } catch (err) {
	          copied = false;
	        }
	        document.body.removeChild(input);
	      }
	      if (!copied) {
	        return;
	      }
	      const originalLabel = button.getAttribute('aria-label');
	      button.classList.add('is-copied');
	      button.setAttribute('aria-label', 'Link copied to clipboard');
	      window.setTimeout(() => {
	        button.classList.remove('is-copied');
	        if (originalLabel) {
	          button.setAttribute('aria-label', originalLabel);
	        }
	      }, 2000);
	    });
	  });
	}

	/**
	 * Swipe-carousel dots for card tracks. Each section's dots mirror its
	 * swipe track: tapping a dot scrolls to that card, and scrolling updates
	 * the active dot. Desktop shows a plain grid (no overflow), so the dots
	 * stay hidden there and this is a no-op. Scopes to Related Insights
	 * sections plus any [data-hub-carousel] group (e.g. HUB Latest Posts and
	 * Documents), with cards found by [data-hub-carousel-card].
	 */
	function initRelatedInsights() {
	  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	  document.querySelectorAll('.hub-related-insights, [data-hub-carousel]').forEach(section => {
	    const track = section.querySelector('.hub-related-insights__track');
	    const cards = Array.from(section.querySelectorAll('[data-hub-carousel-card]'));
	    const dots = Array.from(section.querySelectorAll('[data-hub-related-dot]'));
	    if (!track || cards.length === 0 || dots.length === 0) return;
	    const setActive = index => {
	      dots.forEach((dot, i) => {
	        dot.classList.toggle('is-active', i === index);
	      });
	    };
	    dots.forEach((dot, index) => {
	      dot.addEventListener('click', () => {
	        track.scrollTo({
	          left: cards[index].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft),
	          behavior: reduceMotion ? 'auto' : 'smooth'
	        });
	      });
	    });
	    let ticking = false;
	    track.addEventListener('scroll', () => {
	      if (ticking) return;
	      ticking = true;
	      window.requestAnimationFrame(() => {
	        let nearest = 0;
	        let nearestDistance = Infinity;
	        cards.forEach((card, index) => {
	          const distance = Math.abs(card.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft) - track.scrollLeft);
	          if (distance < nearestDistance) {
	            nearestDistance = distance;
	            nearest = index;
	          }
	        });
	        setActive(nearest);
	        ticking = false;
	      });
	    }, {
	      passive: true
	    });
	  });
	}

	/**
	 * Holdings exclusion toggle — within each .hub-holdings section, keeps
	 * exactly the first 10 rows visible, either unfiltered or skipping rows
	 * tagged data-hub-holdings-excluded (sector 'Collective investments').
	 * Scoped per section so multiple holdings blocks never interfere.
	 */
	function initHoldings() {
	  document.querySelectorAll('.hub-holdings').forEach(section => {
	    const toggle = section.querySelector('.hub-holdings__toggle');
	    if (!toggle) {
	      return;
	    }
	    const rows = Array.from(section.querySelectorAll('.hub-holdings__table tbody tr'));
	    const apply = excluding => {
	      let shown = 0;
	      rows.forEach(row => {
	        if (excluding && row.hasAttribute('data-hub-holdings-excluded')) {
	          row.hidden = true;
	          row.classList.remove('is-alt');
	          return;
	        }
	        if (shown < 10) {
	          row.hidden = false;
	          shown += 1;
	          const rank = row.querySelector('.hub-holdings__rank-col');
	          if (rank) {
	            rank.textContent = String(shown);
	          }
	          row.classList.toggle('is-alt', 0 === shown % 2);
	        } else {
	          row.hidden = true;
	          row.classList.remove('is-alt');
	        }
	      });
	    };
	    toggle.addEventListener('click', () => {
	      const excluding = 'true' !== toggle.getAttribute('aria-pressed');
	      toggle.setAttribute('aria-pressed', String(excluding));
	      apply(excluding);
	    });
	  });
	}

	/**
	 * Geographic allocation doughnuts ([data-geo-chart]) — reads labels, values
	 * and slice colours from the canvas's own data attributes (rendered by the
	 * HUB Holdings Geographic Chart block) and draws a Chart.js doughnut. No
	 * legend (the sibling table is the legend); tooltips read "Region: x.x%".
	 * Silently skips everything if the vendored Chart.js global isn't there.
	 */
	function initGeoCharts() {
	  if (typeof window.Chart === 'undefined') {
	    return;
	  }
	  document.querySelectorAll('[data-geo-chart]').forEach(canvas => {
	    let labels = [];
	    let values = [];
	    let colors = [];
	    try {
	      labels = JSON.parse(canvas.getAttribute('data-labels') || '[]');
	      values = JSON.parse(canvas.getAttribute('data-values') || '[]');
	      colors = JSON.parse(canvas.getAttribute('data-colors') || '[]');
	    } catch (err) {
	      return;
	    }
	    if (!labels.length || !values.length) {
	      return;
	    }
	    new window.Chart(canvas, {
	      type: 'doughnut',
	      data: {
	        labels,
	        datasets: [{
	          data: values,
	          backgroundColor: colors,
	          borderColor: '#ffffff',
	          borderWidth: 2
	        }]
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: true,
	        cutout: '70%',
	        plugins: {
	          legend: {
	            display: false
	          },
	          tooltip: {
	            callbacks: {
	              label: context => ` ${context.parsed}%`
	            }
	          }
	        }
	      }
	    });
	  });
	}

	/**
	 * Return performance bar chart ([data-return-chart]) — reads period
	 * labels and per-leg datasets from the canvas's own data attributes
	 * (rendered by the HUB Return Performance block from its hand-entered
	 * cumulative values) and draws a grouped Chart.js bar chart. Legend is
	 * hand-rendered HTML beside the canvas; the tooltip is Chart.js's own,
	 * skinned light. Silently skips everything if the vendored Chart.js
	 * global isn't there.
	 */
	function initReturnPerformance() {
	  if (typeof window.Chart === 'undefined') {
	    return;
	  }
	  const periodNames = {
	    '1M': '1 MONTH',
	    YTD: 'YEAR TO DATE',
	    '1Y': '1 YEAR',
	    '3Y': '3 YEARS',
	    '5Y': '5 YEARS'
	  };
	  document.querySelectorAll('[data-return-chart]').forEach(canvas => {
	    let labels = [];
	    let datasets = [];
	    try {
	      labels = JSON.parse(canvas.getAttribute('data-labels') || '[]');
	      datasets = JSON.parse(canvas.getAttribute('data-datasets') || '[]');
	    } catch (err) {
	      return;
	    }
	    if (!labels.length || !datasets.length) {
	      return;
	    }
	    new window.Chart(canvas, {
	      type: 'bar',
	      data: {
	        labels,
	        datasets: datasets.map(set => ({
	          label: set.label,
	          data: set.data,
	          backgroundColor: set.color,
	          borderRadius: 3,
	          borderSkipped: 'start',
	          categoryPercentage: 0.6,
	          barPercentage: 0.7
	        }))
	      },
	      options: {
	        responsive: true,
	        maintainAspectRatio: false,
	        plugins: {
	          legend: {
	            display: false
	          },
	          tooltip: {
	            backgroundColor: '#ffffff',
	            titleColor: '#1e1e1e',
	            bodyColor: '#1e1e1e',
	            borderColor: '#e0e0e0',
	            borderWidth: 1,
	            padding: 12,
	            displayColors: true,
	            boxPadding: 4,
	            callbacks: {
	              title: items => periodNames[items[0].label] || items[0].label,
	              label: context => ` ${context.dataset.label} ${Number(context.parsed.y).toFixed(2)}%`,
	              labelColor: context => ({
	                borderColor: context.dataset.backgroundColor,
	                backgroundColor: context.dataset.backgroundColor
	              })
	            }
	          }
	        },
	        scales: {
	          x: {
	            grid: {
	              display: false
	            }
	          },
	          y: {
	            beginAtZero: true,
	            ticks: {
	              // Fixed 10-point lattice (always a multiple of
	              // 10, so 0% is unavoidably a tick) with auto-skip
	              // off: at 210px tall the auto lattice anchors at
	              // the data min instead (-5, 5, 15…) and the
	              // render pass then drops every other tick,
	              // deleting the 0% baseline the bars hang off.
	              stepSize: 10,
	              autoSkip: false,
	              callback: value => `${value}%`
	            },
	            grid: {
	              color: '#e5e5e5'
	            }
	          }
	        }
	      }
	    });
	  });
	}

	/**
	 * Dividends block: annual stacked chart with year-range pills, searchable
	 * history with progressive disclosure, and CSV export. Scoped per section
	 * so multiple blocks never interfere. Table striping (.is-alt) is
	 * re-applied to visible rows on every pass, so hiding rows can't break
	 * the alternation.
	 */
	function initDividends() {
	  document.querySelectorAll('.hub-dividends').forEach(section => {
	    initDividendChart(section);
	    initDividendHistory(section);
	  });
	}
	function initDividendChart(section) {
	  const canvas = section.querySelector('[data-div-chart]');
	  if (!canvas || typeof window.Chart === 'undefined') {
	    return;
	  }
	  let years = [];
	  try {
	    years = JSON.parse(canvas.getAttribute('data-chart') || '[]');
	  } catch (err) {
	    return;
	  }
	  if (!years.length) {
	    return;
	  }
	  const chart = new window.Chart(canvas, {
	    type: 'bar',
	    data: {
	      labels: [],
	      datasets: []
	    },
	    options: {
	      responsive: true,
	      maintainAspectRatio: false,
	      plugins: {
	        legend: {
	          display: false
	        },
	        tooltip: {
	          backgroundColor: '#ffffff',
	          titleColor: '#1e1e1e',
	          bodyColor: '#1e1e1e',
	          borderColor: '#e0e0e0',
	          borderWidth: 1,
	          padding: 12,
	          displayColors: true,
	          boxPadding: 4,
	          callbacks: {
	            title: items => String(items[0].label),
	            label: context => ` ${context.dataset.label} ${Number(context.parsed.y).toFixed(2)} GBp`,
	            labelColor: context => ({
	              borderColor: context.dataset.backgroundColor,
	              backgroundColor: context.dataset.backgroundColor
	            })
	          }
	        }
	      },
	      scales: {
	        x: {
	          stacked: true,
	          grid: {
	            display: false
	          }
	        },
	        y: {
	          stacked: true,
	          beginAtZero: true,
	          title: {
	            display: true,
	            text: 'Dividend (GBp)'
	          },
	          ticks: {
	            stepSize: 1,
	            autoSkip: false
	          },
	          grid: {
	            color: '#e5e5e5'
	          }
	        }
	      }
	    }
	  });
	  const render = count => {
	    const slice = 0 === count ? years : years.slice(-count);
	    chart.data.labels = slice.map(row => row.year);
	    chart.data.datasets = [{
	      label: 'Final',
	      data: slice.map(row => row.final),
	      backgroundColor: '#307eff',
	      borderRadius: 3,
	      borderSkipped: 'start'
	    }, {
	      label: 'Interim',
	      data: slice.map(row => row.interim),
	      backgroundColor: '#7628d4',
	      borderRadius: 3,
	      borderSkipped: 'start'
	    }];
	    chart.update();
	  };
	  const pills = section.querySelector('[data-div-pills]');
	  if (pills) {
	    pills.querySelectorAll('button[data-years]').forEach(button => {
	      button.addEventListener('click', () => {
	        pills.querySelectorAll('button[data-years]').forEach(other => {
	          other.classList.toggle('is-active', other === button);
	        });
	        render(parseInt(button.getAttribute('data-years'), 10) || 0);
	      });
	    });
	  }
	  render(5);
	}
	function initDividendHistory(section) {
	  const rows = Array.from(section.querySelectorAll('[data-div-row]'));
	  if (!rows.length) {
	    return;
	  }
	  const search = section.querySelector('[data-div-search]');
	  const more = section.querySelector('[data-div-more]');
	  const count = section.querySelector('[data-div-count]');
	  const csv = section.querySelector('[data-div-csv]');
	  const table = section.querySelector('[data-div-export]');
	  let shown = 10;
	  const apply = () => {
	    const query = (search?.value || '').trim().toLowerCase();
	    const matches = rows.filter(row => !query || (row.getAttribute('data-search') || '').includes(query));
	    let visible = 0;
	    rows.forEach(row => {
	      const show = matches.includes(row) && visible < shown;
	      if (show) {
	        visible += 1;
	        row.classList.toggle('is-alt', 0 === visible % 2);
	      } else {
	        row.classList.remove('is-alt');
	      }
	      row.hidden = !show;
	    });
	    if (count) {
	      count.textContent = `${visible} of ${matches.length}`;
	    }
	    if (more) {
	      more.hidden = visible >= matches.length;
	    }
	  };
	  rows.forEach((row, index) => {
	    if (index < 10) {
	      row.classList.toggle('is-alt', 0 === (index + 1) % 2);
	    }
	  });
	  if (search) {
	    search.addEventListener('input', () => {
	      shown = 10;
	      apply();
	    });
	  }
	  if (more) {
	    more.addEventListener('click', () => {
	      shown += 10;
	      apply();
	    });
	  }
	  if (csv && table) {
	    csv.addEventListener('click', () => {
	      let all = [];
	      try {
	        all = JSON.parse(table.getAttribute('data-div-export') || '[]');
	      } catch (err) {
	        return;
	      }
	      const lines = ['Ex-dividend date,Payment date,Dividend type,Dividend (GBp)'].concat(all.map(cells => cells.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')));
	      const blob = new Blob([lines.join('\r\n')], {
	        type: 'text/csv'
	      });
	      const link = document.createElement('a');
	      link.href = URL.createObjectURL(blob);
	      link.download = 'dividend-history.csv';
	      document.body.appendChild(link);
	      link.click();
	      URL.revokeObjectURL(link.href);
	      link.remove();
	    });
	  }
	  apply();
	}

	/**
	 * Dividend calculator form ([data-div-calc]) — submits its dates and
	 * share count to GET hub/v1/dividend-calc and renders the total plus
	 * yield, with failures shown inline. Scoped per section.
	 */
	function initDividendCalculator() {
	  document.querySelectorAll('[data-div-calc]').forEach(form => {
	    const section = form.closest('.hub-dividend-calculator') || document;
	    const submit = form.querySelector('[data-div-calc-submit]');
	    const error = form.querySelector('[data-div-calc-error]');
	    const results = section.querySelector('[data-div-calc-results]');
	    const total = section.querySelector('[data-div-calc-total]');
	    const payments = section.querySelector('[data-div-calc-payments]');
	    const paymentRows = section.querySelector('[data-div-calc-payment-rows]');
	    let lastYieldText = '–';
	    const gbp = value => Number(value).toLocaleString('en-GB', {
	      minimumFractionDigits: 2,
	      maximumFractionDigits: 2
	    });

	    // Recompute per-row amounts plus the grand total from the row
	    // inputs. Yield is per-share by definition, so row edits move the
	    // amounts/total but never the yield.
	    const recalc = () => {
	      let grand = 0;
	      if (paymentRows) {
	        paymentRows.querySelectorAll('tr').forEach(row => {
	          const input = row.querySelector('input');
	          const amount = row.querySelector('[data-div-calc-amount]');
	          if (!input || !amount) {
	            return;
	          }
	          const shares = Math.max(0, parseInt(input.value, 10) || 0);
	          const value = parseFloat(input.getAttribute('data-value')) || 0;
	          const rowTotal = shares * value;
	          amount.textContent = gbp(rowTotal);
	          grand += rowTotal;
	        });
	      }
	      if (total) {
	        total.textContent = gbp(grand);
	      }
	      if (live) {
	        live.textContent = `Total dividend amount ${gbp(grand)} GBp. Dividend yield ${lastYieldText}.`;
	      }
	    };
	    if (paymentRows) {
	      paymentRows.addEventListener('input', recalc);
	    }
	    const yieldOut = section.querySelector('[data-div-calc-yield]');
	    const yieldNote = section.querySelector('[data-div-calc-yield-note]');
	    const live = section.querySelector('[data-div-calc-live]');
	    const endpoint = form.getAttribute('data-endpoint');
	    if (!endpoint) {
	      return;
	    }
	    form.addEventListener('submit', async event => {
	      event.preventDefault();
	      const params = new URLSearchParams(new FormData(form));
	      if (error) {
	        error.hidden = true;
	      }
	      if (submit) {
	        submit.disabled = true;
	      }
	      try {
	        const response = await fetch(`${endpoint}?${params.toString()}`, {
	          headers: {
	            Accept: 'application/json'
	          }
	        });
	        const data = await response.json();
	        if (!response.ok) {
	          throw new Error(data?.message || 'Calculation failed.');
	        }
	        const totalText = `${Number(data.total_gbp).toLocaleString('en-GB', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
	        const yieldText = null === data.yield_pct ? '–' : `${Number(data.yield_pct).toFixed(2)}%`;
	        if (total) {
	          total.textContent = totalText;
	        }
	        if (yieldOut) {
	          yieldOut.textContent = yieldText;
	        }
	        if (yieldNote) {
	          const noteText = data.yield_note || '';
	          yieldNote.textContent = noteText;
	          yieldNote.hidden = '' === noteText;
	        }
	        if (results) {
	          results.hidden = false;
	        }
	        lastYieldText = yieldText;
	        if (payments && paymentRows) {
	          paymentRows.textContent = '';
	          const formShares = Math.max(0, parseInt(new FormData(form).get('shares'), 10) || 0);
	          (data.payments || []).forEach(payment => {
	            const row = document.createElement('tr');
	            [payment.ex, payment.pay, payment.type, Number(payment.value).toFixed(2)].forEach((cell, index) => {
	              const td = document.createElement('td');
	              td.textContent = cell ?? '';
	              if (3 === index) {
	                td.className = 'hub-dividends__value-col';
	              }
	              row.appendChild(td);
	            });
	            const sharesTd = document.createElement('td');
	            const sharesInput = document.createElement('input');
	            sharesInput.type = 'number';
	            sharesInput.min = '0';
	            sharesInput.step = '1';
	            sharesInput.value = String(formShares);
	            sharesInput.setAttribute('data-value', String(payment.value));
	            sharesInput.setAttribute('aria-label', `Shares held for dividend paid ${payment.pay}`);
	            sharesTd.appendChild(sharesInput);
	            row.appendChild(sharesTd);
	            const amountTd = document.createElement('td');
	            amountTd.className = 'hub-dividends__value-col';
	            amountTd.setAttribute('data-div-calc-amount', '');
	            amountTd.textContent = gbp(formShares * Number(payment.value));
	            row.appendChild(amountTd);
	            paymentRows.appendChild(row);
	          });
	          payments.hidden = 0 === (data.payments || []).length;
	        }
	        if (live) {
	          live.textContent = `Total dividend amount ${totalText} GBp. Dividend yield ${yieldText}.`;
	        }
	      } catch (err) {
	        if (error) {
	          error.textContent = err?.message || 'Calculation failed.';
	          error.hidden = false;
	        }
	        if (results) {
	          results.hidden = true;
	        }
	        if (payments) {
	          payments.hidden = true;
	        }
	      } finally {
	        if (submit) {
	          submit.disabled = false;
	        }
	      }
	    });
	  });
	}

	/**
	 * Document library filtering ([data-doc-row]) — one category pill at a
	 * time (toggle off by clicking again), overflow categories under the More
	 * dropdown, and a title substring search. Everything combines client-side
	 * with no reload; visible rows are re-striped and re-counted on every
	 * pass. Scoped per section so multiple libraries never interfere.
	 */
	function initDocumentLibraries() {
	  document.querySelectorAll('.hub-document-library').forEach(section => {
	    const rows = Array.from(section.querySelectorAll('[data-doc-row]'));
	    const empty = section.querySelector('[data-doc-empty]');
	    const search = section.querySelector('[data-document-library-search]');
	    const pills = Array.from(section.querySelectorAll('.hub-document-library__pill[data-cat]'));
	    const more = section.querySelector('.hub-document-library__more');
	    const toggle = section.querySelector('.hub-document-library__more-toggle');
	    const menu = section.querySelector('.hub-document-library__menu');
	    const menuItems = menu ? Array.from(menu.querySelectorAll('.hub-document-library__menu-item')) : [];
	    if (0 === rows.length) {
	      return;
	    }
	    let activeCat = '';
	    const setPressed = (button, on) => {
	      button.classList.toggle('active', on);
	      button.setAttribute('aria-pressed', String(on));
	    };
	    const closeMenu = () => {
	      if (!menu || !toggle || menu.hidden) {
	        return;
	      }
	      menu.hidden = true;
	      toggle.setAttribute('aria-expanded', 'false');
	    };
	    const apply = () => {
	      const query = (search?.value || '').trim().toLowerCase();
	      let shown = 0;
	      rows.forEach(row => {
	        const inCat = !activeCat || (row.getAttribute('data-cats') || '').split(' ').includes(activeCat);
	        const inQuery = !query || (row.getAttribute('data-title') || '').includes(query);
	        const visible = inCat && inQuery;
	        row.hidden = !visible;
	        if (visible) {
	          shown += 1;
	          row.classList.toggle('is-alt', 0 === shown % 2);
	        } else {
	          row.classList.remove('is-alt');
	        }
	      });
	      if (empty) {
	        empty.hidden = shown > 0;
	      }
	    };
	    const selectCat = slug => {
	      activeCat = activeCat === slug ? '' : slug;
	      pills.forEach(pill => {
	        setPressed(pill, pill.getAttribute('data-cat') === activeCat);
	      });
	      menuItems.forEach(item => {
	        setPressed(item, item.getAttribute('data-cat') === activeCat);
	      });
	      if (toggle) {
	        const inMenu = menuItems.some(item => item.getAttribute('data-cat') === activeCat);
	        toggle.classList.toggle('active', inMenu);
	      }
	      apply();
	    };
	    pills.forEach(pill => {
	      pill.addEventListener('click', () => {
	        selectCat(pill.getAttribute('data-cat') || '');
	      });
	    });
	    menuItems.forEach(item => {
	      item.addEventListener('click', () => {
	        selectCat(item.getAttribute('data-cat') || '');
	        closeMenu();
	      });
	    });
	    if (toggle && menu) {
	      toggle.addEventListener('click', event => {
	        event.stopPropagation();
	        const open = menu.hidden;
	        menu.hidden = !open;
	        toggle.setAttribute('aria-expanded', String(open));
	      });
	      document.addEventListener('click', event => {
	        if (more && !more.contains(event.target)) {
	          closeMenu();
	        }
	      });
	      document.addEventListener('keydown', event => {
	        if ('Escape' === event.key) {
	          closeMenu();
	        }
	      });
	    }
	    if (search) {
	      search.addEventListener('input', apply);
	    }
	  });
	}

	/**
	 * Announcements (Investis RNS tool) enhancement. The tool renders
	 * everything client-side and re-renders on every filter/page change, so
	 * this runs once at init plus on every DOM change inside the container —
	 * every step is guarded to be a no-op on repeat runs:
	 *
	 * - moves each row's .form-type category content into a real Category
	 *   column (with matching header), leaving rows without one an empty
	 *   cell so columns stay aligned. The "Form type" sr-only span moves
	 *   with it untouched.
	 * - appends a visible "Download" label to the icon-only PDF links.
	 * - builds the "Search results / N documents found" heading and the
	 *   "Page X of Y (Z results)" footer from the tool's own count text,
	 *   hiding the tool's duplicated native counts once parsed.
	 */
	function initAnnouncements() {
	  document.querySelectorAll('.hub-announcements').forEach(section => {
	    const root = section.querySelector('.invd-container');
	    if (!root) {
	      return;
	    }
	    const enhance = () => {
	      enhanceAnnouncements(section);
	    };
	    enhance();
	    new MutationObserver(enhance).observe(root, {
	      childList: true,
	      subtree: true
	    });
	  });
	}
	function enhanceAnnouncements(section) {
	  const table = section.querySelector('table.invd-table');
	  if (!table) {
	    return;
	  }
	  const headRow = table.querySelector('thead tr');
	  if (headRow && !headRow.querySelector('.hub-ann-cat-th')) {
	    const th = document.createElement('th');
	    th.scope = 'col';
	    th.className = 'hub-ann-cat-th';
	    th.textContent = 'Category';
	    const downloadTh = headRow.querySelector('.invd-download-th');
	    headRow.insertBefore(th, downloadTh);
	    const dateTh = headRow.querySelector('.invd-date-time-th');
	    if (dateTh && 'Date and time' === (dateTh.textContent || '').trim()) {
	      dateTh.textContent = 'Date';
	    }
	  }

	  // Every step below is self-guarding (not flag-once): the tool hydrates
	  // rows progressively, so links and categories can arrive after this has
	  // already run over the row. Re-runs converge instead of duplicating.
	  table.querySelectorAll('tbody tr').forEach(row => {
	    let catTd = row.querySelector('.hub-ann-cat-td');
	    if (!catTd) {
	      catTd = document.createElement('td');
	      catTd.className = 'hub-ann-cat-td';
	      row.insertBefore(catTd, row.querySelector('.invd-download-td'));
	    }
	    const formType = row.querySelector('.form-type');
	    if (formType && formType.parentElement !== catTd) {
	      catTd.appendChild(formType);
	    }
	    const link = row.querySelector('.invd-download-td a.pdf');
	    if (link) {
	      // Swap the tool's large document glyph for the theme's small
	      // download arrow — one less specificity fight to win.
	      const icon = link.querySelector('.icon');
	      if (icon && !icon.querySelector('svg.hub-ann-dl-icon')) {
	        icon.innerHTML = '<svg class="hub-ann-dl-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 1v8m0 0 3-3M7 9 4 6M2 11v1.5A.5.5 0 0 0 2.5 13h9a.5.5 0 0 0 .5-.5V11"/></svg>';
	      }
	      if (!link.querySelector('.hub-ann-dl-text')) {
	        const label = document.createElement('span');
	        label.className = 'hub-ann-dl-text';
	        label.textContent = 'Download';
	        link.appendChild(label);
	      }
	    }
	  });

	  // Tag pagination controls with our own classes (styling no longer
	  // depends on the tool's selectors). classList is idempotent, so this
	  // is observer-safe.
	  const pager = section.querySelector('cid-pagination');
	  if (pager) {
	    pager.querySelectorAll('a, button').forEach(el => {
	      el.classList.add('hub-ann-page');
	    });
	  }
	  const countSource = section.querySelector('.news-result-count .msg-alignment');
	  if (!countSource) {
	    return;
	  }
	  const match = (countSource.textContent || '').match(/Displaying\s+(\d+)\s*-\s*(\d+)\s+of\s+([\d,]+)/i);
	  if (!match) {
	    return;
	  }
	  const start = parseInt(match[1], 10);
	  const end = parseInt(match[2], 10);
	  const total = parseInt(match[3].replace(/,/g, ''), 10);
	  if (!start || !end || !total) {
	    return;
	  }
	  const pageSize = end - start + 1;
	  const page = Math.floor((start - 1) / pageSize) + 1;
	  const totalPages = Math.ceil(total / pageSize);
	  const totalText = total.toLocaleString('en-GB');
	  let head = section.querySelector('.hub-ann-head');
	  if (!head) {
	    head = document.createElement('div');
	    head.className = 'hub-ann-head';
	    const heading = document.createElement('h2');
	    heading.className = 'text-body-l-medium';
	    heading.textContent = 'Search results';
	    const count = document.createElement('p');
	    count.className = 'hub-ann-count';
	    head.appendChild(heading);
	    head.appendChild(count);
	    const tableWrap = table.closest('.table-layout') || table;
	    tableWrap.parentNode.insertBefore(head, tableWrap);
	  }
	  // Compare-before-write throughout here: assigning textContent mutates
	  // the DOM even when the string is identical, which would re-trigger
	  // this same observer forever and hang the page.
	  const countEl = head.querySelector('.hub-ann-count');
	  const countText = `${totalText} documents found`;
	  if (countEl.textContent !== countText) {
	    countEl.textContent = countText;
	  }
	  let foot = section.querySelector('.hub-ann-foot');
	  if (!foot) {
	    foot = document.createElement('div');
	    foot.className = 'hub-ann-foot';
	    const tableWrap = table.closest('.table-layout') || table;
	    tableWrap.parentNode.insertBefore(foot, tableWrap.nextSibling);
	  }
	  const footText = `Page ${page} of ${totalPages} (${totalText} results)`;
	  if (foot.textContent !== footText) {
	    foot.textContent = footText;
	  }
	  const pagerMarked = section.querySelector('cid-pagination');
	  if (pagerMarked) {
	    pagerMarked.querySelectorAll('a, button').forEach(el => {
	      const label = (el.textContent || '').trim();
	      el.classList.toggle('is-current', label === String(page));
	    });
	  }
	  section.classList.add('hub-ann-counts-replaced');
	}

	document.addEventListener('DOMContentLoaded', () => {
	  initLenis();
	  initNavToggle();
	  initNavDropdowns();
	  initDialogs();
	  initPopovers();
	  initVideoFacades();
	  initPrimaryHero();
	  initSecondaryHero();
	  initCardsSections();
	  initThreePoints();
	  initTimelines();
	  initShareButtons();
	  initRelatedInsights();
	  initHoldings();
	  initGeoCharts();
	  initReturnPerformance();
	  initDocumentLibraries();
	  initAnnouncements();
	  initDividends();
	  initDividendCalculator();
	});

})();
//# sourceMappingURL=theme.js.map
