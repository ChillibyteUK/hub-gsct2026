import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { postsTitle, docsTitle, insightsLinkUrl, documentsLinkUrl } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Latest Posts and Documents">
			<TextControl
				label="Posts heading"
				value={ postsTitle }
				onChange={ ( value ) => setAttributes( { postsTitle: value } ) }
			/>
			<TextControl
				label="Documents heading"
				value={ docsTitle }
				onChange={ ( value ) => setAttributes( { docsTitle: value } ) }
			/>
			<TextControl
				label="All insights link URL"
				value={ insightsLinkUrl }
				onChange={ ( value ) => setAttributes( { insightsLinkUrl: value } ) }
				help="Blank for the posts archive."
			/>
			<TextControl
				label="All documents link URL"
				value={ documentsLinkUrl }
				onChange={ ( value ) => setAttributes( { documentsLinkUrl: value } ) }
				help="Blank for /documents/. Kept as text so relative paths validate."
			/>
			<p className="hub-editor-block__note">
				Shows the three latest posts plus the featured documents from Site-Wide Settings → Documents. Both rows swipe on mobile.
			</p>
		</EditorBlockShell>
	);
}
