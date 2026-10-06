import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, disclaimer } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Dividend Calculator">
			<TextControl
				label="Title"
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<TextareaControl
				label="Disclaimer"
				value={ disclaimer }
				onChange={ ( value ) => setAttributes( { disclaimer: value } ) }
				help="Shown below the payments table."
			/>
			<p className="hub-editor-block__note">
				Start/end dates plus share count in, total GBp and yield-on-cost out — computed live against dividend history and the start-date close.
			</p>
		</EditorBlockShell>
	);
}
