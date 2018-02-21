import {PLUGIN_NAME, LANGS, I18N_DATA_BASEDIR, LOCALE_CONFIG_KEY} from './constant';
import {readJsonSync} from 'fs-extra'
import _ from 'lodash'

const readI18nResources = (filePath) => {
    try {
        let data = readJsonSync(filePath)
        data = _(data)
            .entries()
            .map(([key, v]) => [escapeI18nKey(key), v])
            .fromPairs()
            .value()
        return data
    } catch (e) {
        return {}
    }
}

let i18next

export class I18nService {

    _locale = '';

    constructor() {
        this._locale = I18nService.getLocale();
    }

    initialize = () => {
        try {
            i18next = require('i18next').createInstance()
            i18next.use(reactI18nextModule)
            .init({
                fallbackLng: false,
                resources: _(LANGS).map(locale => ([
                    locale,
                    {
                        translator: readOrIgnoreJsonSync(path.join(I18N_DATA_BASEDIR, `${locale}.json`)),
                    },
                ]))
                .fromPairs()
                .value(),
                returnObjects: true,
            })
            i18next.__ = i18next.getFixedT(this._locale)
        } catch (e) {
            i18next = new(require('i18n-2'))({
                locales: LANGS,
                defaultLocale: 'ja-JP',
                directory: I18N_DATA_BASEDIR,
                devMode: false,
                extension: '.json'
            });
            i18next.setLocale(this._locale);
            return [I18nService.getPluginI18n(), I18nService.getDataI18n()];
        }
    };

    static getLocale() {
        let locale = window.config.get(LOCALE_CONFIG_KEY);
        if (locale)
            return locale;
        locale = i18n[PLUGIN_NAME].locale;
        if (!LANGS.includes(locale)) {
            i18n[PLUGIN_NAME].setLocale('ja-JP');
            locale = 'ja-JP';
        }
        return locale;
    }

    static getPluginI18n()  {
        return (...arg) => i18n[PLUGIN_NAME].__(...arg);
    }

    static getDataI18n() {
        return (...arg) => i18next.__(...arg);
    }

    static setLocale(locale) {
        if (i18next.getFixedT) {
            i18next.__ = i18next.getFixedT(locale)
        } else {
            i18n[PLUGIN_NAME].setLocale(locale);
            i18next.setLocale(locale);
        }
        window.config.set(LOCALE_CONFIG_KEY, locale);
        this._locale = locale;
    }
}
