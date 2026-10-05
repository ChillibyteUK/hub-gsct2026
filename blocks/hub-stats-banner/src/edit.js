import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } title="HUB Stats Banner" textDomain="hub-gsct2026">
			<p className="hub-editor-block__note">
				Share price populates live from the market data API on the frontend — placeholders show here in the editor.
			</p>
		</EditorBlockShell>
	);
}
