import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';
import RepeaterField from '../../_shared/RepeaterField';
import EditorBlockShell from '../../_shared/EditorBlockShell';

const videosFields = [
	{ name: 'videoUrl', label: __( 'Vimeo URL', 'hub-gsct2026' ), type: 'text' },
	{ name: 'videoTitle', label: __( 'Video Title', 'hub-gsct2026' ), type: 'text' },
	{ name: 'videoSubtitle', label: __( 'Video Subtitle', 'hub-gsct2026' ), type: 'text' },
	{ name: 'videoThumbnail', label: __( 'Video Thumbnail', 'hub-gsct2026' ), type: 'image' },
];

const videosEmptyRow = { videoUrl: '', videoTitle: '', videoSubtitle: '', videoThumbnail: 0, videoThumbnailUrl: '' };

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, intro, videos } = attributes;
	const blockProps = useBlockProps( { className: 'container hub-editor-block' } );

	return (
		<EditorBlockShell blockProps={ blockProps } clientId={ clientId } classPrefix="hub" textDomain="hub-gsct2026" title="HUB Multi Video">
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
				label={ __( 'Videos', 'hub-gsct2026' ) }
				value={ videos }
				onChange={ ( value ) => setAttributes( { videos: value } ) }
				fields={ videosFields }
				emptyRow={ videosEmptyRow }
				layout="column"
			/>
		</EditorBlockShell>
	);
}
