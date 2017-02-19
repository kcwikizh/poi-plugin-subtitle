import {Loader} from './loader';
import _ from 'lodash';
import {EXTRA_CATEGORIES} from './constant';
import {debug} from './util';
import {I18nService} from './i18n';
import {Traditionalized} from './traditionalized';

export class Notifier {

    private shipGraph = {};
    private subtitles = {};
    private voiceMap = {};
    private timeoutHandle = -1;
    private loader = new Loader();
    private i18nService = new I18nService();
    private __ = (x) => x;
    private ___ = (x) => x;

    public constructor() {
    }

    public initialize() {
        this.shipGraph = this.loader.getShipGraph();                       // Load ship graph data
        this.voiceMap = this.loader.getVoiceMap();
        if (_.isEmpty(this.shipGraph)) return;
        this.subtitles['ships'] = this.loader.getSubtitles();
        for (let category of EXTRA_CATEGORIES) {
            this.subtitles[category] = this.loader.getExtraSubtitles(category);
        }
        [this.__, this.___] = this.i18nService.initialize();
    }

    public handleResponseDetails(event) {
        let match = /kcs\/sound\/(.*?)\/(.*?).mp3/.exec(event.newURL);
        if (match && match.length == 3) {
            debug(event.newURL);
            let [...shipCode, filename] = match;
            switch (shipCode) {
                case 'kc9998':
                    this.handleExtraVoice('enemies', filename);
                    break;
                case 'kc9999':
                    this.handleExtraVoice('npc', filename);
                    break;
                case 'titlecall':
                    this.handleExtraVoice('titlecall', filename.replace('/', ''));
                    break;
                default:
                    this.handleShipVoice(shipCode, filename);
            }
        }
    }

    public handleGameResponse(event) {
        if (event.detail.path.includes('start2'))
            this.initialize();
        clearTimeout(this.timeoutHandle);
    }

    private handleShipVoice(shipCode, filename) {
        const apiId = this.shipGraph[shipCode.slice(2)];
        if (!apiId) return;
        const voiceId = this.voiceMap[apiId][filename];
        if (!voiceId) return;
        debug(`apiId: ${apiId}, voiceId: ${voiceId}`);
        let subtitles = this.subtitles['ships'];
        const quote = subtitles[apiId][voiceId];
        const {__, ___} = this;
        debug(`i18n: ${___(apiId+'.'+voiceId)}`);
        let priority = 5;
        if (voiceId > 8 && voiceId < 11)
            priority = 0;
        // shipName =
    }

    private handleExtraVoice(category, voiceId) {
        const subtitles = this.subtitles[category];
        const title = _.capitalize(category);
        const locale = this.i18nService.locale;
        if (!subtitles[voiceId]) {
            debug(`${title} subtitle missed: #${voiceId}`);
            return;
        }
        const entity = subtitles[voiceId];
        const name = entity.name;
        let quote = entity.jp;
        if (locale == 'zh-CN')
            quote = entity.zh;
        else if (locale == 'zh-TW')
            quote = Traditionalized(entity.zh);
        if (!quote) {
            debug(`${title} subtitle missed: #${voiceId}`);
            return;
        }
        if (name)
            this.display(`${name}: ${quote}`);
        else
            this.display(`${quote}`);
    }

    private display(text, priority=5, stickyFor=5000) {
        window.log(text, {priority, stickyFor});
    }
}

