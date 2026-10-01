import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { formTitle, formShortcode } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Form">
			<TextControl
				label={ __( 'Form title', 'hub-gsct2026' ) }
				value={ formTitle }
				onChange={ ( value ) => setAttributes( { formTitle: value } ) }
			/>
			<TextControl
				label={ __( 'Form shortcode', 'hub-gsct2026' ) }
				value={ formShortcode }
				onChange={ ( value ) => setAttributes( { formShortcode: value } ) }
				help={ __( 'e.g. [gravityform id="1"]', 'hub-gsct2026' ) }
			/>
		</EditorBlockShell>
	);
}
