/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./blocks/_shared/EditorBlockShell.js"
/*!********************************************!*\
  !*** ./blocks/_shared/EditorBlockShell.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EditorBlockShell)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);






/**
 * Wraps a block's edit.js output in a collapsible section with a title bar
 * and open/closed toggle, persisting the toggle state per block-instance
 * (keyed by the block's position path within the post plus the current
 * URL) in localStorage — so a page with many blocks stays scannable in the
 * editor instead of every block's full field set staying expanded at once.
 *
 * @param {Object}   props
 * @param {Object}   props.blockProps       Result of useBlockProps().
 * @param {string}   props.clientId         The block's clientId, for deriving its position path.
 * @param {string}   [props.classPrefix]    Class/prefix root, matches editor.css.
 * @param {string}   [props.textDomain]     i18n text domain for the toggle's aria-label.
 * @param {string}   [props.storageNamespace] Extra localStorage key segment, in case two shells need independent state on the same path.
 * @param {string}   props.title            Block name shown in the title bar.
 * @param {boolean}  [props.defaultOpen]    Initial state before localStorage is read.
 * @param {*}        props.children         The block's own field controls.
 */

function EditorBlockShell({
  blockProps,
  clientId,
  classPrefix = 'hub',
  textDomain = 'hub-gsct2026',
  storageNamespace = 'block',
  title,
  children,
  defaultOpen = true
}) {
  const [isOpen, setIsOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useState)(defaultOpen);
  const instanceId = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.useInstanceId)(EditorBlockShell);
  const contentRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useRef)();
  const contentId = `${classPrefix}-editor-block-content-${instanceId}`;
  const blockPath = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    if (!clientId) {
      return '';
    }
    const {
      getBlockIndex,
      getBlockRootClientId
    } = select(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.store);
    const path = [];
    let currentId = clientId;
    while (currentId) {
      const parentId = getBlockRootClientId(currentId) || '';
      path.unshift(String(getBlockIndex(currentId, parentId)));
      currentId = parentId || null;
    }
    return path.join('.');
  }, [clientId]);
  const storageKey = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useMemo)(() => {
    if (!clientId || !blockPath || typeof window === 'undefined') {
      return '';
    }
    return [classPrefix, 'editor-block-state', storageNamespace, window.location.pathname, window.location.search, blockPath].join(':');
  }, [blockPath, classPrefix, clientId, storageNamespace]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    if (!storageKey || typeof window === 'undefined') {
      return;
    }
    const storedValue = window.localStorage.getItem(storageKey);
    if (storedValue === 'closed') {
      setIsOpen(false);
    } else if (storedValue === 'open') {
      setIsOpen(true);
    }
  }, [storageKey]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    if (!storageKey || typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(storageKey, isOpen ? 'open' : 'closed');
  }, [isOpen, storageKey]);

  // Confirmed live (2026-09-22, fixed upstream in cb-identityjs2026) as a
  // real, reproducible bug, not a theory: every field in a block's own
  // fields-form UI (TextControl, RichText, the repeater's own inputs)
  // renders inside the block's own canvas output, which sits inside
  // Gutenberg's WritingFlow component — the same wrapper that manages
  // block-to-block multi-selection. Pressing Shift+Arrow with the cursor
  // mid-text (not at a boundary — ruled out as WordPress's own intentional
  // "extend past the edge" behaviour) handed focus to WritingFlow's own
  // handler instead of the input doing its own text selection.
  //
  // A React onKeyDown prop + event.stopPropagation() here does NOT fix
  // it: per Gutenberg's own source
  // (packages/block-editor/src/components/writing-flow/use-arrow-nav.js),
  // WritingFlow intercepts with a plain native `node.addEventListener(
  // 'keydown', onKeyDown )` on its own wrapper element — not a React
  // synthetic handler. That native listener fires during real DOM bubble
  // propagation, which reaches it before React's own internal delegated
  // dispatch (which is what actually invokes a React onKeyDown prop) ever
  // gets to run — so stopping propagation inside React's synthetic system
  // is always too late. Only a real addEventListener on a descendant node
  // (this one) intercepts during native bubbling before it reaches
  // WritingFlow's own ancestor listener.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_4__.useEffect)(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }
    function stopShiftArrowFromReachingWritingFlow(event) {
      if (event.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.stopPropagation();
      }
    }
    node.addEventListener('keydown', stopShiftArrowFromReachingWritingFlow);
    return () => {
      node.removeEventListener('keydown', stopShiftArrowFromReachingWritingFlow);
    };
  }, []);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: `${classPrefix}-editor-block__title`,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
        children: title
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
        type: "button",
        className: `${classPrefix}-editor-block__toggle`,
        onClick: () => setIsOpen(open => !open),
        "aria-expanded": isOpen,
        "aria-controls": contentId,
        "aria-label": isOpen ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Hide block fields', textDomain) : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Show block fields', textDomain),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          "aria-hidden": "true",
          children: isOpen ? '−' : '+'
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      id: contentId,
      ref: contentRef,
      className: `${classPrefix}-editor-block__content`,
      hidden: !isOpen,
      children: children
    })]
  });
}

/***/ },

/***/ "./blocks/hub-return-performance/src/edit.js"
/*!***************************************************!*\
  !*** ./blocks/hub-return-performance/src/edit.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _shared_EditorBlockShell__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../_shared/EditorBlockShell */ "./blocks/_shared/EditorBlockShell.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);





const cumPeriods = [{
  key: '1m',
  label: '1M'
}, {
  key: 'Ytd',
  label: 'YTD'
}, {
  key: '1y',
  label: '1Y'
}, {
  key: '3y',
  label: '3Y'
}, {
  key: '5y',
  label: '5Y'
}];
const legs = [{
  key: 'Nav',
  label: 'NAV'
}, {
  key: 'Price',
  label: 'Share price'
}, {
  key: 'Bench',
  label: 'Benchmark'
}];
const discYears = [1, 2, 3, 4, 5];
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '110px repeat(5, 1fr)',
  gap: '8px',
  alignItems: 'end',
  marginBottom: '12px'
};
const headerStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textAlign: 'right'
};
function NumField({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
    type: "number",
    step: "0.01",
    label: label,
    hideLabelFromVision: true,
    value: value ?? '',
    onChange: v => onChange('' === v ? '' : Number(v))
  });
}
function Edit({
  attributes,
  setAttributes,
  clientId
}) {
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.useBlockProps)({
    className: 'container hub-editor-block'
  });
  const set = name => value => setAttributes({
    [name]: value
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_shared_EditorBlockShell__WEBPACK_IMPORTED_MODULE_3__["default"], {
    blockProps: blockProps,
    clientId: clientId,
    classPrefix: "hub",
    textDomain: "hub-gsct2026",
    title: "HUB Return Performance",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
      label: "Chart title",
      value: attributes.chartTitle,
      onChange: set('chartTitle')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
      label: "Chart subtitle",
      value: attributes.chartSubtitle,
      onChange: set('chartSubtitle')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
      label: "Cumulative heading",
      value: attributes.cumHeading,
      onChange: set('cumHeading')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
      label: "Discrete heading",
      value: attributes.discHeading,
      onChange: set('discHeading')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("p", {
      className: "hub-editor-field__label",
      children: "Cumulative values (%)"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
      style: gridStyle,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {}), cumPeriods.map(p => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
        style: headerStyle,
        children: p.label
      }, p.key)), legs.map(leg => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          style: {
            fontSize: '0.75rem',
            fontWeight: 600
          },
          children: leg.label
        }), cumPeriods.map(p => {
          const name = `cum${leg.key}${p.key}`;
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(NumField, {
            label: `Cumulative ${leg.label} ${p.label}`,
            value: attributes[name],
            onChange: set(name)
          }, name);
        })]
      }, `cum-${leg.key}`))]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("p", {
      className: "hub-editor-field__label",
      children: "Discrete years (roll forward annually)"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
      style: gridStyle,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {}), discYears.map(n => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
        label: `Discrete year ${n}`,
        hideLabelFromVision: true,
        value: attributes[`year${n}`],
        onChange: set(`year${n}`)
      }, `year-${n}`)), legs.map(leg => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("span", {
          style: {
            fontSize: '0.75rem',
            fontWeight: 600
          },
          children: leg.label
        }), discYears.map(n => {
          const name = `disc${leg.key}${n}`;
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(NumField, {
            label: `Discrete ${leg.label} year ${n}`,
            value: attributes[name],
            onChange: set(name)
          }, name);
        })]
      }, `disc-${leg.key}`))]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextareaControl, {
      label: "Disclaimer",
      value: attributes.disclaimer,
      onChange: set('disclaimer')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("p", {
      className: "hub-editor-block__note",
      children: "The chart reads the cumulative values above \u2014 one source of truth, no separate chart data to keep in sync."
    })]
  });
}

/***/ },

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

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/compose"
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["compose"];

/***/ },

/***/ "@wordpress/data"
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "./blocks/hub-return-performance/block.json"
/*!**************************************************!*\
  !*** ./blocks/hub-return-performance/block.json ***!
  \**************************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"hub-gsct2026/hub-return-performance","title":"HUB Return Performance","category":"hub-gsct2026","icon":"chart-bar","description":"Historical return bar chart plus cumulative and discrete performance tables. All values hand-entered (fixed fields); the chart reads the cumulative values.","attributes":{"chartTitle":{"type":"string","default":"Historical return performance"},"chartSubtitle":{"type":"string","default":"Performance (%) as at 31.05.26"},"cumHeading":{"type":"string","default":"Cumulative performance as at 31.07.26 (%)"},"discHeading":{"type":"string","default":"Discrete annual performance as at 31.07.26 (%)"},"disclaimer":{"type":"string","default":"Past performance is not a guide to future performance. Source: Lipper and CT. Basis: Percentage growth, total return, bid to bid price with net income reinvested in sterling."},"cumNav1m":{"type":"number","default":-2.97},"cumNavYtd":{"type":"number","default":6.5},"cumNav1y":{"type":"number","default":9.24},"cumNav3y":{"type":"number","default":23.58},"cumNav5y":{"type":"number","default":18.82},"cumPrice1m":{"type":"number","default":-1.64},"cumPriceYtd":{"type":"number","default":8.36},"cumPrice1y":{"type":"number","default":16},"cumPrice3y":{"type":"number","default":36.7},"cumPrice5y":{"type":"number","default":28.43},"cumBench1m":{"type":"number","default":-4.3},"cumBenchYtd":{"type":"number","default":10.78},"cumBench1y":{"type":"number","default":18.77},"cumBench3y":{"type":"number","default":40.76},"cumBench5y":{"type":"number","default":40.15},"year1":{"type":"string","default":"2025/26"},"year2":{"type":"string","default":"2024/25"},"year3":{"type":"string","default":"2023/24"},"year4":{"type":"string","default":"2022/23"},"year5":{"type":"string","default":"2021/22"},"discNav1":{"type":"number","default":9.24},"discNav2":{"type":"number","default":-0.06},"discNav3":{"type":"number","default":13.19},"discNav4":{"type":"number","default":2.25},"discNav5":{"type":"number","default":-5.96},"discPrice1":{"type":"number","default":16},"discPrice2":{"type":"number","default":-1.14},"discPrice3":{"type":"number","default":19.2},"discPrice4":{"type":"number","default":1.42},"discPrice5":{"type":"number","default":-7.37},"discBench1":{"type":"number","default":18.77},"discBench2":{"type":"number","default":5.21},"discBench3":{"type":"number","default":12.64},"discBench4":{"type":"number","default":4.59},"discBench5":{"type":"number","default":-4.8}},"supports":{"anchor":true,"className":true,"align":true},"editorScript":"file:./build/index.js","render":"file:./render.php"}');

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
/*!****************************************************!*\
  !*** ./blocks/hub-return-performance/src/index.js ***!
  \****************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./blocks/hub-return-performance/src/edit.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../block.json */ "./blocks/hub-return-performance/block.json");



(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_2__.name, {
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  save: () => null
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map