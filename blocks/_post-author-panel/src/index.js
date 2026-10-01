import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { RadioControl, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

/**
 * "Post Author" document sidebar panel — picks the single person post
 * attributed as this post's author (post meta author_person_id, registered
 * in inc/posttypes.php, 0 = none). Scoped to regular posts; returns null
 * everywhere else. Enqueued globally (see inc/editor.php) like the Person
 * Details panel — editor-wide utility, not per-block code.
 */
function PostAuthorPanel() {
	const postType = useSelect(
		( select ) => select( 'core/editor' ).getCurrentPostType(),
		[]
	);

	if ( 'post' !== postType ) {
		return null;
	}

	const [ meta, setMeta ] = useEntityProp( 'postType', 'post', 'meta' );

	const query = {
		per_page: 100,
		orderby: 'title',
		order: 'asc',
		_fields: 'id,title',
	};

	const people = useSelect(
		( select ) =>
			select( 'core' ).getEntityRecords( 'postType', 'person', query ),
		[]
	);

	const options = [
		{ label: __( 'None', 'hub-gsct2026' ), value: '0' },
		...( people ?? [] ).map( ( person ) => ( {
			label: person.title?.rendered ?? `#${ person.id }`,
			value: String( person.id ),
		} ) ),
	];

	return (
		<PluginDocumentSettingPanel
			name="hub-post-author"
			title={ __( 'Post Author', 'hub-gsct2026' ) }
		>
			{ null === people && <Spinner /> }
			{ null !== people && (
				<RadioControl
					label={ __( 'Author (person post)', 'hub-gsct2026' ) }
					selected={ String( meta?.author_person_id ?? 0 ) }
					options={ options }
					onChange={ ( value ) =>
						setMeta( {
							...meta,
							author_person_id: parseInt( value, 10 ) || 0,
						} )
					}
				/>
			) }
		</PluginDocumentSettingPanel>
	);
}

registerPlugin( 'hub-post-author', { render: PostAuthorPanel } );
