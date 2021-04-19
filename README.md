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