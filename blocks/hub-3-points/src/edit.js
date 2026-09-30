import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl, RadioControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const pointsFields = [
	{ name: 'bigStat', label: __( 'Big Stat', 'hub-gsct2026' ), type: 'text' },
	{ name: 'subtitle', label: __( 'Subtitle', 'hub-gsct2026' ), type: 'text' },
	{ name: 'content', label: __( 'Content', 'hub-gsct2026' ), type: 'textarea' },
];

const pointsEmptyRow = { bigStat: '', subtitle: '', content: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { eyebrow, title, titleColour, intro, points } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB 3 Points">
			<TextControl
				label={ __( 'Eyebrow', 'hub-gsct2026' ) }
				value={ eyebrow }
				onChange={ ( value ) => setAttributes( { eyebrow: value } ) }
			/>
			<div style={ { display: 'flex', flexWrap: 'wrap', gap: '12px' } }>
				<div style={ { flex: '75 1 0%' } }>
					<TextControl
						label={ __( 'Title', 'hub-gsct2026' ) }
						value={ title }
						onChange={ ( value ) => setAttributes( { title: value } ) }
					/>
				</div>
				<div style={ { flex: '25 1 0%' } }>
					<RadioControl
						label={ __( 'Title Colour', 'hub-gsct2026' ) }
						selected={ titleColour }
						options={ [
							{ label: 'Red', value: 'Red' },
							{ label: 'Black', value: 'Black' },
						] }
						onChange={ ( value ) => setAttributes( { titleColour: value } ) }
					/>
				</div>
			</div>
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
			/>
		</EditorBlockShell>
	);
}
