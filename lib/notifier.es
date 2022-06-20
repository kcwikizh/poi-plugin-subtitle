import { Loader } from './loader';
import _ from 'lodash';
import i18next from 'views/env-parts/i18next'
import { EXTRA_CATEGORIES } from './constant';
import { debug, timeToNextHour } from './util';
import { I18nService } from './i18n';
import { Traditionalized, t2s } from './traditionalized';
const { getStore } = window;

export class Notifier {

    _shipGraph = {};
    _subtitles = {};
    _voiceMap = {};
    _timeoutHandle = -1;
    _loader = new Loader();
    __ = (x) => x;
    __r = (x) => x;
    ___ = (x) => x;

    constructor() {
    }

    initialize = (callback) => {
        this._ships = getStore('const.$ships');
        this._shipGraph = this._loader.getShipGraph();                       // Load ship graph data
        this._voiceMap = this._loader.getVoiceMap();
        if (_.isEmpty(this._shipGraph)) return;
        for (let category of EXTRA_CATEGORIES) {
            this._subtitles[category] = this._loader.getExtraSubtitles(category);
        }
        this._loader.getSubtitles().then((data) => {
            this._subtitles.ships = data;
            this.__ = I18nService.getPluginI18n();
            this.__r = x => i18next.getFixedT(I18nService.getLocale(), 'resources')(x);
            this.___ = I18nService.getDataI18n();
            callback && callback()
        });
    }

    handleResponseDetails = (event) => {
        if (!getStore('layout.webview.ref') || (
            getStore('layout.webview.ref').isReady() &&
            event.webContentsId === getStore('layout.webview.ref').getWebContents().id
        )) {
            const match = /kcs\/sound\/(.*?)\/(.*?).mp3/.exec(event.url);
            if (match && match.length === 3) {
                debug(event.url);
                const [, shipCode, filename] = match;
                switch (shipCode) {
                    case 'kc9998':
                        this._handleExtraVoice('enemies', filename);
                        break;
                    case 'kc9999':
                        this._handleExtraVoice('npc', filename);
                        break;
                    case 'titlecall':
                        this._handleExtraVoice('titlecall', filename.replace('/', ''));
                        break;
                    default:
                        this._handleShipVoice(shipCode, filename);
                }
            }
        }
    }

    handleGameResponse = (event) => {
        clearTimeout(this._timeoutHandle);
    }
  
    _handleShipVoice = (shipCode, filename) => {
        const apiId = this._shipGraph[shipCode.slice(2)];
        if (!apiId) return;
        const voiceId = this._voiceMap[apiId][filename];
        if (!voiceId) return;
        debug(`apiId: ${apiId}, voiceId: ${voiceId}`);
        let subtitles = this._subtitles['ships'];
        const locale = I18nService.getLocale();
        const quote = subtitles[locale][apiId] ? subtitles[locale][apiId][voiceId] : '';
        const { __, __r, ___ } = this;
        debug(`i18n: ${___(apiId + '.' + voiceId)}`);
        let priority = 5;
        if (voiceId > 8 && voiceId < 11)
            priority = 0;
        const shipName = __r(this._ships[apiId].api_name);
        if (voiceId < 30 || voiceId === 141 || voiceId === 241) {
            if (!quote) {
                this._display(__('Subtitle Miss', shipName), priority);
                return;
            }
            this._display(`${shipName}: ${___(apiId + '.' + voiceId)}`, priority);
        } else {
            const scheduledTime = timeToNextHour();
            this._timeoutHandle = setTimeout(() => {
                if (!quote) {
                    this._display(__('Subtitle Miss', shipName), priority);
                    return;
                }
                this._display(`${shipName}: ${___(apiId + '.' + voiceId)}`, priority);
            }, scheduledTime);
        }
    }

    _handleExtraVoice = (category, voiceId) => {
        const subtitles = this._subtitles[category];
        const title = _.capitalize(category);
        if (!subtitles[voiceId]) {
            debug(`${title} subtitle missed: #${voiceId}`);
            return;
        }
        const entity = subtitles[voiceId];
        if (_.isArray(entity)) {
            this._handleShortDrama(entity);
            return;
        }
        const name = this.__r(entity.name);
        const quote = this._getQuoteByLocale(entity);
        if (!quote) {
            debug(`${title} subtitle missed: #${voiceId}`);
            return;
        }
        if (name)
            this._display(`${name}: ${quote}`);
        else
            this._display(`${quote}`);
    }

    _handleShortDrama(entities) {
        for (const entity of entities) {
            const time = entity.time;
            const name = this.__r(entity.name);
            const quote = this._getQuoteByLocale(entity);
            setTimeout(() => {
                this._display(`${name}: ${quote}`);
            }, time);
        }
    }

    _getQuoteByLocale(entity) {
        const locale = I18nService.getLocale();
        let quote = entity.jp;
        if (locale === 'zh-CN')
            quote = t2s(entity.zh);
        else if (locale === 'en-US' && entity.en)
            quote = entity.en;
        else if (locale === 'zh-TW')
            quote = Traditionalized(entity.zh);
        return quote;
    }

    _display = (text, priority = 5, stickyFor = 5000) => {
        window.log(text, { priority, stickyFor });
    }
}

