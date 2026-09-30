import { __, sprintf } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const platformsFields = [
	{ name: 'logo', label: __( 'Logo', 'hub-gsct2026' ), type: 'image' },
	{ name: 'linkUrl', label: __( 'Link URL', 'hub-gsct2026' ), type: 'text' },
];

const platformsEmptyRow = { logo: 0, logoUrl: '', linkUrl: '' };

function RichTextField( { label, value, onChange } ) {
	return (
		<div className="hub-editor-field">
			<label className="hub-editor-field__label">{ label }</label>
			<RichText
					tagName="div"
					className="hub-editor-field__control"
					aria-label={ label }
					value={ value }
					onChange={ onChange }
				/>
		</div>
	);
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		title,
		intro,
		platformsTitle,
		platformsIntro,
		platforms,
		platformsFooter,
		vehiclesTitle,
		vehicle1Title,
		vehicle1Content,
		vehicle2Title,
		vehicle2Content,
		vehicle3Title,
		vehicle3Content,
		listingTitle,
		listingIntro,
		riskTitle,
		riskWording,
	} = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );
	const set = ( name ) => ( value ) => setAttributes( { [ name ]: value } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB How To Invest Full">
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ set( 'title' ) }
			/>
			<RichTextField label={ __( 'Intro', 'hub-gsct2026' ) } value={ intro } onChange={ set( 'intro' ) } />
			<TextControl
				label={ __( 'Investment Platforms Title', 'hub-gsct2026' ) }
				value={ platformsTitle }
				onChange={ set( 'platformsTitle' ) }
			/>
			<RichTextField label={ __( 'Investment Platforms Intro', 'hub-gsct2026' ) } value={ platformsIntro } onChange={ set( 'platformsIntro' ) } />
			<RepeaterField
				label={ __( 'Platforms', 'hub-gsct2026' ) }
				value={ platforms }
				onChange={ set( 'platforms' ) }
				fields={ platformsFields }
				emptyRow={ platformsEmptyRow }
			/>
			<RichTextField label={ __( 'Investment Platforms Footer', 'hub-gsct2026' ) } value={ platformsFooter } onChange={ set( 'platformsFooter' ) } />
			<TextControl
				label={ __( 'Investment Vehicles Title', 'hub-gsct2026' ) }
				value={ vehiclesTitle }
				onChange={ set( 'vehiclesTitle' ) }
			/>
			{[ 1, 2, 3 ].map( ( n ) => (
				<div key={ n }>
					<TextControl
						label={ sprintf( __( 'Vehicle %d Title', 'hub-gsct2026' ), n ) }
						value={ attributes[ `vehicle${ n }Title` ] }
						onChange={ set( `vehicle${ n }Title` ) }
					/>
					<RichTextField label={ sprintf( __( 'Vehicle %d Content', 'hub-gsct2026' ), n ) } value={ attributes[ `vehicle${ n }Content` ] } onChange={ set( `vehicle${ n }Content` ) } />
				</div>
			) ) }
			<TextControl
				label={ __( 'Listing Title', 'hub-gsct2026' ) }
				value={ listingTitle }
				onChange={ set( 'listingTitle' ) }
			/>
			<RichTextField label={ __( 'Listing Intro', 'hub-gsct2026' ) } value={ listingIntro } onChange={ set( 'listingIntro' ) } />
			<TextControl
				label={ __( 'Risk Title', 'hub-gsct2026' ) }
				value={ riskTitle }
				onChange={ set( 'riskTitle' ) }
			/>
			<RichTextField label={ __( 'Risk Wording', 'hub-gsct2026' ) } value={ riskWording } onChange={ set( 'riskWording' ) } />
		</EditorBlockShell>
	);
}
