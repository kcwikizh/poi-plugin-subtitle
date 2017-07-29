import {PLUGIN_NAME, LANGS, I18N_DATA_BASEDIR, LOCALE_CONFIG_KEY} from './constant';

export class I18nService {

    _locale = '';

    constructor() {
        this._locale = I18nService.getLocale();
    }

    initialize = () => {
        i18n[`${PLUGIN_NAME}-data`] = new(require('i18n-2'))({
            locales: LANGS,
            defaultLocale: 'ja-JP',
            directory: I18N_DATA_BASEDIR,
            devMode: false,
            extension: '.json'
        });
        i18n[`${PLUGIN_NAME}-data`].setLocale(this._locale);
        return [I18nService.getPluginI18n(), I18nService.getDataI18n()];
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
        return i18n[PLUGIN_NAME].__.bind(i18n[PLUGIN_NAME]);
    }

    static getDataI18n() {
        return i18n[PLUGIN_NAME + '-data'].__.bind(i18n[PLUGIN_NAME + '-data']);
    }

    static setLocale(locale) {
        i18n[PLUGIN_NAME].setLocale(locale);
        i18n[`${PLUGIN_NAME}-data`].setLocale(locale);
        window.config.set(LOCALE_CONFIG_KEY, locale);
        this._locale = locale;
    }
}