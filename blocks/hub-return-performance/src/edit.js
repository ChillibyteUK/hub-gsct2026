import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const legNames = [ 'NAV', 'Share price', 'Benchmark' ];

/**
 * Quick read of what a pasted CSV will turn into, so a bad paste is obvious
 * before the page is previewed. Mirrors render.php: blank lines and # lines
 * are skipped, line 1 is the headings, lines 2-4 are NAV / share price /
 * benchmark.
 *
 * @param {string} csv Pasted CSV text.
 * @return {{ok: boolean, text: string}} Status line.
 */
function checkCsv( csv ) {
	const lines = ( csv || '' )
		.split( /\r\n|\r|\n/ )
		.map( ( line ) => line.trim() )
		.filter( ( line ) => '' !== line && '#' !== line[ 0 ] );

	if ( ! lines.length ) {
		return { ok: false, text: 'Empty — nothing will show.' };
	}

	const columns = lines[ 0 ].split( ',' ).length;
	const problems = [];

	if ( lines.length !== 4 ) {
		problems.push( `${ lines.length } line${ 1 === lines.length ? '' : 's' } found, expected 4` );
	}

	lines.slice( 1, 4 ).forEach( ( line, index ) => {
		const cells = line.split( ',' ).length;
		if ( cells !== columns ) {
			problems.push( `${ legNames[ index ] } has ${ cells } value${ 1 === cells ? '' : 's' }, headings have ${ columns }` );
		}
	} );

	return problems.length
		? { ok: false, text: `Check this: ${ problems.join( '; ' ) }.` }
		: { ok: true, text: `OK — ${ columns } columns, 3 rows (NAV, share price, benchmark).` };
}

function CsvField( { label, value, onChange, instructions } ) {
	const status = checkCsv( value );

	return (
		<div className="hub-editor-field">
			<TextareaControl
				label={ label }
				value={ value }
				onChange={ onChange }
				rows={ 5 }
				spellCheck={ false }
				style={ { fontFamily: 'monospace', whiteSpace: 'pre' } }
				help={ instructions }
			/>
			<p
				className="hub-editor-field__help"
				style={ { marginTop: '-8px', color: status.ok ? '#1e7b34' : '#b32d2e' } }
			>
				{ status.text }
			</p>
		</div>
	);
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );
	const set = ( name ) => ( value ) => setAttributes( { [ name ]: value } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Return Performance">
			<TextControl
				label="Shared date (as at)"
				type="date"
				value={ attributes.asAt }
				onChange={ set( 'asAt' ) }
				help="Type {date} in the title, subtitle or headings below and it is replaced with this date (e.g. 31 Jul 2026)."
			/>
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
			<CsvField
				label="Cumulative values (%)"
				value={ attributes.cumulativeCsv }
				onChange={ set( 'cumulativeCsv' ) }
				instructions={
					<>
						Four lines, values separated by commas, no row labels:
						<br />
						<strong>Line 1</strong> — the period headings, e.g. <code>1M,YTD,1Y,3Y,5Y</code>
						<br />
						<strong>Line 2</strong> — NAV &nbsp;·&nbsp; <strong>Line 3</strong> — Share price &nbsp;·&nbsp; <strong>Line 4</strong> — Benchmark
						<br />
						Numbers only, as percentages (<code>-2.97</code>, not <code>-2.97%</code>). Use a dash or <code>n/a</code> where there is no figure. The chart is drawn from these values.
						<br />
						Example:
						<br />
						<code style={ { display: 'block', whiteSpace: 'pre', marginTop: 4 } }>
							{ '1M,YTD,1Y,3Y,5Y\n-2.97,6.5,9.24,23.58,18.82\n-1.64,8.36,16,36.7,28.43\n-4.3,10.78,18.77,40.76,40.15' }
						</code>
					</>
				}
			/>
			<CsvField
				label="Discrete years (%)"
				value={ attributes.discreteCsv }
				onChange={ set( 'discreteCsv' ) }
				instructions={
					<>
						Same layout, with the financial years as the headings. Roll it forward each year by adding the newest year as the first column.
						<br />
						<strong>Line 1</strong> — the years, newest first, e.g. <code>2025/26,2024/25,2023/24,2022/23,2021/22</code>
						<br />
						<strong>Line 2</strong> — NAV &nbsp;·&nbsp; <strong>Line 3</strong> — Share price &nbsp;·&nbsp; <strong>Line 4</strong> — Benchmark
						<br />
						Each line needs the same number of values as the headings. Example:
						<br />
						<code style={ { display: 'block', whiteSpace: 'pre', marginTop: 4 } }>
							{ '2025/26,2024/25,2023/24,2022/23,2021/22\n9.24,-0.06,13.19,2.25,-5.96\n16,-1.14,19.2,1.42,-7.37\n18.77,5.21,12.64,4.59,-4.8' }
						</code>
					</>
				}
			/>
			<TextareaControl
				label="Disclaimer"
				value={ attributes.disclaimer }
				onChange={ set( 'disclaimer' ) }
			/>
		</EditorBlockShell>
	);
}
