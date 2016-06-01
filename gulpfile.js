var gulp = require('gulp'),
	watch = require('gulp-watch');
var destDir = '../plugin_directory/poi-plugin-subtitle';

// Sync files between git repo and local poi plugin directory
gulp.task('watch', function() {
	watch('**/*.cjsx', function() {
		gulp.src('**/*.cjsx')
			.pipe(watch('**/*.cjsx'))
			.pipe(gulp.dest(destDir))
	});
});
