import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { TextControl, TextareaControl, Button, PanelBody, FocalPointPicker } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

// Localized by hub_gsct2026_localize_primary_hero_editor_script() (inc/blocks.php).
// The crosshair graphic is always this fixed test SVG; the background photo
// is only a fallback preview until a real image is chosen below.
const primaryHeroAssets = typeof window !== 'undefined' && window.hubGsct2026PrimaryHero ? window.hubGsct2026PrimaryHero : {};
const fallbackBackgroundUrl = primaryHeroAssets.backgroundUrl || '';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		focalPoint,
		backgroundId,
		backgroundUrl,
		backgroundAlt,
		heading,
		introText,
		primaryCtaText,
		primaryCtaUrl,
		secondaryCtaText,
		secondaryCtaUrl,
	} = attributes;
	const previewUrl = backgroundUrl || fallbackBackgroundUrl;
	const blockProps = useBlockProps( { className: 'container hub-gsct2026-editor-block' } );

	return (
		<>
			{ /* FocalPointPicker drags a marker via mouse listeners tied to the
			   top-level document — placed in the canvas (an iframe), the drag
			   position and the cursor drift apart because the two disagree on
			   coordinate space. Every core block with a FocalPointPicker (Cover,
			   Media & Text) puts it in InspectorControls instead, which renders
			   outside the iframe, so that's where this one lives too. */ }
			<InspectorControls>
				<PanelBody title={ __( 'Crosshair focal point', 'hub-gsct2026' ) }>
					<FocalPointPicker
						url={ previewUrl }
						value={ focalPoint }
						onChange={ ( value ) => setAttributes( { focalPoint: value } ) }
						help={ __( 'Positions the crosshair over the background image.', 'hub-gsct2026' ) }
					/>
				</PanelBody>
			</InspectorControls>
			<EditorBlockShell blockProps={ blockProps } clientId={ clientId } textDomain="hub-gsct2026" title="Primary Hero">
				<div className="hub-gsct2026-editor-field">
					<label className="hub-gsct2026-editor-field__label">{ __( 'Background image', 'hub-gsct2026' ) }</label>
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
								<div className="hub-gsct2026-editor-field__control">
									{ previewUrl && (
										<img
											src={ previewUrl }
											alt={ backgroundAlt }
											style={ { maxWidth: '200px', display: 'block', marginBottom: '8px' } }
										/>
									) }
									<Button variant="secondary" onClick={ open }>
										{ backgroundUrl ? __( 'Replace background image', 'hub-gsct2026' ) : __( 'Select background image', 'hub-gsct2026' ) }
									</Button>
								</div>
							) }
						/>
					</MediaUploadCheck>
				</div>
				<TextControl
					label={ __( 'Heading', 'hub-gsct2026' ) }
					value={ heading }
					onChange={ ( value ) => setAttributes( { heading: value } ) }
				/>
				<TextareaControl
					label={ __( 'Intro text', 'hub-gsct2026' ) }
					value={ introText }
					onChange={ ( value ) => setAttributes( { introText: value } ) }
				/>
				<div style={ { display: 'flex', flexWrap: 'wrap', gap: '12px' } }>
					<div style={ { flex: '50 1 0%' } }>
						<TextControl
							label={ __( 'Primary CTA text', 'hub-gsct2026' ) }
							value={ primaryCtaText }
							onChange={ ( value ) => setAttributes( { primaryCtaText: value } ) }
						/>
					</div>
					<div style={ { flex: '50 1 0%' } }>
						<TextControl
							type="url"
							label={ __( 'Primary CTA URL', 'hub-gsct2026' ) }
							value={ primaryCtaUrl }
							onChange={ ( value ) => setAttributes( { primaryCtaUrl: value } ) }
						/>
					</div>
				</div>
				<div style={ { display: 'flex', flexWrap: 'wrap', gap: '12px' } }>
					<div style={ { flex: '50 1 0%' } }>
						<TextControl
							label={ __( 'Video button text', 'hub-gsct2026' ) }
							value={ secondaryCtaText }
							onChange={ ( value ) => setAttributes( { secondaryCtaText: value } ) }
							help={ __( 'Opens the Vimeo video below in a modal player.', 'hub-gsct2026' ) }
						/>
					</div>
					<div style={ { flex: '50 1 0%' } }>
						<TextControl
							type="url"
							label={ __( 'Vimeo URL', 'hub-gsct2026' ) }
							value={ secondaryCtaUrl }
							onChange={ ( value ) => setAttributes( { secondaryCtaUrl: value } ) }
							help={ __( 'e.g. https://vimeo.com/123456789 — anything else renders as a plain link.', 'hub-gsct2026' ) }
						/>
					</div>
				</div>
			</EditorBlockShell>
		</>
	);
}
