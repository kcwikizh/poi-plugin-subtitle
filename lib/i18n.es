import {PLUGIN_NAME, LANGS, I18N_DATA_BASEDIR} from './constant';

export class I18nService {

    private locale = '';

    constructor() {
        this.locale = I18nService.getLocale();
    }

    public initialize() {
        i18n[`${PLUGIN_NAME}-data`] = new(require('i18n-2'))({
            locales: LANGS,
            defaultLocale: 'ja-JP',
            directory: I18N_DATA_BASEDIR,
            devMode: false,
            extension: '.json'
        });
        i18n[`${PLUGIN_NAME}-data`].setLocale(locale);
        return [this.getPluginI18n(), this.getDataI18n()];
    }

    public static getLocale() {
        let locale = i18n[PLUGIN_NAME].locale;
        if (!LANGS.includes(locale)) {
            i18n[PLUGIN_NAME].setLocale('ja-JP');
            locale = 'ja-JP';
        }
        return locale;
    }

    public getPluginI18n() {
        return i18n[PLUGIN_NAME].__.bind(i18n[PLUGIN_NAME]);
    }

    public getDataI18n() {
        return i18n[PLUGIN_NAME + '-data'].__.bind(i18n[PLUGIN_NAME + '-data']);
    }
}