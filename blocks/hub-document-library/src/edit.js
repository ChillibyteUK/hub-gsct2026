import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, pillCount } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Document Library">
			<TextControl
				label="Title"
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<TextControl
				type="number"
				label="Visible category pills"
				value={ pillCount ?? 5 }
				onChange={ ( value ) => setAttributes( { pillCount: '' === value ? 5 : Number( value ) } ) }
				help="The first however-many categories show as pills; the rest go under the More dropdown."
			/>
			<p className="hub-editor-block__note">
				Lists every published document post (title, category, release date, format) with title search and category filtering. No settings for the rows themselves — they come straight from the Documents.
			</p>
		</EditorBlockShell>
	);
}
