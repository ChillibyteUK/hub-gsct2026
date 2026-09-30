import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { TextControl, Button } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const imageFields = [
	{ name: 'image1', label: __( 'Image 1', 'hub-gsct2026' ) },
	{ name: 'image2', label: __( 'Image 2', 'hub-gsct2026' ) },
	{ name: 'image3', label: __( 'Image 3 (Primary)', 'hub-gsct2026' ), help: __( 'The primary image.', 'hub-gsct2026' ) },
	{ name: 'image4', label: __( 'Image 4', 'hub-gsct2026' ) },
	{ name: 'image5', label: __( 'Image 5', 'hub-gsct2026' ) },
];

function ImageField( { attributes, setAttributes, name, label, help } ) {
	const id = attributes[ `${ name }Id` ];
	const url = attributes[ `${ name }Url` ];
	const alt = attributes[ `${ name }Alt` ];

	return (
		<div className="hub-editor-field">
			<label className="hub-editor-field__label">{ label }</label>
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ ( media ) =>
						setAttributes( {
							[ `${ name }Id` ]: media.id,
							[ `${ name }Url` ]: media.url,
							[ `${ name }Alt` ]: media.alt || '',
						} )
					}
					allowedTypes={ [ 'image' ] }
					value={ id }
					render={ ( { open } ) => (
						<div className="hub-editor-field__control">
							{ url && (
								<img
									src={ url }
									alt={ alt }
									style={ { maxWidth: '200px', display: 'block', marginBottom: '8px' } }
								/>
							) }
							<Button variant="secondary" onClick={ open }>
								{ url ? __( 'Replace image', 'hub-gsct2026' ) : __( 'Select image', 'hub-gsct2026' ) }
							</Button>
							{ help && <p className="hub-editor-field__help">{ help }</p> }
						</div>
					) }
				/>
			</MediaUploadCheck>
		</div>
	);
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Secondary Hero">
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			{ imageFields.map( ( field ) => (
				<ImageField
					key={ field.name }
					attributes={ attributes }
					setAttributes={ setAttributes }
					name={ field.name }
					label={ field.label }
					help={ field.help }
				/>
			) ) }
		</EditorBlockShell>
	);
}
