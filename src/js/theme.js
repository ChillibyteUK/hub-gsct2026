import { initNavToggle } from './nav-toggle';
import { initNavDropdowns } from './nav-dropdown';
import { initDialogs } from './dialog';
import { initPopovers } from './popover';
import { initVideoFacades } from './video-facade';
import { initLenis } from './lenis-init';
import { initPrimaryHero } from './primary-hero';
import { initSecondaryHero } from './secondary-hero';
import { initTimelines } from './timeline';

document.addEventListener('DOMContentLoaded', () => {
	initLenis();
	initNavToggle();
	initNavDropdowns();
	initDialogs();
	initPopovers();
	initVideoFacades();
	initPrimaryHero();
	initSecondaryHero();
	initTimelines();
});
