import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, MediaUploadCheck, URLInput } from '@wordpress/block-editor';
import { TextControl, TextareaControl, RadioControl, Button } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		backgroundChoice,
		eyebrow,
		title,
		content,
		primaryCtaText,
		primaryCtaUrl,
		secondaryCtaText,
		secondaryCtaUrl,
		imageId,
		imageUrl,
		imageAlt,
	} = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Gradient Hero">
			<RadioControl
				label={ __( 'Background', 'hub-gsct2026' ) }
				className="hub-radio-horizontal"
				selected={ backgroundChoice }
				options={ [
					{ label: __( 'Sunrise', 'hub-gsct2026' ), value: 'sunrise' },
					{ label: __( 'Sunset', 'hub-gsct2026' ), value: 'sunset' },
				] }
				onChange={ ( value ) => setAttributes( { backgroundChoice: value } ) }
			/>
			<TextControl
				label={ __( 'Eyebrow', 'hub-gsct2026' ) }
				value={ eyebrow }
				onChange={ ( value ) => setAttributes( { eyebrow: value } ) }
			/>
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<TextareaControl
				label={ __( 'Content', 'hub-gsct2026' ) }
				value={ content }
				onChange={ ( value ) => setAttributes( { content: value } ) }
			/>
			<div className="hub-fields-50-50">
				<TextControl
					label={ __( 'Primary CTA text', 'hub-gsct2026' ) }
					value={ primaryCtaText }
					onChange={ ( value ) => setAttributes( { primaryCtaText: value } ) }
				/>
				<div className="hub-editor-field">
					<label className="hub-editor-field__label">{ __( 'Primary CTA URL', 'hub-gsct2026' ) }</label>
					<URLInput
						value={ primaryCtaUrl || '' }
						onChange={ ( value ) => setAttributes( { primaryCtaUrl: value } ) }
					/>
				</div>
			</div>
			<div className="hub-fields-50-50">
				<TextControl
					label={ __( 'Secondary CTA text', 'hub-gsct2026' ) }
					value={ secondaryCtaText }
					onChange={ ( value ) => setAttributes( { secondaryCtaText: value } ) }
				/>
				<div className="hub-editor-field">
					<label className="hub-editor-field__label">{ __( 'Secondary CTA URL', 'hub-gsct2026' ) }</label>
					<URLInput
						value={ secondaryCtaUrl || '' }
						onChange={ ( value ) => setAttributes( { secondaryCtaUrl: value } ) }
					/>
				</div>
			</div>
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
								{ !! imageUrl && (
									<img
										src={ imageUrl }
										alt={ imageAlt }
										style={ { maxWidth: '200px', display: 'block', marginBottom: '8px', borderRadius: '50%' } }
									/>
								) }
								<Button variant="secondary" onClick={ open }>
									{ imageUrl ? __( 'Replace image', 'hub-gsct2026' ) : __( 'Select image', 'hub-gsct2026' ) }
								</Button>
							</div>
						) }
					/>
				</MediaUploadCheck>
			</div>
		</EditorBlockShell>
	);
}
