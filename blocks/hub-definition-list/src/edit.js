import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const termsFields = [
	{ name: 'term', label: __( 'Term', 'hub-gsct2026' ), type: 'text' },
	{ name: 'definition', label: __( 'Definition', 'hub-gsct2026' ), type: 'textarea' },
];

const termsEmptyRow = { term: '', definition: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, terms } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Definition List">
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<RepeaterField
				label={ __( 'Terms', 'hub-gsct2026' ) }
				value={ terms }
				onChange={ ( value ) => setAttributes( { terms: value } ) }
				fields={ termsFields }
				emptyRow={ termsEmptyRow }
			/>
		</EditorBlockShell>
	);
}
