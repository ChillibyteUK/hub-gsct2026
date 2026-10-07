import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, intro } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Learning Posts Grid">
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
				help={ __( 'Bare <span> tags highlight in brand-purple, e.g. Learn <span>more</span>.', 'hub-gsct2026' ) }
			/>
			<div className="hub-editor-field">
				<label className="hub-editor-field__label">{ __( 'Intro', 'hub-gsct2026' ) }</label>
				<RichText
					tagName="div"
					className="hub-editor-field__control"
					aria-label={ __( 'Intro', 'hub-gsct2026' ) }
					placeholder={ __( 'Intro', 'hub-gsct2026' ) }
					value={ intro }
					onChange={ ( value ) => setAttributes( { intro: value } ) }
				/>
			</div>
		</EditorBlockShell>
	);
}
