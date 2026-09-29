import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { TextControl, TextareaControl, Button, PanelBody, FocalPointPicker } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { quote, attribution, imageId, imageUrl, imageAlt, focalPoint } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<>
			{ /* Same FocalPointPicker pattern as primary-hero: it lives in
			   InspectorControls (outside the iframed canvas) so the drag
			   position and cursor can't drift apart. */ }
			<InspectorControls>
				<PanelBody title={ __( 'Image focal point', 'hub-gsct2026' ) }>
					<FocalPointPicker
						url={ imageUrl }
						value={ focalPoint }
						onChange={ ( value ) => setAttributes( { focalPoint: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Pullquote">
			<TextareaControl
				label={ __( 'Quote', 'hub-gsct2026' ) }
				value={ quote }
				onChange={ ( value ) => setAttributes( { quote: value } ) }
			/>
			<TextControl
				label={ __( 'Attribution', 'hub-gsct2026' ) }
				value={ attribution }
				onChange={ ( value ) => setAttributes( { attribution: value } ) }
			/>
			<div className="hub-editor-field">
				<label className="hub-editor-field__label">{ __( 'Image', 'hub-gsct2026' ) }</label>
				<MediaUploadCheck>
					<MediaUpload
						onSelect={ ( media ) =>
							setAttributes( {
								imageId: media.id,
								imageUrl: media.url,
								imageAlt: media.alt || '',
							} )
						}
						allowedTypes={ [ 'image' ] }
						value={ imageId }
						render={ ( { open } ) => (
							<div className="hub-editor-field__control">
								{ imageUrl && (
									<img
										src={ imageUrl }
										alt={ imageAlt }
										style={ { maxWidth: '200px', display: 'block', marginBottom: '8px' } }
									/>
								) }
								<Button variant="secondary" onClick={ open }>
									{ imageUrl ? __( 'Replace Image', 'hub-gsct2026' ) : __( 'Select Image', 'hub-gsct2026' ) }
								</Button>
							</div>
						) }
					/>
				</MediaUploadCheck>
			</div>
		</EditorBlockShell>
		</>
	);
}
