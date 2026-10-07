import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, MediaUploadCheck, URLInput } from '@wordpress/block-editor';
import { TextControl, Button } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const cardsFields = [
	{ name: 'cardTitle', label: __( 'Card Title', 'hub-gsct2026' ), type: 'text' },
	{ name: 'cardContent', label: __( 'Card Content', 'hub-gsct2026' ), type: 'textarea' },
];

const cardsEmptyRow = { cardTitle: '', cardContent: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { backgroundId, backgroundUrl, backgroundAlt, title, cards, linkText, linkUrl } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Cards Section">
			<div className="hub-editor-field">
				<label className="hub-editor-field__label">{ __( 'Background', 'hub-gsct2026' ) }</label>
				<MediaUploadCheck>
					<MediaUpload
						onSelect={ ( media ) =>
							setAttributes( {
								backgroundId: media.id,
								backgroundUrl: media.url,
								backgroundAlt: media.alt || '',
							} )
						}
						allowedTypes={ [ 'image' ] }
						value={ backgroundId }
						render={ ( { open } ) => (
							<div className="hub-editor-field__control">
								{ backgroundUrl && (
									<img
										src={ backgroundUrl }
										alt={ backgroundAlt }
										style={ { maxWidth: '200px', display: 'block', marginBottom: '8px' } }
									/>
								) }
								<Button variant="secondary" onClick={ open }>
									{ backgroundUrl ? __( 'Replace Background', 'hub-gsct2026' ) : __( 'Select Background', 'hub-gsct2026' ) }
								</Button>
							</div>
						) }
					/>
				</MediaUploadCheck>
			</div>
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<RepeaterField
				label={ __( 'Cards', 'hub-gsct2026' ) }
				value={ cards }
				onChange={ ( value ) => setAttributes( { cards: value } ) }
				fields={ cardsFields }
				emptyRow={ cardsEmptyRow }
			/>
			<div style={ { display: 'flex', flexWrap: 'wrap', gap: '12px' } }>
				<div style={ { flex: '50 1 0%' } }>
					<TextControl
						label={ __( 'Link Text', 'hub-gsct2026' ) }
						value={ linkText }
						onChange={ ( value ) => setAttributes( { linkText: value } ) }
					/>
				</div>
				<div style={ { flex: '50 1 0%' } }>
					<div className="hub-editor-field">
						<label className="hub-editor-field__label">{ __( 'Link URL', 'hub-gsct2026' ) }</label>
						<URLInput
							value={ linkUrl || '' }
							onChange={ ( value ) => setAttributes( { linkUrl: value } ) }
						/>
					</div>
				</div>
			</div>
		</EditorBlockShell>
	);
}
