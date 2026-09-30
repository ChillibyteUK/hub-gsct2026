import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

/**
 * "Person Details" document sidebar panel — the editing UI for the
 * person post meta registered in inc/posttypes.php (role, ...). Meta with
 * show_in_rest never renders its own field anywhere, so without this the
 * values are write-only data; this is that UI. Scoped to the person post
 * type (returns null everywhere else) and enqueued globally like the lede
 * format (see inc/editor.php) — same reason: editor-wide utilities, not
 * per-block code.
 */
function PersonDetailsPanel() {
	const postType = useSelect(
		( select ) => select( 'core/editor' ).getCurrentPostType(),
		[]
	);

	if ( 'person' !== postType ) {
		return null;
	}

	const [ meta, setMeta ] = useEntityProp( 'postType', 'person', 'meta' );

	return (
		<PluginDocumentSettingPanel name="hub-person-details" title={ __( 'Person Details', 'hub-gsct2026' ) }>
			<TextControl
				label={ __( 'Role', 'hub-gsct2026' ) }
				value={ meta?.role ?? '' }
				onChange={ ( value ) => setMeta( { ...meta, role: value } ) }
			/>
		</PluginDocumentSettingPanel>
	);
}

registerPlugin( 'hub-person-details', { render: PersonDetailsPanel } );
