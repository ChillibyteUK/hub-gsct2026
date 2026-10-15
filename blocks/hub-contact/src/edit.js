import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const groups = [
	{ key: 'call', label: __( 'Call us', 'hub-gsct2026' ) },
	{ key: 'email', label: __( 'Email us', 'hub-gsct2026' ) },
	{ key: 'write', label: __( 'Write to us', 'hub-gsct2026' ) },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, intro } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Contact">
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<TextareaControl
				label={ __( 'Intro', 'hub-gsct2026' ) }
				value={ intro }
				onChange={ ( value ) => setAttributes( { intro: value } ) }
			/>
			{ groups.map( ( { key, label } ) => (
				<fieldset key={ key } style={ { border: '1px solid #ddd', padding: '12px', marginBottom: '12px' } }>
					<legend style={ { fontWeight: 600, padding: '0 4px' } }>{ label }</legend>
					<TextControl
						label={ __( 'Title', 'hub-gsct2026' ) }
						value={ attributes[ key + 'Title' ] }
						onChange={ ( value ) => setAttributes( { [ key + 'Title' ]: value } ) }
					/>
					<TextareaControl
						label={ __( 'Content', 'hub-gsct2026' ) }
						help={ __( 'Shortcodes are supported.', 'hub-gsct2026' ) }
						value={ attributes[ key + 'Content' ] }
						onChange={ ( value ) => setAttributes( { [ key + 'Content' ]: value } ) }
					/>
				</fieldset>
			) ) }
		</EditorBlockShell>
	);
}
