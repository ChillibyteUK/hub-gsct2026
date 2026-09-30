import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const yearsFields = [
	{ name: 'year', label: __( 'Year', 'hub-gsct2026' ), type: 'text' },
	{ name: 'title', label: __( 'Title', 'hub-gsct2026' ), type: 'text' },
	{ name: 'content', label: __( 'Content', 'hub-gsct2026' ), type: 'textarea' },
];

const yearsEmptyRow = { year: '', title: '', content: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { intro, years, footnote } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Timeline">
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
			<RepeaterField
				label={ __( 'Years', 'hub-gsct2026' ) }
				value={ years }
				onChange={ ( value ) => setAttributes( { years: value } ) }
				fields={ yearsFields }
				emptyRow={ yearsEmptyRow }
			/>
			<TextControl
				label={ __( 'Footnote', 'hub-gsct2026' ) }
				value={ footnote }
				onChange={ ( value ) => setAttributes( { footnote: value } ) }
			/>
		</EditorBlockShell>
	);
}
