import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const pagesFields = [
	{ name: 'pageId', label: __( 'Page', 'hub-gsct2026' ), type: 'post', postType: 'page' },
	{ name: 'label', label: __( 'Label (optional)', 'hub-gsct2026' ), type: 'text', help: __( 'Defaults to the page\u2019s own title.', 'hub-gsct2026' ) },
];

const pagesEmptyRow = { pageId: 0, label: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { pages } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Sub-Page Nav">
			<RepeaterField
				label={ __( 'Pages', 'hub-gsct2026' ) }
				value={ pages }
				onChange={ ( value ) => setAttributes( { pages: value } ) }
				fields={ pagesFields }
				emptyRow={ pagesEmptyRow }
			/>
			<p className="hub-editor-block__note">
				{ __(
					'The current page in this list gets the same red-underline accent as the main nav, automatically — nothing to set per row.',
					'hub-gsct2026'
				) }
			</p>
		</EditorBlockShell>
	);
}
