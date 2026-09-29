import { initNavToggle } from './nav-toggle';
import { initNavDropdowns } from './nav-dropdown';
import { initDialogs } from './dialog';
import { initPopovers } from './popover';
import { initVideoFacades } from './video-facade';
import { initPrimaryHero } from './primary-hero';

document.addEventListener('DOMContentLoaded', () => {
	initNavToggle();
	initNavDropdowns();
	initDialogs();
	initPopovers();
	initVideoFacades();
	initPrimaryHero();
});
