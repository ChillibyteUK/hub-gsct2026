import { useBlockProps } from '@wordpress/block-editor';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } title="HUB Announcements" textDomain="hub-gsct2026">
			<p className="hub-editor-block__note">
				Renders the Investis RNS announcements tool on the frontend — restyled with a Category column, counts and pagination treatment. Nothing to configure here.
			</p>
		</EditorBlockShell>
	);
}
