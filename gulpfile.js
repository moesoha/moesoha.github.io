const { TaskGenerate } = require('gulp-task-static-pages');

Object.assign(exports, TaskGenerate({
	fontPath: './fonts',
	fontDestinationDirectory: 'fonts',
	isProduction: process.env.NODE_ENV === 'production' || (process.argv.indexOf('--prod') > -1)
 }));
