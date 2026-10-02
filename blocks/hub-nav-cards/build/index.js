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

/***/ "./blocks/_shared/PostTypePicker.js"
/*!******************************************!*\
  !*** ./blocks/_shared/PostTypePicker.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PostTypePicker)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/html-entities */ "@wordpress/html-entities");
/* harmony import */ var _wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);






/**
 * Generic single-post picker for a block attribute holding one post ID —
 * the block-editor equivalent of ACF's `post_object` field (single,
 * `return_format: object`). Search-as-you-type via ComboboxControl, backed
 * by @wordpress/core-data rather than a custom REST call.
 *
 * @param {Object}   props
 * @param {string}   props.label    Field label.
 * @param {string}   props.postType Post type slug to search (e.g. 'product').
 * @param {number}   props.value    Currently selected post ID, or 0/undefined for none.
 * @param {Function} props.onChange ( id: number ) => void — 0 clears the selection.
 * @param {string}   [props.help]   Optional help text.
 */

function PostTypePicker({
  label,
  postType,
  value,
  onChange,
  help
}) {
  const [search, setSearch] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const searchResults = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__.store).getEntityRecords('postType', postType, {
    search,
    status: 'publish',
    orderby: 'title',
    order: 'asc',
    per_page: 20
  }), [postType, search]);

  // The currently selected post may not be among the current search
  // results (e.g. right after the block loads) — resolve it separately so
  // it always has a matching option and doesn't show as blank.
  const selectedPost = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => value ? select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__.store).getEntityRecord('postType', postType, value) : null, [postType, value]);
  const options = [];
  if (selectedPost && !(searchResults || []).some(post => post.id === selectedPost.id)) {
    options.push({
      value: selectedPost.id,
      label: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__.decodeEntities)(selectedPost.title?.rendered || '') || `#${selectedPost.id}`
    });
  }
  (searchResults || []).forEach(post => {
    options.push({
      value: post.id,
      label: (0,_wordpress_html_entities__WEBPACK_IMPORTED_MODULE_4__.decodeEntities)(post.title?.rendered || '') || `#${post.id}`
    });
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ComboboxControl, {
    label: label,
    value: value || null,
    options: options,
    onFilterValueChange: input => setSearch(input),
    onChange: id => onChange(id ? Number(id) : 0),
    help: help
  });
}

/***/ },

/***/ "./blocks/_shared/RepeaterField.js"
/*!*****************************************!*\
  !*** ./blocks/_shared/RepeaterField.js ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RepeaterField)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _PostTypePicker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./PostTypePicker */ "./blocks/_shared/PostTypePicker.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);








/**
 * Makes a legacy plain-text value safe to hand to RichText. RichText's
 * editable content silently fails to render at all when given a value with
 * no wrapping HTML tag whatsoever (isolated down to a single-row,
 * single-character repro — "a" renders nothing, "<p>a</p>" renders fine).
 * Rows saved before a field was RichText (plain textarea content, no markup
 * at all — some with literal `\n` line breaks from a plain textarea) hit
 * this on every read until they're re-saved through RichText's own
 * onChange, which always produces real markup — so this exists
 * specifically to bridge that one legacy moment, not as an ongoing
 * safeguard. Literal newlines become <br> first (matching a plain
 * textarea's own line-break-only semantics).
 *
 * The wrapping tag itself must match the field's own `multiline` mode: a
 * non-multiline field gets a plain inline `<span>` wrapper, since a `<p>`
 * wrapper would force multiline-style paragraph behaviour on it (reproduced
 * as visible content corruption — text typed immediately after mount
 * splitting mid-word onto a new line). Multiline fields keep `<p>`, since
 * multiline="p" mode genuinely expects `<p>` children.
 */

function toSafeRichTextHtml(value, multiline) {
  const html = value || '';
  if (html.includes('<')) {
    return html;
  }
  const withBreaks = html.replace(/\r\n|\r|\n/g, '<br>');
  return multiline ? `<p>${withBreaks}</p>` : `<span>${withBreaks}</span>`;
}

/**
 * Short random id for a repeater row, stable for that row's lifetime once
 * assigned (kept as-is by updateRow's `{ ...next[index], ...patch }` spread,
 * since patch never includes `id`). Not cryptographic, doesn't need to be —
 * only needs to be unique among this one row's siblings, as a stable React
 * `key` (see the "why" comment further down, near the .map() call).
 */
function generateRowId() {
  return `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * A repeater row's own image field, as a real component rather than
 * inlined into the big fields.map() below — needed so it can call its own
 * useSelect() per row/field to derive the preview URL live from the
 * attachment id, instead of trusting a `{field}Url` value stored only at
 * the moment of selection. A row backfilled from existing data, or any path
 * that doesn't go through onSelect, leaves that stored Url empty forever
 * even though the id itself is genuinely valid — showing as a blank preview
 * with a working "Replace" button, easy to mistake for "this row has no
 * image" when it does. The stored Url is still written on select and kept
 * as a fallback for the reverse case (a Url with no id to look up).
 */
function RepeaterImageField({
  field,
  row,
  index,
  updateRow,
  isColumn
}) {
  const id = row[field.name];
  const liveUrl = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_4__.useSelect)(select => {
    if (!id) {
      return '';
    }
    return select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_5__.store).getMedia(id)?.source_url || '';
  }, [id]);
  const url = liveUrl || row[`${field.name}Url`] || '';
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUploadCheck, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUpload, {
      onSelect: media => updateRow(index, {
        [field.name]: media.id,
        [`${field.name}Url`]: media.url
      }),
      allowedTypes: ['image'],
      value: id,
      render: ({
        open
      }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "hub-repeater-field__image",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
          className: isColumn || field.labelPerRow ? 'hub-editor-field__label' : 'screen-reader-text',
          children: field.label
        }), url && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("img", {
          src: url,
          alt: ""
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          variant: "secondary",
          size: "small",
          onClick: open,
          children: id ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace', 'hub-gsct2026') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select', 'hub-gsct2026')
        })]
      })
    })
  }, field.name);
}

/**
 * Renders one sub-field control for a repeater row. The per-type chain used
 * to live inline in RepeaterField's fields.map() below, but an opt-in
 * non-equal field width (`field.flex`) needs the control wrapped in a flex
 * cell — cleaner around a named helper's single return than threaded
 * through every branch of the chain in place.
 *
 * @param {Object}   field      Field config ({ name, label, type, ... }).
 * @param {Object}   row        Current row object.
 * @param {number}   index      Row index (for updateRow).
 * @param {Function} updateRow  ( index, patch ) => void.
 * @param {boolean}  isColumn   Column-layout flag (label visibility).
 * @return {*} Single field control element (keyed by field.name).
 */
function renderRowField(field, row, index, updateRow, isColumn) {
  if ('image' === field.type) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(RepeaterImageField, {
      field: field,
      row: row,
      index: index,
      updateRow: updateRow,
      isColumn: isColumn
    }, field.name);
  }
  if ('link' === field.type) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "hub-repeater-field__link",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)(`${field.label} Title`, 'hub-gsct2026'),
        hideLabelFromVision: !isColumn && !field.labelPerRow,
        value: row[`${field.name}Text`] || '',
        onChange: v => updateRow(index, {
          [`${field.name}Text`]: v
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
        type: "url",
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)(`${field.label} URL`, 'hub-gsct2026'),
        hideLabelFromVision: !isColumn && !field.labelPerRow,
        value: row[field.name] || '',
        onChange: v => updateRow(index, {
          [field.name]: v
        }),
        help: field.help
      }), field.linkTarget && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)(`Open ${field.label} in a new tab`, 'hub-gsct2026'),
        checked: !!row[`${field.name}Target`],
        onChange: v => updateRow(index, {
          [`${field.name}Target`]: v
        })
      })]
    }, field.name);
  }
  if ('file' === field.type) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUploadCheck, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUpload, {
        onSelect: media => updateRow(index, {
          [field.name]: media.id,
          [`${field.name}Name`]: media.filename || media.title || ''
        }),
        allowedTypes: field.mimeTypes || [],
        value: row[field.name],
        render: ({
          open
        }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
          className: "hub-repeater-field__image",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
            className: isColumn || field.labelPerRow ? 'hub-editor-field__label' : 'screen-reader-text',
            children: field.label
          }), row[`${field.name}Name`] && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
            className: "hub-repeater-field__file-name",
            children: row[`${field.name}Name`]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            variant: "secondary",
            size: "small",
            onClick: open,
            children: row[field.name] ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace', 'hub-gsct2026') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Select', 'hub-gsct2026')
          })]
        })
      })
    }, field.name);
  }
  if ('textarea' === field.type) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextareaControl, {
      label: field.label,
      hideLabelFromVision: !isColumn && !field.labelPerRow,
      value: row[field.name] || '',
      onChange: v => updateRow(index, {
        [field.name]: v
      }),
      help: field.help
    }, field.name);
  }
  if ('richtext' === field.type) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "hub-repeater-field__richtext",
      children: [(isColumn || field.labelPerRow) && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
        className: "hub-editor-field__label",
        children: field.label
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.RichText, {
        identifier: `${row.id}-${field.name}`,
        tagName: "div",
        multiline: field.multiline ? 'p' : undefined,
        className: "hub-editor-field__control",
        "aria-label": field.label,
        placeholder: field.label,
        value: toSafeRichTextHtml(row[field.name], field.multiline),
        onChange: v => updateRow(index, {
          [field.name]: v
        })
      }), field.help && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
        className: "hub-editor-field__help",
        children: field.help
      })]
    }, field.name);
  }
  if ('radio' === field.type) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RadioControl, {
      className: field.className,
      label: field.label,
      hideLabelFromVision: !isColumn && !field.labelPerRow,
      selected: row[field.name] || '',
      options: field.options || [],
      onChange: v => updateRow(index, {
        [field.name]: v
      })
    }, field.name);
  }
  if ('number' === field.type) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
      type: "number",
      label: field.label,
      hideLabelFromVision: !isColumn && !field.labelPerRow,
      value: row[field.name] ?? '',
      onChange: v => updateRow(index, {
        [field.name]: '' === v ? '' : Number(v)
      }),
      help: field.help
    }, field.name);
  }
  if ('post' === field.type) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_PostTypePicker__WEBPACK_IMPORTED_MODULE_6__["default"], {
      label: field.label,
      postType: field.postType || 'page',
      value: row[field.name] || 0,
      onChange: id => updateRow(index, {
        [field.name]: id
      }),
      help: field.help
    }, field.name);
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
    label: field.label,
    hideLabelFromVision: !isColumn && !field.labelPerRow,
    value: row[field.name] || '',
    onChange: v => updateRow(index, {
      [field.name]: v
    }),
    help: field.help
  }, field.name);
}

/**
 * Generic repeater UI for a block attribute holding an array of row objects.
 * The block-editor equivalent of the `repeater` field type in
 * inc/options.php — same sub-field vocabulary (text/textarea/image), separate
 * implementation since one runs in wp-admin and the other inside the block
 * editor's React tree.
 *
 * Rows lay out inline by default (`layout: 'row'`): each sub-field takes an
 * equal-width slot, with compact move-up/move-down/remove icon buttons at
 * the row's end. Sub-field labels render once, as column headers above the
 * rows, rather than repeating per row — `hideLabelFromVision` keeps them
 * screen-reader accessible on each control without rendering visually
 * twice.
 *
 * `layout: 'column'` stacks each row's sub-fields vertically instead —
 * there's no shared column header in that layout (it wouldn't line up with
 * anything), so each sub-field's own label renders visibly above its
 * control instead of being screen-reader-only.
 *
 * @param {Object}   props
 * @param {string}   props.label    Field group label.
 * @param {Object[]} props.value    Current rows.
 * @param {Function} props.onChange ( rows ) => void
 * @param {Object[]} props.fields   [ { name, label, type: 'text'|'number'|'textarea'|'richtext'|'image'|'file'|'link'|'radio'|'post', help, mimeTypes, linkTarget, options, className, showIf, multiline, postType, flex } ]
 *                                  `flex` (row layout only) overrides a field's flex shorthand —
 *                                  e.g. a full-width title above two half-width fields is
 *                                  `{ flex: '1 1 100%' }` on the title with the row wrapping
 *                                  (see the flex-wrap rules in src/css/editor.css). The shared
 *                                  header cell gets the same value so columns stay aligned.
 *                                  Unset fields keep the default equal slot.
 *                                  `postType` ('post' fields only) is the post type slug to search
 *                                  (default 'page') — renders ./PostTypePicker, storing the selected
 *                                  post's ID directly on `field.name` (no separate `{name}Url`-style
 *                                  companion key, unlike image/file).
 *                                  `linkTarget` (link fields only) adds an "open in new tab" toggle,
 *                                  storing `{name}Target` on the row — same opt-in shape as the
 *                                  top-level `link` field type's `link_target` option. `options`
 *                                  (radio fields only) is `[ { label, value } ]`, mirroring the
 *                                  top-level `select`/`radio` field types' options shape.
 *                                  `className` (radio fields only) lands on the RadioControl's
 *                                  fieldset — e.g. 'hub-radio-horizontal' for a Yes/No row
 *                                  instead of the default stacked options.
 *                                  `showIf: { field, value }` hides the field unless that row's
 *                                  `field` equals `value` — e.g. popover detail fields that
 *                                  only apply when a 'popover' radio is set. In `row` layout
 *                                  the shared column header keeps a cell while any row
 *                                  shows the field. `labelPerRow` renders the field's own
 *                                  label visibly above its control in every row (like
 *                                  `column` layout does) instead of hiding it behind the
 *                                  shared header — and drops the field from that header;
 *                                  if every field opts in, the header doesn't render at
 *                                  all. `multiline` (richtext fields only)
 *                                  turns on real multi-paragraph editing (RichText's
 *                                  `multiline="p"`); leave it unset for a field that's
 *                                  just single-line-with-line-breaks, e.g. a title.
 * @param {Object}   props.emptyRow Shape of a freshly-added row, e.g. { stat: '', title: '' }.
 * @param {string}   [props.layout] 'row' (default) or 'column'.
 */
function RepeaterField({
  label,
  value,
  onChange,
  fields,
  emptyRow,
  layout = 'row'
}) {
  const isColumn = 'column' === layout;
  const rows = value || [];

  // Rows saved before this `id` field existed (or any other future
  // producer of rows without one) need an id from their very first render,
  // not just eventually: a useEffect-only backfill (running after that
  // first paint) still lets every id-less row mount once sharing the same
  // "no id" identity, and confirmed live, that's enough for a RichText
  // field's internal state to only ever end up correctly wired for the
  // first of them — every other row's RichText silently renders empty,
  // permanently, even after the effect assigns real ids on the next
  // render. useMemo computes real-enough ids synchronously, before
  // anything downstream ever mounts.
  const displayRows = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useMemo)(() => rows.map(row => row.id ? row : {
    ...row,
    id: generateRowId()
  }), [rows]);

  // Persists those ids back into the actual attribute once React commits,
  // so they're stable across reloads/reorders instead of regenerating
  // every render — moveRow/removeRow/updateRow below still key off array
  // index, not id, so this is purely about giving each row a durable
  // identity, not something anything else depends on to function.
  //
  // Dep is [ rows ], not [ rows.length ] as upstream: until ids persist,
  // every edit re-maps new random ids (remounting rows and dropping
  // focus), and a length-only dep never fires for text edits — so legacy
  // rows would stay unstable until a row is added or removed. Guarded by
  // the .some() check, so the steady state (all rows identified) is a
  // no-op, not a loop.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (rows.some(row => !row.id)) {
      onChange(displayRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);
  function updateRow(index, patch) {
    const next = rows.slice();
    next[index] = {
      ...next[index],
      ...patch
    };
    onChange(next);
  }
  function addRow() {
    onChange([...rows, {
      ...emptyRow,
      id: generateRowId()
    }]);
  }
  function removeRow(index) {
    // eslint-disable-next-line no-alert -- a plain confirm() is enough
    // friction for an irreversible remove; no undo exists for this field.
    if (!window.confirm((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remove this row?', 'hub-gsct2026'))) {
      return;
    }
    onChange(rows.filter((_row, i) => i !== index));
  }
  function moveRow(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) {
      return;
    }
    const next = rows.slice();
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    onChange(next);
  }
  function fieldVisible(field, row) {
    if (!field.showIf) {
      return true;
    }
    return (row[field.showIf.field] ?? '') === field.showIf.value;
  }

  // Fields labelling themselves per row (field.labelPerRow) stay out of
  // the shared column header — and if every field does that, the header
  // would be two spacers and nothing, so it doesn't render at all.
  const headerFields = fields.filter(field => !field.labelPerRow && (!field.showIf || rows.some(row => fieldVisible(field, row))));
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    className: isColumn ? 'hub-repeater-field hub-repeater-field--column' : 'hub-repeater-field',
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("label", {
      className: "hub-editor-field__label",
      children: label
    }), !isColumn && rows.length > 0 && headerFields.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "hub-repeater-field__header",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
        className: "hub-repeater-field__number-spacer"
      }), headerFields.map(field => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
        className: 'image' === field.type || 'file' === field.type ? 'hub-repeater-field__header-cell hub-repeater-field__header-cell--image' : 'hub-repeater-field__header-cell',
        style: field.flex ? {
          flex: field.flex
        } : undefined,
        children: field.label
      }, field.name)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
        className: "hub-repeater-field__row-actions-spacer"
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
      className: "hub-repeater-field__rows",
      children: displayRows.map((row, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
        className: "hub-repeater-field__row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
          className: "hub-repeater-field__number",
          children: index + 1
        }), fields.map(field => {
          if (!fieldVisible(field, row)) {
            return null;
          }
          const node = renderRowField(field, row, index, updateRow, isColumn);

          // Opt-in per-field flex (field.flex, row layout only) wraps
          // the control in a flex cell so it can take a non-equal
          // width — the shared header cell above gets the same
          // value, so columns stay aligned. Fields without it
          // render exactly as before.
          if (field.flex && !isColumn) {
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
              className: "hub-repeater-field__cell",
              style: {
                flex: field.flex
              },
              children: node
            }, field.name);
          }
          return node;
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
          className: "hub-repeater-field__row-actions",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            size: "small",
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Move up', 'hub-gsct2026'),
            onClick: () => moveRow(index, -1),
            disabled: 0 === index,
            children: "\u25B2"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            size: "small",
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Move down', 'hub-gsct2026'),
            onClick: () => moveRow(index, 1),
            disabled: index === rows.length - 1,
            children: "\u25BC"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            size: "small",
            isDestructive: true,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Remove', 'hub-gsct2026'),
            onClick: () => removeRow(index),
            children: "\xD7"
          })]
        })]
      }, row.id))
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
      variant: "primary",
      onClick: addRow,
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Add row', 'hub-gsct2026')
    })]
  });
}

/***/ },

/***/ "./blocks/hub-nav-cards/src/edit.js"
/*!******************************************!*\
  !*** ./blocks/hub-nav-cards/src/edit.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _shared_RepeaterField__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../_shared/RepeaterField */ "./blocks/_shared/RepeaterField.js");
/* harmony import */ var _shared_EditorBlockShell__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../_shared/EditorBlockShell */ "./blocks/_shared/EditorBlockShell.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);






const cardsFields = [{
  name: 'title',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Title', 'hub-gsct2026'),
  type: 'text'
}, {
  name: 'content',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Content', 'hub-gsct2026'),
  type: 'textarea'
}, {
  name: 'linkUrl',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Link URL', 'hub-gsct2026'),
  type: 'text'
}];
const cardsEmptyRow = {
  title: '',
  content: '',
  linkUrl: ''
};
function Edit({
  attributes,
  setAttributes,
  clientId
}) {
  const {
    title,
    cards
  } = attributes;
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    className: 'container hub-editor-block'
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_shared_EditorBlockShell__WEBPACK_IMPORTED_MODULE_4__["default"], {
    blockProps: blockProps,
    clientId: clientId,
    classPrefix: "hub",
    textDomain: "hub-gsct2026",
    title: "HUB Nav Cards",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Title', 'hub-gsct2026'),
      value: title,
      onChange: value => setAttributes({
        title: value
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_shared_RepeaterField__WEBPACK_IMPORTED_MODULE_3__["default"], {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cards', 'hub-gsct2026'),
      value: cards,
      onChange: value => setAttributes({
        cards: value
      }),
      fields: cardsFields,
      emptyRow: cardsEmptyRow,
      layout: "column"
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

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/html-entities"
/*!**************************************!*\
  !*** external ["wp","htmlEntities"] ***!
  \**************************************/
(module) {

module.exports = window["wp"]["htmlEntities"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "./blocks/hub-nav-cards/block.json"
/*!*****************************************!*\
  !*** ./blocks/hub-nav-cards/block.json ***!
  \*****************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"hub-gsct2026/hub-nav-cards","title":"HUB Nav Cards","category":"hub-gsct2026","icon":"index-card","description":"Title and three link cards on the sunset gradient background.","attributes":{"title":{"type":"string","default":""},"cards":{"type":"array","default":[]}},"supports":{"anchor":true,"className":true,"align":true},"editorScript":"file:./build/index.js","render":"file:./render.php"}');

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
  !*** ./blocks/hub-nav-cards/src/index.js ***!
  \*******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./blocks/hub-nav-cards/src/edit.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../block.json */ "./blocks/hub-nav-cards/block.json");



(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_2__.name, {
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  save: () => null
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map