import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, RadioControl, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import EditorBlockShell from '../../_shared/EditorBlockShell';

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, authorId } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	const query = {
		per_page: 100,
		orderby: 'title',
		order: 'asc',
		_fields: 'id,title',
	};

	const people = useSelect(
		( select ) => select( 'core' ).getEntityRecords( 'postType', 'person', query ),
		[]
	);

	const options = [
		{ label: __( 'None', 'hub-gsct2026' ), value: '0' },
		...( people ?? [] ).map( ( person ) => ( {
			label: person.title?.rendered ?? `#${ person.id }`,
			value: String( person.id ),
		} ) ),
	];

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Insights by Author">
			<TextControl
				label={ __( 'Title', 'hub-gsct2026' ) }
				value={ title }
				onChange={ ( value ) => setAttributes( { title: value } ) }
				help={ __( 'Leave blank to default to "Insights from {Author Name}".', 'hub-gsct2026' ) }
			/>
			{ null === people && <Spinner /> }
			{ null !== people && (
			<RadioControl
				className="hub-radio-horizontal"
				label={ __( 'Author', 'hub-gsct2026' ) }
					selected={ String( authorId ?? 0 ) }
					options={ options }
					onChange={ ( value ) => setAttributes( { authorId: parseInt( value, 10 ) || 0 } ) }
				/>
			) }
			<p className="hub-editor-block__note">
				{ __(
					'Shows the latest three posts with this person set as their author (Post Author sidebar on each post). Same pink section, three cards, swipe carousel on mobile as HUB Related Insights.',
					'hub-gsct2026'
				) }
			</p>
		</EditorBlockShell>
	);
}
