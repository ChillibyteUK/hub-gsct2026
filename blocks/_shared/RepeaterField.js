import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck, RichText, URLInput } from '@wordpress/block-editor';
import { TextControl, TextareaControl, ToggleControl, Button, RadioControl } from '@wordpress/components';
import { useEffect, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import PostTypePicker from './PostTypePicker';

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
function toSafeRichTextHtml( value, multiline ) {
	const html = value || '';
	if ( html.includes( '<' ) ) {
		return html;
	}
	const withBreaks = html.replace( /\r\n|\r|\n/g, '<br>' );
	return multiline ? `<p>${ withBreaks }</p>` : `<span>${ withBreaks }</span>`;
}

/**
 * Short random id for a repeater row, stable for that row's lifetime once
 * assigned (kept as-is by updateRow's `{ ...next[index], ...patch }` spread,
 * since patch never includes `id`). Not cryptographic, doesn't need to be —
 * only needs to be unique among this one row's siblings, as a stable React
 * `key` (see the "why" comment further down, near the .map() call).
 */
function generateRowId() {
	return `row-${ Date.now().toString( 36 ) }-${ Math.random().toString( 36 ).slice( 2, 8 ) }`;
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
function RepeaterImageField( { field, row, index, updateRow, isColumn } ) {
	const id = row[ field.name ];
	const liveUrl = useSelect(
		( select ) => {
			if ( ! id ) {
				return '';
			}
			return select( coreStore ).getMedia( id )?.source_url || '';
		},
		[ id ]
	);
	const url = liveUrl || row[ `${ field.name }Url` ] || '';

	return (
		<MediaUploadCheck key={ field.name }>
			<MediaUpload
				onSelect={ ( media ) =>
					updateRow( index, {
						[ field.name ]: media.id,
						[ `${ field.name }Url` ]: media.url,
					} )
				}
				allowedTypes={ [ 'image' ] }
				value={ id }
				render={ ( { open } ) => (
					<div className="hub-repeater-field__image">
						<span className={ isColumn || field.labelPerRow ? 'hub-editor-field__label' : 'screen-reader-text' }>
							{ field.label }
						</span>
						{ url && (
							<img src={ url } alt="" />
						) }
						<Button variant="secondary" size="small" onClick={ open }>
							{ id
								? __( 'Replace', 'hub-gsct2026' )
								: __( 'Select', 'hub-gsct2026' ) }
						</Button>
					</div>
				) }
			/>
		</MediaUploadCheck>
	);
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
function renderRowField( field, row, index, updateRow, isColumn ) {
	if ( 'image' === field.type ) {
		return (
			<RepeaterImageField
				key={ field.name }
				field={ field }
				row={ row }
				index={ index }
				updateRow={ updateRow }
				isColumn={ isColumn }
			/>
		);
	}

	if ( 'link' === field.type ) {
		return (
			<div className="hub-repeater-field__link" key={ field.name }>
				<TextControl
					label={ __( `${ field.label } Title`, 'hub-gsct2026' ) }
					hideLabelFromVision={ ! isColumn && ! field.labelPerRow }
					value={ row[ `${ field.name }Text` ] || '' }
					onChange={ ( v ) => updateRow( index, { [ `${ field.name }Text` ]: v } ) }
				/>
				<span className={ isColumn || field.labelPerRow ? 'hub-editor-field__label' : 'screen-reader-text' }>
					{ __( `${ field.label } URL`, 'hub-gsct2026' ) }
				</span>
				<URLInput
					value={ row[ field.name ] || '' }
					onChange={ ( v ) => updateRow( index, { [ field.name ]: v } ) }
				/>
				{ field.help && <p className="hub-editor-field__help">{ field.help }</p> }
				{ field.linkTarget && (
					<ToggleControl
						label={ __( `Open ${ field.label } in a new tab`, 'hub-gsct2026' ) }
						checked={ !! row[ `${ field.name }Target` ] }
						onChange={ ( v ) => updateRow( index, { [ `${ field.name }Target` ]: v } ) }
					/>
				) }
			</div>
		);
	}

	if ( 'file' === field.type ) {
		return (
			<MediaUploadCheck key={ field.name }>
				<MediaUpload
					onSelect={ ( media ) =>
						updateRow( index, {
							[ field.name ]: media.id,
							[ `${ field.name }Name` ]: media.filename || media.title || '',
						} )
					}
					allowedTypes={ field.mimeTypes || [] }
					value={ row[ field.name ] }
					render={ ( { open } ) => (
						<div className="hub-repeater-field__image">
							<span className={ isColumn || field.labelPerRow ? 'hub-editor-field__label' : 'screen-reader-text' }>
								{ field.label }
							</span>
							{ row[ `${ field.name }Name` ] && (
								<span className="hub-repeater-field__file-name">
									{ row[ `${ field.name }Name` ] }
								</span>
							) }
							<Button variant="secondary" size="small" onClick={ open }>
								{ row[ field.name ]
									? __( 'Replace', 'hub-gsct2026' )
									: __( 'Select', 'hub-gsct2026' ) }
							</Button>
						</div>
					) }
				/>
			</MediaUploadCheck>
		);
	}

	if ( 'textarea' === field.type ) {
		return (
			<TextareaControl
				key={ field.name }
				label={ field.label }
				hideLabelFromVision={ ! isColumn && ! field.labelPerRow }
				value={ row[ field.name ] || '' }
				onChange={ ( v ) => updateRow( index, { [ field.name ]: v } ) }
				help={ field.help }
			/>
		);
	}

	if ( 'richtext' === field.type ) {
		return (
			<div className="hub-repeater-field__richtext" key={ field.name }>
							{ ( isColumn || field.labelPerRow ) && <span className="hub-editor-field__label">{ field.label }</span> }
				{ /* field.multiline: true for real multi-paragraph fields.
				    Leave unset/false for a single-line-with-<br> field —
				    matches a plain textarea's own "line breaks only, no
				    separate paragraphs" semantics, and multiline="p"
				    would wrongly turn a plain Enter into a new paragraph
				    instead. */ }
				<RichText
					identifier={ `${ row.id }-${ field.name }` }
					tagName="div"
					multiline={ field.multiline ? 'p' : undefined }
					className="hub-editor-field__control"
					aria-label={ field.label }
					placeholder={ field.label }
					value={ toSafeRichTextHtml( row[ field.name ], field.multiline ) }
					onChange={ ( v ) => updateRow( index, { [ field.name ]: v } ) }
				/>
				{ field.help && <p className="hub-editor-field__help">{ field.help }</p> }
			</div>
		);
	}

	if ( 'radio' === field.type ) {
		return (
			<RadioControl
				key={ field.name }
				className={ field.className }
				label={ field.label }
				hideLabelFromVision={ ! isColumn && ! field.labelPerRow }
				selected={ row[ field.name ] || '' }
				options={ field.options || [] }
				onChange={ ( v ) => updateRow( index, { [ field.name ]: v } ) }
			/>
		);
	}

	if ( 'number' === field.type ) {
		return (
			<TextControl
				key={ field.name }
				type="number"
				label={ field.label }
				hideLabelFromVision={ ! isColumn && ! field.labelPerRow }
				value={ row[ field.name ] ?? '' }
				onChange={ ( v ) => updateRow( index, { [ field.name ]: '' === v ? '' : Number( v ) } ) }
				help={ field.help }
			/>
		);
	}

	if ( 'post' === field.type ) {
		return (
			<PostTypePicker
				key={ field.name }
				label={ field.label }
				postType={ field.postType || 'page' }
				value={ row[ field.name ] || 0 }
				onChange={ ( id ) => updateRow( index, { [ field.name ]: id } ) }
				help={ field.help }
			/>
		);
	}

	return (
		<TextControl
			key={ field.name }
			label={ field.label }
			hideLabelFromVision={ ! isColumn && ! field.labelPerRow }
			value={ row[ field.name ] || '' }
			onChange={ ( v ) => updateRow( index, { [ field.name ]: v } ) }
			help={ field.help }
		/>
	);
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
 *                                  top-level `link` field type's `link_target` option. The URL
 *                                  half renders core's URLInput (type-ahead post/page search
 *                                  with manual-URL fallback), not a plain TextControl. `options`
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
export default function RepeaterField( { label, value, onChange, fields, emptyRow, layout = 'row' } ) {
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
	const displayRows = useMemo( () => rows.map( ( row ) => ( row.id ? row : { ...row, id: generateRowId() } ) ), [ rows ] );

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
	useEffect( () => {
		if ( rows.some( ( row ) => ! row.id ) ) {
			onChange( displayRows );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ rows ] );

	function updateRow( index, patch ) {
		const next = rows.slice();
		next[ index ] = { ...next[ index ], ...patch };
		onChange( next );
	}

	function addRow() {
		onChange( [ ...rows, { ...emptyRow, id: generateRowId() } ] );
	}

	function removeRow( index ) {
		// eslint-disable-next-line no-alert -- a plain confirm() is enough
		// friction for an irreversible remove; no undo exists for this field.
		if ( ! window.confirm( __( 'Remove this row?', 'hub-gsct2026' ) ) ) {
			return;
		}
		onChange( rows.filter( ( _row, i ) => i !== index ) );
	}

	function moveRow( index, direction ) {
		const target = index + direction;
		if ( target < 0 || target >= rows.length ) {
			return;
		}
		const next = rows.slice();
		const tmp = next[ index ];
		next[ index ] = next[ target ];
		next[ target ] = tmp;
		onChange( next );
	}

	function fieldVisible( field, row ) {
		if ( ! field.showIf ) {
			return true;
		}

		return ( row[ field.showIf.field ] ?? '' ) === field.showIf.value;
	}

	// Fields labelling themselves per row (field.labelPerRow) stay out of
	// the shared column header — and if every field does that, the header
	// would be two spacers and nothing, so it doesn't render at all.
	const headerFields = fields.filter(
		( field ) => ! field.labelPerRow && ( ! field.showIf || rows.some( ( row ) => fieldVisible( field, row ) ) )
	);

	return (
		<div
			className={
				isColumn
					? 'hub-repeater-field hub-repeater-field--column'
					: 'hub-repeater-field'
			}
		>
			<label className="hub-editor-field__label">{ label }</label>
			{ ! isColumn && rows.length > 0 && headerFields.length > 0 && (
				<div className="hub-repeater-field__header">
					<span className="hub-repeater-field__number-spacer" />
					{ headerFields.map( ( field ) => (
						(
						<span
							key={ field.name }
							className={
								'image' === field.type || 'file' === field.type
									? 'hub-repeater-field__header-cell hub-repeater-field__header-cell--image'
									: 'hub-repeater-field__header-cell'
							}
							style={ field.flex ? { flex: field.flex } : undefined }
						>
							{ field.label }
						</span>
						)
					) ) }
					<span className="hub-repeater-field__row-actions-spacer" />
				</div>
			) }
			<div className="hub-repeater-field__rows">
			{ /* key is row.id, not index: on a move/reorder the array positions
			    swap but the row *objects* (and their ids) travel with the
			    move, so a stable id-based key correctly follows each row's
			    actual identity through that swap. An index-based key instead
			    tells React "the thing at position 2 is still the same
			    component," even though its data just changed underneath it —
			    harmless for plain controlled inputs, but RichText owns real
			    browser selection/cursor state inside its own DOM node, and
			    reusing that node across what's actually a different row is
			    exactly what caused shift+arrow selection to behave oddly
			    across a reorder. Iterating displayRows (not rows) is what
			    guarantees that id is there from this very first render — see
			    the useMemo above. */ }
			{ displayRows.map( ( row, index ) => (
				<div className="hub-repeater-field__row" key={ row.id }>
					<span className="hub-repeater-field__number">{ index + 1 }</span>
					{ fields.map( ( field ) => {
						if ( ! fieldVisible( field, row ) ) {
							return null;
						}

						const node = renderRowField( field, row, index, updateRow, isColumn );

						// Opt-in per-field flex (field.flex, row layout only) wraps
						// the control in a flex cell so it can take a non-equal
						// width — the shared header cell above gets the same
						// value, so columns stay aligned. Fields without it
						// render exactly as before.
						if ( field.flex && ! isColumn ) {
							return (
								<div key={ field.name } className="hub-repeater-field__cell" style={ { flex: field.flex } }>
									{ node }
								</div>
							);
						}

						return node;
					} ) }
					<div className="hub-repeater-field__row-actions">
						<Button
							size="small"
							label={ __( 'Move up', 'hub-gsct2026' ) }
							onClick={ () => moveRow( index, -1 ) }
							disabled={ 0 === index }
						>
							&#9650;
						</Button>
						<Button
							size="small"
							label={ __( 'Move down', 'hub-gsct2026' ) }
							onClick={ () => moveRow( index, 1 ) }
							disabled={ index === rows.length - 1 }
						>
							&#9660;
						</Button>
						<Button
							size="small"
							isDestructive
							label={ __( 'Remove', 'hub-gsct2026' ) }
							onClick={ () => removeRow( index ) }
						>
							&times;
						</Button>
					</div>
				</div>
			) ) }
			</div>
			<Button variant="primary" onClick={ addRow }>
				{ __( 'Add row', 'hub-gsct2026' ) }
			</Button>
		</div>
	);
}
