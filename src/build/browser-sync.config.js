module.exports = {
	proxy: 'gsct.local/',
	host: 'gsct.local',
	open: 'external',
	notify: false,
	files: ['./css/*.min.css', './js/*.min.js', './**/*.php'],
};
