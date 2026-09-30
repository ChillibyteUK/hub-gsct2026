import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const pointsFields = [
	{ name: 'bigStat', label: __( 'Big Stat', 'hub-gsct2026' ), type: 'text' },
	{ name: 'subtitle', label: __( 'Subtitle', 'hub-gsct2026' ), type: 'text' },
	{ name: 'content', label: __( 'Content', 'hub-gsct2026' ), type: 'textarea', help: __( 'Wrap popover trigger words like this: [popover]words[/popover]', 'hub-gsct2026' ) },
	{ name: 'popover', label: __( 'Popover', 'hub-gsct2026' ), type: 'radio', className: 'hub-radio-horizontal', options: [ { label: __( 'None', 'hub-gsct2026' ), value: '' }, { label: __( 'With popover', 'hub-gsct2026' ), value: 'yes' } ] },
	{ name: 'popoverTitle', label: __( 'Popover title', 'hub-gsct2026' ), type: 'text', showIf: { field: 'popover', value: 'yes' } },
	{ name: 'popoverContent', label: __( 'Popover content', 'hub-gsct2026' ), type: 'textarea', showIf: { field: 'popover', value: 'yes' } },
	{ name: 'popoverImage', label: __( 'Popover image', 'hub-gsct2026' ), type: 'image', showIf: { field: 'popover', value: 'yes' } },
];

const pointsEmptyRow = { bigStat: '', subtitle: '', content: '', popover: '', popoverTitle: '', popoverContent: '', popoverImage: 0, popoverImageUrl: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, intro, points } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB 3 Points Hero">
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
			/>
			<TextareaControl
				label={ __( 'Intro', 'hub-gsct2026' ) }
				value={ intro }
				onChange={ ( value ) => setAttributes( { intro: value } ) }
			/>
			<RepeaterField
				label={ __( 'Points', 'hub-gsct2026' ) }
				value={ points }
				onChange={ ( value ) => setAttributes( { points: value } ) }
				fields={ pointsFields }
				emptyRow={ pointsEmptyRow }
				layout="column"
			/>
		</EditorBlockShell>
	);
}
