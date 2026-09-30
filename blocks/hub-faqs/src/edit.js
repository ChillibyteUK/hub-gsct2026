import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const faqsFields = [
	{ name: 'question', label: __( 'Question', 'hub-gsct2026' ), type: 'text' },
	{ name: 'answer', label: __( 'Answer', 'hub-gsct2026' ), type: 'richtext', multiline: true },
];

const faqsEmptyRow = { question: '', answer: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, faqs, linkText, linkUrl } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB FAQs">
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<RepeaterField
				label={ __( 'FAQs', 'hub-gsct2026' ) }
				value={ faqs }
				onChange={ ( value ) => setAttributes( { faqs: value } ) }
				fields={ faqsFields }
				emptyRow={ faqsEmptyRow }
				layout="column"
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
					<TextControl
						type="url"
						label={ __( 'Link URL', 'hub-gsct2026' ) }
						value={ linkUrl }
						onChange={ ( value ) => setAttributes( { linkUrl: value } ) }
					/>
				</div>
			</div>
		</EditorBlockShell>
	);
}
