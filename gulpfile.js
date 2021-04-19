const config = {
	langs: ['zh', 'en'],
	langsKeyToGenerate: ['zh'],
	compileLang: process.env.COMPILE_LANG || 'zh',
	i18nPath: './i18n/'
};

const { src, dest, series, parallel } = require('gulp');
const gulpFontSpider = require('gulp-font-spider');
const gulpCSSMinify = require('gulp-clean-css');
const gulpHTMLMinify = require('gulp-htmlmin');
const clean = require('gulp-clean');
const cheerio = require('cheerio');
const through = require('through2');
const YAML = require('yaml');
const fs = require('fs');

const cleanUpPreviousBuild = () => src('./dist', { read: false }).pipe(clean());
const cleanUpOriginalFonts = () => src('./dist/**/.font-spider', { read: false }).pipe(clean());
const copyPublicFiles = () => src('./public/**').pipe(dest('./dist/'));
const copyAssets = () => src('./assets/**').pipe(dest('./dist/assets/'));
const copyFonts = () => src('./fonts/**').pipe(dest('./dist/fonts/'));

const fontSpider = () => src('./dist/*.html')
	.pipe(gulpFontSpider({ silent: false }))
	.pipe(dest('./dist/'))
;
const cssMinify = () => src('./dist/assets/*.css').pipe(gulpCSSMinify({ compatibility: 'ie8' })).pipe(dest('./dist/assets/'));
const htmlMinify = () => src('./dist/*.html').pipe(gulpHTMLMinify({ collapseWhitespace: true })).pipe(dest('./dist/'));

const i18n = {
	getLangFileName: (orig, lang) => {
		const idxDot = orig.lastIndexOf('.');
		const filename = idxDot < 1 ? orig : orig.substring(0, idxDot);
		return `${filename}.${lang}.yaml`;
	},
	extractKeys: () => src('./*.html')
		.pipe(through.obj(function (file, _, callback) {
			if (file.isBuffer()) {
				const $ = cheerio.load(file.contents.toString(), { decodeEntities: false });
				const i18nElements = $('[i18n], [i18n-key], [i18n-title]').map((_, e) => e).get();
				const keys = {};
				for(let i in i18nElements) {
					const e = i18nElements[i];
					if (typeof $(e).attr('i18n') === 'string') {
						keys[$(e).html()] = '';
					} else if ($(e).attr('i18n-key')) {
						keys[$(e).attr('i18n-key')] = '';
					}
					if ($(e).attr('i18n-title')) {
						keys[$(e).attr('i18n-title')] = '';
					}
				}
				config.langsKeyToGenerate.forEach(lang => {
					const f = file.clone();
					f.basename = i18n.getLangFileName(file.basename, lang);
					const newKeys = { ...keys };
					try {
						const old = YAML.parse(fs.readFileSync(config.i18nPath + f.basename, 'utf-8'));
						Object.entries(old).forEach(([k, v]) => newKeys[k] = v);
					} catch (_) {}
					f.contents = Buffer.from(YAML.stringify(newKeys));
					this.push(f);
				});
			}
			return callback();
		}))
		.pipe(dest('./i18n/'))
	,
	compile: () => src('./*.html')
		.pipe(through.obj(function (file, _, callback) {
			if (file.isBuffer()) {
				let lang = {};
				try {
					lang = YAML.parse(fs.readFileSync(config.i18nPath + i18n.getLangFileName(file.basename, config.compileLang), 'utf-8'));
				} catch (_) {}
				const $ = cheerio.load(file.contents.toString(), { decodeEntities: false });
				const i18nElements = $('[i18n-if], [i18n], [i18n-key], [i18n-title]').map((_, e) => e).get();
				for(let i in i18nElements) {
					const e = i18nElements[i];
					let val;
					if (typeof $(e).attr('i18n') === 'string') {
						val = lang[$(e).html()];
						if (val) {
							$(e).html(val);
						}
					} else if ($(e).attr('i18n-key')) {
						val = lang[$(e).attr('i18n-key')];
						if (val) {
							$(e).html(val);
						}
					}
					if ($(e).attr('i18n-title')) {
						val = lang[$(e).attr('i18n-title')];
						if (val) {
							$(e).attr('title', val);
						}
					}
					if (typeof $(e).attr('i18n-if') === 'string') {
						if ($(e).attr('i18n-if') === config.compileLang) {
							$(e).removeAttr('i18n-if');
						} else {
							$(e).remove();
						}
					}
				}
				$('[i18n], [i18n-key], [i18n-title]')
					.removeAttr('i18n')
					.removeAttr('i18n-key')
					.removeAttr('i18n-title')
				;
				file.contents = Buffer.from($.html());
				this.push(file);
			}
			return callback();
		}))
		.pipe(dest('./dist/'))
};

exports.default = series(
	parallel(
		copyAssets,
		copyFonts,
		copyPublicFiles,
		i18n.compile
	),
	fontSpider,
	cleanUpOriginalFonts,
	parallel(
		cssMinify,
		htmlMinify
	)
)

exports.clean = cleanUpPreviousBuild
exports['i18n:extract'] = i18n.extractKeys