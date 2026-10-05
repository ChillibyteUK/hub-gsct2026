import { useBlockProps } from '@wordpress/block-editor';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Share Price">
			<p className="hub-editor-block__note">
				Every figure populates live from the market data API on the frontend — placeholders show here in the editor.
			</p>
		</EditorBlockShell>
	);
}
