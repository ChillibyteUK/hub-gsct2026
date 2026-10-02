import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const regionsFields = [
	{ name: 'region', label: 'Region', type: 'text' },
	{ name: 'allocation', label: 'Allocation %', type: 'number', help: 'To 1 decimal place.' },
];

const regionsEmptyRow = { region: '', allocation: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, regions } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Holdings Geographic Chart">
			<TextControl
				label="Title"
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<RepeaterField
				label="Regions"
				value={ regions }
				onChange={ ( value ) => setAttributes( { regions: value } ) }
				fields={ regionsFields }
				emptyRow={ regionsEmptyRow }
			/>
			<p className="hub-editor-block__note">
				Renders a doughnut chart beside a region/allocation table. The centre label shows the allocations totalled.
			</p>
		</EditorBlockShell>
	);
}
