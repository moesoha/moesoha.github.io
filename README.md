# Soha's Personal Home Page

For English please visit [sohaj.in](https://sohaj.in), 中文请访问 [jin.sh](https://jin.sh).

## How to compile

For example, compile for Chinese:

```
yarn install
COMPILE_LANG=zh NODE_ENV=production yarn build
```

## How to use i18n

Run `yarn build i18n:extract`, and languages defined in `config.langsKeyToGenerate` in gulpfile.js will be updated to `./i18n/` . This operation will not discard the old translations.

After translated strings in the i18n folder, run `yarn build` with environment variable `COMPILE_LANG` will generate the compiled HTML in `./dist/` .

## How to use i18n-id

```html
<div i18n-id="id1">content</div>
```

Adding the `i18n-id` attribute for a tag can control whether the tag will be rendered given compile-time option `COMPILE_ID`, e.g. the following command would render the tag whereas when `COMPILE_ID=id2` the tag would not be included.

```
COMPILE_ID=id1 yarn build
```

Note that when `COMPILE_ID=''` or when this option is not provided, all id are assumed and all contents are rendered.

```html
<div i18n-id="id1" i18n-if="zh">content</div>
```

Another advanced usage example. When `COMPILE_ID=id1` and `COMPILE_LANG=zh` the tag would be shown.
