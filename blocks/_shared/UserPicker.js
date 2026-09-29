import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { ComboboxControl } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Generic single-user picker for a block attribute holding one WP user ID —
 * the PostTypePicker.js equivalent for identity fields modelled as a
 * WordPress user rather than a post (e.g. Bio detail's "assigned user",
 * per Content Model §6.4 — the Fund Manager is a WP user with custom
 * user-meta, not a custom post type). Search-as-you-type via
 * ComboboxControl, backed by @wordpress/core-data.
 *
 * @param {Object}   props
 * @param {string}   props.label    Field label.
 * @param {number}   props.value    Currently selected user ID, or 0/undefined for none.
 * @param {Function} props.onChange ( id: number ) => void — 0 clears the selection.
 * @param {string}   [props.help]   Optional help text.
 */
export default function UserPicker( { label, value, onChange, help } ) {
	const [ search, setSearch ] = useState( '' );

	const searchResults = useSelect(
		( select ) => select( coreStore ).getUsers( { search, per_page: 20, orderby: 'name', order: 'asc' } ),
		[ search ]
	);

	const selectedUser = useSelect(
		( select ) => ( value ? select( coreStore ).getUser( value ) : null ),
		[ value ]
	);

	const options = [];

	if ( selectedUser && ! ( searchResults || [] ).some( ( user ) => user.id === selectedUser.id ) ) {
		options.push( { value: selectedUser.id, label: decodeEntities( selectedUser.name || '' ) || `#${ selectedUser.id }` } );
	}

	( searchResults || [] ).forEach( ( user ) => {
		options.push( { value: user.id, label: decodeEntities( user.name || '' ) || `#${ user.id }` } );
	} );

	return (
		<ComboboxControl
			label={ label }
			value={ value || null }
			options={ options }
			onFilterValueChange={ ( input ) => setSearch( input ) }
			onChange={ ( id ) => onChange( id ? Number( id ) : 0 ) }
			help={ help }
		/>
	);
}
