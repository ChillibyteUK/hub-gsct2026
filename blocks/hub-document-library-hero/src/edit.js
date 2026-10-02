import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const cardsFields = [
	{ name: 'cardTitle', label: 'Title', type: 'text' },
	{ name: 'file', label: 'File', type: 'file' },
	{ name: 'date', label: 'Date', type: 'text', help: 'Manual entry, UK format — e.g. 15 Jan 2026.' },
];

const cardsEmptyRow = { cardTitle: '', file: 0, fileName: '', date: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, intro, cardsTitle, cards } = attributes;
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
			<RepeaterField
				label="Documents"
				value={ cards }
				onChange={ ( value ) => setAttributes( { cards: value } ) }
				fields={ cardsFields }
				emptyRow={ cardsEmptyRow }
				layout="column"
			/>
			<p className="hub-editor-block__note">
				File type and size are derived from the uploaded file itself — only the date is typed in by hand.
			</p>
		</EditorBlockShell>
	);
}
