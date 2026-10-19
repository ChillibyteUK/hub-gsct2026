/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/core-data"
/*!**********************************!*\
  !*** external ["wp","coreData"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["coreData"];

/***/ },

/***/ "@wordpress/data"
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ "@wordpress/edit-post"
/*!**********************************!*\
  !*** external ["wp","editPost"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["editPost"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "@wordpress/plugins"
/*!*********************************!*\
  !*** external ["wp","plugins"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["plugins"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		const getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************************!*\
  !*** ./blocks/_person-panel/src/index.js ***!
  \*******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_edit_post__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/edit-post */ "@wordpress/edit-post");
/* harmony import */ var _wordpress_edit_post__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_edit_post__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);








/**
 * "Person Details" document sidebar panel — the editing UI for the
 * person post meta registered in inc/posttypes.php (role,
 * show_in_people_cards, author_thumbnail, author_bio). Meta with
 * show_in_rest never renders its own field anywhere, so without this the
 * values are write-only data; this is that UI. Scoped to the person post
 * type (returns null everywhere else) and enqueued globally like the lede
 * format (see inc/editor.php) — same reason: editor-wide utilities, not
 * per-block code.
 */

function PersonDetailsPanel() {
  const postType = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => select('core/editor').getCurrentPostType(), []);
  if ('person' !== postType) {
    return null;
  }
  const [meta, setMeta] = (0,_wordpress_core_data__WEBPACK_IMPORTED_MODULE_6__.useEntityProp)('postType', 'person', 'meta');
  const thumbnailId = meta?.author_thumbnail ?? 0;
  const thumbnailUrl = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_5__.useSelect)(select => thumbnailId ? select('core').getMedia(thumbnailId)?.source_url : null, [thumbnailId]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_edit_post__WEBPACK_IMPORTED_MODULE_2__.PluginDocumentSettingPanel, {
    name: "hub-person-details",
    title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Person Details', 'hub-gsct2026'),
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Role', 'hub-gsct2026'),
      value: meta?.role ?? '',
      onChange: value => setMeta({
        ...meta,
        role: value
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.CheckboxControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Show in People Cards', 'hub-gsct2026'),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Unticked people (e.g. post authors who are not board members) are hidden from the People Cards block.', 'hub-gsct2026'),
      checked: !!meta?.show_in_people_cards,
      onChange: value => setMeta({
        ...meta,
        show_in_people_cards: value
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
      className: "hub-person-panel__label",
      style: {
        marginBottom: '8px'
      },
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Author thumbnail', 'hub-gsct2026')
    }), !!thumbnailUrl && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("img", {
      src: thumbnailUrl,
      alt: "",
      style: {
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        marginBottom: '8px'
      }
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      style: {
        display: 'flex',
        gap: '8px'
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_4__.MediaUploadCheck, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_4__.MediaUpload, {
          onSelect: media => setMeta({
            ...meta,
            author_thumbnail: media.id
          }),
          allowedTypes: ['image'],
          value: thumbnailId,
          render: ({
            open
          }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
            variant: "secondary",
            onClick: open,
            children: thumbnailId ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace image', 'hub-gsct2026') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select image', 'hub-gsct2026')
          })
        })
      }), !!thumbnailId && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
        variant: "link",
        isDestructive: true,
        onClick: () => setMeta({
          ...meta,
          author_thumbnail: 0
        }),
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remove', 'hub-gsct2026')
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextareaControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Author bio', 'hub-gsct2026'),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Shown under single posts attributed to this person.', 'hub-gsct2026'),
      value: meta?.author_bio ?? '',
      onChange: value => setMeta({
        ...meta,
        author_bio: value
      })
    })]
  });
}
;(0,_wordpress_plugins__WEBPACK_IMPORTED_MODULE_1__.registerPlugin)('hub-person-details', {
  render: PersonDetailsPanel
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map