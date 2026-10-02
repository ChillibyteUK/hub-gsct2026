/**
 * File picker for the classic Document Details meta box (document CPT).
 * Vanilla JS + wp.media — no build step, enqueued directly from
 * inc/posttypes.php on the document edit screen only.
 */
( function () {
	function $( id ) {
		return document.getElementById( id );
	}

	var selectBtn = $( 'hub-doc-select-file' );
	var removeBtn = $( 'hub-doc-remove-file' );
	var input = $( 'hub_document_file' );
	var nameEl = $( 'hub-doc-file-name' );

	if ( ! selectBtn || ! input ) {
		return;
	}

	var frame = null;

	function refresh() {
		var has = !! input.value && '0' !== input.value;

		if ( removeBtn ) {
			removeBtn.style.display = has ? '' : 'none';
		}
	}

	selectBtn.addEventListener( 'click', function ( e ) {
		e.preventDefault();

		if ( frame ) {
			frame.open();
			return;
		}

		frame = wp.media( {
			title: 'Select document file',
			button: { text: 'Use this file' },
			multiple: false,
		} );

		frame.on( 'select', function () {
			var att = frame.state().get( 'selection' ).first().toJSON();
			input.value = att.id;

			if ( nameEl ) {
				nameEl.textContent = att.filename || att.title || 'File ID ' + att.id;
			}

			refresh();
		} );

		frame.open();
	} );

	if ( removeBtn ) {
		removeBtn.addEventListener( 'click', function ( e ) {
			e.preventDefault();
			input.value = '0';

			if ( nameEl ) {
				nameEl.textContent = 'No file selected.';
			}

			refresh();
		} );
	}

	refresh();
} )();
