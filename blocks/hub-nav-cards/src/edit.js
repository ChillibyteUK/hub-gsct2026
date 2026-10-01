import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const cardsFields = [
	{ name: 'title', label: __( 'Title', 'hub-gsct2026' ), type: 'text' },
	{ name: 'content', label: __( 'Content', 'hub-gsct2026' ), type: 'textarea' },
	{ name: 'linkUrl', label: __( 'Link URL', 'hub-gsct2026' ), type: 'text' },
];

const cardsEmptyRow = { title: '', content: '', linkUrl: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, cards } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Nav Cards">
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
				layout="column"
			/>
		</EditorBlockShell>
	);
}
