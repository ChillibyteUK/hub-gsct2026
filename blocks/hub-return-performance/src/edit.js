import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const cumPeriods = [
	{ key: '1m', label: '1M' },
	{ key: 'Ytd', label: 'YTD' },
	{ key: '1y', label: '1Y' },
	{ key: '3y', label: '3Y' },
	{ key: '5y', label: '5Y' },
];

const legs = [
	{ key: 'Nav', label: 'NAV' },
	{ key: 'Price', label: 'Share price' },
	{ key: 'Bench', label: 'Benchmark' },
];

const discYears = [ 1, 2, 3, 4, 5 ];

const gridStyle = {
	display: 'grid',
	gridTemplateColumns: '110px repeat(5, 1fr)',
	gap: '8px',
	alignItems: 'end',
	marginBottom: '12px',
};

const headerStyle = {
	fontSize: '0.75rem',
	fontWeight: 600,
	textAlign: 'right',
};

function NumField( { label, value, onChange } ) {
	return (
		<TextControl
			type="number"
			step="0.01"
			label={ label }
			hideLabelFromVision
			value={ value ?? '' }
			onChange={ ( v ) => onChange( '' === v ? '' : Number( v ) ) }
		/>
	);
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );
	const set = ( name ) => ( value ) => setAttributes( { [ name ]: value } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Return Performance">
			<TextControl
				label="Chart title"
				value={ attributes.chartTitle }
				onChange={ set( 'chartTitle' ) }
			/>
			<TextControl
				label="Chart subtitle"
				value={ attributes.chartSubtitle }
				onChange={ set( 'chartSubtitle' ) }
			/>
			<TextControl
				label="Cumulative heading"
				value={ attributes.cumHeading }
				onChange={ set( 'cumHeading' ) }
			/>
			<TextControl
				label="Discrete heading"
				value={ attributes.discHeading }
				onChange={ set( 'discHeading' ) }
			/>
			<p className="hub-editor-field__label">Cumulative values (%)</p>
			<div style={ gridStyle }>
				<span />
				{ cumPeriods.map( ( p ) => (
					<span key={ p.key } style={ headerStyle }>{ p.label }</span>
				) ) }
				{ legs.map( ( leg ) => (
					<Fragment key={ `cum-${ leg.key }` }>
						<span style={ { fontSize: '0.75rem', fontWeight: 600 } }>{ leg.label }</span>
						{ cumPeriods.map( ( p ) => {
							const name = `cum${ leg.key }${ p.key }`;
							return (
								<NumField
									key={ name }
									label={ `Cumulative ${ leg.label } ${ p.label }` }
									value={ attributes[ name ] }
									onChange={ set( name ) }
								/>
							);
						} ) }
					</Fragment>
				) ) }
			</div>
			<p className="hub-editor-field__label">Discrete years (roll forward annually)</p>
			<div style={ gridStyle }>
				<span />
				{ discYears.map( ( n ) => (
					<TextControl
						key={ `year-${ n }` }
						label={ `Discrete year ${ n }` }
						hideLabelFromVision
						value={ attributes[ `year${ n }` ] }
						onChange={ set( `year${ n }` ) }
					/>
				) ) }
				{ legs.map( ( leg ) => (
					<Fragment key={ `disc-${ leg.key }` }>
						<span style={ { fontSize: '0.75rem', fontWeight: 600 } }>{ leg.label }</span>
						{ discYears.map( ( n ) => {
							const name = `disc${ leg.key }${ n }`;
							return (
								<NumField
									key={ name }
									label={ `Discrete ${ leg.label } year ${ n }` }
									value={ attributes[ name ] }
									onChange={ set( name ) }
								/>
							);
						} ) }
					</Fragment>
				) ) }
			</div>
			<TextareaControl
				label="Disclaimer"
				value={ attributes.disclaimer }
				onChange={ set( 'disclaimer' ) }
			/>
			<p className="hub-editor-block__note">
				The chart reads the cumulative values above — one source of truth, no separate chart data to keep in sync.
			</p>
		</EditorBlockShell>
	);
}
