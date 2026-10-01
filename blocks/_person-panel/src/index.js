import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import {
	Button,
	CheckboxControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

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
	const postType = useSelect(
		( select ) => select( 'core/editor' ).getCurrentPostType(),
		[]
	);

	if ( 'person' !== postType ) {
		return null;
	}

	const [ meta, setMeta ] = useEntityProp( 'postType', 'person', 'meta' );
	const thumbnailId = meta?.author_thumbnail ?? 0;

	const thumbnailUrl = useSelect(
		( select ) =>
			thumbnailId
				? select( 'core' ).getMedia( thumbnailId )?.source_url
				: null,
		[ thumbnailId ]
	);

	return (
		<PluginDocumentSettingPanel
			name="hub-person-details"
			title={ __( 'Person Details', 'hub-gsct2026' ) }
		>
			<TextControl
				label={ __( 'Role', 'hub-gsct2026' ) }
				value={ meta?.role ?? '' }
				onChange={ ( value ) => setMeta( { ...meta, role: value } ) }
			/>
			<CheckboxControl
				label={ __( 'Show in People Cards', 'hub-gsct2026' ) }
				help={ __(
					'Unticked people (e.g. post authors who are not board members) are hidden from the People Cards block.',
					'hub-gsct2026'
				) }
				checked={ !! meta?.show_in_people_cards }
				onChange={ ( value ) =>
					setMeta( { ...meta, show_in_people_cards: value } )
				}
			/>
			<p
				className="hub-person-panel__label"
				style={ { marginBottom: '8px' } }
			>
				{ __( 'Author thumbnail', 'hub-gsct2026' ) }
			</p>
			{ !! thumbnailUrl && (
				<img
					src={ thumbnailUrl }
					alt=""
					style={ {
						display: 'block',
						maxWidth: '100%',
						height: 'auto',
						marginBottom: '8px',
					} }
				/>
			) }
			<div style={ { display: 'flex', gap: '8px' } }>
				<MediaUploadCheck>
					<MediaUpload
						onSelect={ ( media ) =>
							setMeta( {
								...meta,
								author_thumbnail: media.id,
							} )
						}
						allowedTypes={ [ 'image' ] }
						value={ thumbnailId }
						render={ ( { open } ) => (
							<Button variant="secondary" onClick={ open }>
								{ thumbnailId
									? __( 'Replace image', 'hub-gsct2026' )
									: __( 'Select image', 'hub-gsct2026' ) }
							</Button>
						) }
					/>
				</MediaUploadCheck>
				{ !! thumbnailId && (
					<Button
						variant="link"
						isDestructive
						onClick={ () =>
							setMeta( { ...meta, author_thumbnail: 0 } )
						}
					>
						{ __( 'Remove', 'hub-gsct2026' ) }
					</Button>
				) }
			</div>
			<TextareaControl
				label={ __( 'Author bio', 'hub-gsct2026' ) }
				help={ __(
					'Shown under single posts attributed to this person.',
					'hub-gsct2026'
				) }
				value={ meta?.author_bio ?? '' }
				onChange={ ( value ) =>
					setMeta( { ...meta, author_bio: value } )
				}
			/>
		</PluginDocumentSettingPanel>
	);
}

registerPlugin( 'hub-person-details', { render: PersonDetailsPanel } );
