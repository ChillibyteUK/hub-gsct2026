import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, holdingsCsv, excludeLabel } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Holdings">
			<TextControl
				label="Title"
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<TextareaControl
				label="Holdings CSV"
				value={ holdingsCsv }
				onChange={ ( value ) => setAttributes( { holdingsCsv: value } ) }
				help="Paste the full CSV: Holding Name, Sector/Industry, Weight %. Header row optional. Quoted fields supported."
				rows={ 10 }
			/>
			<TextControl
				label="Filter button label"
				value={ excludeLabel }
				onChange={ ( value ) => setAttributes( { excludeLabel: value } ) }
				help="Toggles hiding rows whose Sector/Industry is ‘Collective investments’."
			/>
			<p className="hub-editor-block__note">
				Renders the top 10 by weight %. The filter button toggles hiding ‘Collective investments’ rows instantly, without reloading the page.
			</p>
		</EditorBlockShell>
	);
}
