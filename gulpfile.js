const { src, dest, series, parallel } = require('gulp');
const gulpFontSpider = require('gulp-font-spider');
const gulpCSSMinify = require('gulp-clean-css');
const gulpHTMLMinify = require('gulp-htmlmin');
const clean = require('gulp-clean');
const marked = require('marked');
const cheerio = require('cheerio');
const through = require('through2');

const cleanUpPreviousBuild = () => src('./dist', { read: false }).pipe(clean());
const cleanUpOriginalFonts = () => src('./dist/**/.font-spider', { read: false }).pipe(clean());
const copyPublicFiles = () => src('./assets/**').pipe(dest('./dist/assets/'));
const copyFonts = () => src('./fonts/**').pipe(dest('./dist/fonts/'));
const compileMarkdown = () => src('./*.html')
	.pipe(through.obj(async (file, _, callback) => {
		if (file.isBuffer()) {
			const $ = cheerio.load(file.contents.toString(), { decodeEntities: false });
			const markdownElements = $('.markdown').map((_, e) => e).get();
			for(let i in markdownElements) {
				const e = markdownElements[i];
				$(e).html(await marked($(e).html().trim()));
			}
			file.contents = Buffer.from($.html());
			callback(null, file);
		} else {
			return callback();
		}
	}))
	.pipe(dest('./dist/'))
;
const fontSpider = () => src('./dist/*.html')
	.pipe(gulpFontSpider({ silent: false }))
	.pipe(dest('./dist/'))
;
const cssMinify = () => src('./dist/assets/*.css').pipe(gulpCSSMinify({ compatibility: 'ie8' })).pipe(dest('./dist/assets/'));
const htmlMinify = () => src('./dist/*.html').pipe(gulpHTMLMinify({ collapseWhitespace: true })).pipe(dest('./dist/'));

exports.default = series(
	parallel(
		copyPublicFiles,
		copyFonts,
		compileMarkdown
	),
	fontSpider,
	cleanUpOriginalFonts,
	parallel(
		cssMinify,
		htmlMinify
	)
)

exports.clean = cleanUpPreviousBuild
