import { useBlockProps } from '@wordpress/block-editor';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Dividends">
			<p className="hub-editor-block__note">
				Latest dividend card, annual chart and full history table — everything populates live from the corporate actions API on the frontend.
			</p>
		</EditorBlockShell>
	);
}
