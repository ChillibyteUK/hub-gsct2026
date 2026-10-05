import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, intro, cardsTitle } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Document Library Hero">
			<TextControl
				label="Title"
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<TextareaControl
				label="Intro"
				value={ intro }
				onChange={ ( value ) => setAttributes( { intro: value } ) }
			/>
			<TextControl
				label="Cards heading"
				value={ cardsTitle }
				onChange={ ( value ) => setAttributes( { cardsTitle: value } ) }
			/>
			<p className="hub-editor-block__note">
				The three cards are managed under Site-Wide Settings → Documents. File type and size are derived from the file itself — only the date is typed in by hand.
			</p>
		</EditorBlockShell>
	);
}
