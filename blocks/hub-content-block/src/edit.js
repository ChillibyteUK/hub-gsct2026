import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, MediaUploadCheck, RichText } from '@wordpress/block-editor';
import { TextControl, RadioControl, SelectControl, ToggleControl, TextareaControl, Button } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const listFields = [
	{ name: 'title', label: __( 'Title', 'hub-gsct2026' ), type: 'text' },
	{ name: 'value', label: __( 'Value', 'hub-gsct2026' ), type: 'text' },
];

const listEmptyRow = { title: '', value: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		eyebrow,
		title,
		content,
		ctaText,
		ctaUrl,
		order,
		mediaType,
		imageId,
		imageUrl,
		imageAlt,
		videoUrl,
		videoThumbnailId,
		videoThumbnailUrl,
		videoThumbnailAlt,
		aspectRatio,
		fullBleed,
		quote,
		attribution,
		listItems,
		titleColour,
	} = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );
	const isImage = 'image' === mediaType;
	const isQuote = 'quote' === mediaType;
	const isList = 'list' === mediaType;

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Content Block">
			<TextControl
				label={ __( 'Eyebrow', 'hub-gsct2026' ) }
				value={ eyebrow }
				onChange={ ( value ) => setAttributes( { eyebrow: value } ) }
			/>
			<div style={ { display: 'flex', flexWrap: 'wrap', gap: '12px' } }>
				<div style={ { flex: '75 1 0%' } }>
					<TextControl
						label={ __( 'Title', 'hub-gsct2026' ) }
						value={ title }
						onChange={ ( value ) => setAttributes( { title: value } ) }
					/>
				</div>
				<div style={ { flex: '25 1 0%' } }>
					<RadioControl
						className="hub-radio-horizontal"
						label={ __( 'Title Colour', 'hub-gsct2026' ) }
						selected={ titleColour }
						options={ [
							{ label: __( 'Red', 'hub-gsct2026' ), value: 'Red' },
							{ label: __( 'Black', 'hub-gsct2026' ), value: 'Black' },
						] }
						onChange={ ( value ) => setAttributes( { titleColour: value } ) }
					/>
				</div>
			</div>
			<div className="hub-editor-field">
				<label className="hub-editor-field__label">{ __( 'Content', 'hub-gsct2026' ) }</label>
				<RichText
					tagName="div"
					className="hub-editor-field__control"
					aria-label={ __( 'Content', 'hub-gsct2026' ) }
					placeholder={ __( 'Content', 'hub-gsct2026' ) }
					value={ content }
					onChange={ ( value ) => setAttributes( { content: value } ) }
				/>
			</div>
			<div style={ { display: 'flex', flexWrap: 'wrap', gap: '12px' } }>
				<div style={ { flex: '50 1 0%' } }>
					<TextControl
						label={ __( 'CTA text', 'hub-gsct2026' ) }
						value={ ctaText }
						onChange={ ( value ) => setAttributes( { ctaText: value } ) }
					/>
				</div>
				<div style={ { flex: '50 1 0%' } }>
					<TextControl
						type="url"
						label={ __( 'CTA URL', 'hub-gsct2026' ) }
						value={ ctaUrl }
						onChange={ ( value ) => setAttributes( { ctaUrl: value } ) }
					/>
				</div>
			</div>
			<RadioControl
				className="hub-radio-horizontal"
				label={ __( 'Column order', 'hub-gsct2026' ) }
				selected={ order }
				options={ [
					{ label: __( 'Text | Media', 'hub-gsct2026' ), value: 'text-media' },
					{ label: __( 'Media | Text', 'hub-gsct2026' ), value: 'media-text' },
				] }
				onChange={ ( value ) => setAttributes( { order: value } ) }
			/>
			<RadioControl
				className="hub-radio-horizontal"
				label={ __( 'Media type', 'hub-gsct2026' ) }
				selected={ mediaType }
				options={ [
					{ label: __( 'Image', 'hub-gsct2026' ), value: 'image' },
					{ label: __( 'Video', 'hub-gsct2026' ), value: 'video' },
					{ label: __( 'Quote', 'hub-gsct2026' ), value: 'quote' },
					{ label: __( 'List', 'hub-gsct2026' ), value: 'list' },
				] }
				onChange={ ( value ) => setAttributes( { mediaType: value } ) }
			/>
			{ isImage && (
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
										{ imageUrl ? __( 'Replace image', 'hub-gsct2026' ) : __( 'Select image', 'hub-gsct2026' ) }
									</Button>
								</div>
							) }
						/>
					</MediaUploadCheck>
				</div>
			) }
			{ isImage && (
				<SelectControl
					label={ __( 'Image aspect ratio', 'hub-gsct2026' ) }
					value={ aspectRatio }
					options={ [
						{ label: '16/9', value: '16/9' },
						{ label: '1/1', value: '1/1' },
						{ label: '4/3', value: '4/3' },
						{ label: '2/3', value: '2/3' },
					] }
					onChange={ ( value ) => setAttributes( { aspectRatio: value } ) }
				/>
			) }
			{ isImage && (
				<ToggleControl
					label={ __( 'Full-bleed image', 'hub-gsct2026' ) }
					checked={ !! fullBleed }
					onChange={ ( value ) => setAttributes( { fullBleed: value } ) }
					help={ __( 'Extends the image to the viewport edge on its side.', 'hub-gsct2026' ) }
				/>
			) }
			{ ! isImage && ! isQuote && ! isList && (
				<>
					<TextControl
						type="url"
						label={ __( 'Vimeo URL', 'hub-gsct2026' ) }
						value={ videoUrl }
						onChange={ ( value ) => setAttributes( { videoUrl: value } ) }
						help={ __( 'e.g. https://vimeo.com/123456789', 'hub-gsct2026' ) }
					/>
					<div className="hub-editor-field">
						<label className="hub-editor-field__label">{ __( 'Video thumbnail', 'hub-gsct2026' ) }</label>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ ( media ) =>
									setAttributes( {
										videoThumbnailId: media.id,
										videoThumbnailUrl: media.url,
										videoThumbnailAlt: media.alt || '',
									} )
								}
								allowedTypes={ [ 'image' ] }
								value={ videoThumbnailId }
								render={ ( { open } ) => (
									<div className="hub-editor-field__control">
										{ videoThumbnailUrl && (
											<img
												src={ videoThumbnailUrl }
												alt={ videoThumbnailAlt }
												style={ { maxWidth: '200px', display: 'block', marginBottom: '8px' } }
											/>
										) }
										<Button variant="secondary" onClick={ open }>
											{ videoThumbnailUrl ? __( 'Replace thumbnail', 'hub-gsct2026' ) : __( 'Select thumbnail', 'hub-gsct2026' ) }
										</Button>
									</div>
								) }
							/>
						</MediaUploadCheck>
					</div>
				</>
			) }
			{ isList && (
				<RepeaterField
					label={ __( 'List items', 'hub-gsct2026' ) }
					value={ listItems }
					onChange={ ( value ) => setAttributes( { listItems: value } ) }
					fields={ listFields }
					emptyRow={ listEmptyRow }
				/>
			) }
			{ isQuote && (
				<>
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
				</>
			) }
		</EditorBlockShell>
	);
}
