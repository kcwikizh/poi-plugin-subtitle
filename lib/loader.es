import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';
import fs from 'fs-extra';
import {EXTRA_CATEGORIES, LANGS, APPDATA_PATH, BASE_DIR, VOICE_KEYS, PLUGIN_NAME, REMOTE_HOST, I18N_DATA_BASEDIR} from './constant';
import {throwPluginError, encodeSoundFilename, debug} from './util';
import {Traditionalized} from './traditionalized';
import {I18nService} from './i18n';
const request = Promise.promisifyAll(require('request'));

export class Loader {

    _i18nDataPath = {};
    _i18nSourcePath = {};
    _extraSourcePath = {};
    _needUpdate = false;

    constructor() {
        LANGS.forEach((lang) => {
            this._i18nDataPath[lang] = path.join(I18N_DATA_BASEDIR, `${lang}.json`);
            this._i18nSourcePath[lang] = path.join(BASE_DIR, 'data', `${lang}.json`);
        });
        EXTRA_CATEGORIES.forEach((category) => {
            this._extraSourcePath[category] = path.join(BASE_DIR, 'data', `${category}.json`);
        });
    }

    getSubtitles = async () => {
        let data = {};
        let source = {};
        this._needUpdate = false;
        for (let lang of LANGS) {
            data[lang] = this._readSubtitleDataFile(lang);
            source[lang] = this._readSubtitleSourceFile(lang);
            if (!this._isSubtitleDataNew(data[lang], source[lang])) {
                data[lang] = _.cloneDeep(source[lang]);
                this._needUpdate = true;
            }

        }
        data = await this._fetchSubtitleUpdates(data);
        if (this._needUpdate)
            this._saveSubtitleData(data);
        return data;
    };

    _readSubtitleDataFile = (lang) => {
        let path = this._i18nDataPath[lang];
        fs.ensureFileSync(path);
        let data = fs.readJsonSync(path, { throws: false });
        if (!data || data.length === 0)
            data = {};
        return data;
    };

    _readSubtitleSourceFile = (lang) => {
        let path = this._i18nSourcePath[lang];
        let data = fs.readJsonSync(path, { throws: false});
        if (!data || data.length === 0)
            throwPluginError(`Source data not found: ${path}`);
        return data;
    };

    _isSubtitleDataNew = (data, source) => {
        if (_.isEmpty(data)) return false;
        if (!_.has(data, 'version')) throwPluginError(`Data version not found, try remove the plugin directory in ${APPDATA_PATH}`);
        if (!_.has(source, 'version')) throwPluginError(`Source version not found, please contact to us (https://github.com/kcwikizh/poi-plugin-subtitle/issues)`);
        debug(`Local data version is ${data['version']}, remote data version is ${source['version']}`);
        return +data.version >= +source.version;
    };

    _fetchSubtitleUpdates = async (data) => {
        let locale = I18nService.getLocale();
        let url;
        switch (locale) {
            case 'zh-CN':
                url = `${REMOTE_HOST}/diff/`;
                break;
            case 'zh-TW':
                url = `${REMOTE_HOST}/zh-tw/diff/`;
                break;
            case 'en-US':
                url = `${REMOTE_HOST}/en/diff`;
                break;
            default:
                url = `${REMOTE_HOST}/jp/diff/`;
                break;
        }
        url += data[locale].version;
        const backup = _.cloneDeep(data);
        const __ = I18nService.getPluginI18n();
        try {
            const responses = await request.getAsync(url);
            let responseBody = {};
            if (_.isArray(responses)) {
                responseBody = responses[1];
            } else {
                const response = responses;
                if (response.statusCode >= 300)
                    throwPluginError(`Network exception(${response.statusCode}): ${response.statusMessage}`);
                responseBody = response.body;
            }
            if (!responseBody)
                throwPluginError(`Fetch updates failed(${url}), responses: ${JSON.stringify(responses).slice(0, 300)}`);
            const updates = JSON.parse(responseBody);
            if (_.has(updates, 'version')) {
                const version = updates.version;
                this._assignSubtitle(data[locale], updates, (x) => x);
                this._needUpdate = true;
                window.success(`${__('Update Success')}(${version})`, {stickyFor: 3000});
            } else if (!_.isEmpty(updates)) {
                debug(response.body);
                let resBody = '' + response.body;
                throwPluginError(`Invalid subtitle updates: ${resBody.slice(0, 100)}`);
            }
        } catch (e) {
            console.error(e.message);
            console.error(e.stack);
            data = backup;
        }
        return data;
    };

    _assignSubtitle = (data, updates, process) => {
        for (let [key, value] of _.entries(updates)) {
            if (!_.isObject(value)) {
                data[key] = value;
            } else {
                let shipId = key;
                if(!_.has(data, shipId)) data[shipId] = {};
                for (let [voiceId, quote] of _.entries(value)) {
                    data[shipId][voiceId] = process(quote);
                }
            }
        }
    };

    _saveSubtitleData = (data) => {
        for (let lang of LANGS) {
            if (!_.isObject(data[lang]) || !_.has(data[lang], 'version')) {
                let dataStr = JSON.stringify(data[lang]).slice(0, 100);
                throwPluginError(`Invalid data(${lang}) for saveSubtitleData - ${dataStr}`);
            }
        }
        for (let lang of LANGS)
            fs.outputJsonSync(this._i18nDataPath[lang], data[lang]);
        debug('Subtitle data saved。');
    };

    getExtraSubtitles = (category) => {
        if (!EXTRA_CATEGORIES.includes(category))
            throwPluginError(`Invalid argument supplied for loadExtraSubtitles -- ${category}`);
        return fs.readJsonSync(this._extraSourcePath[category]);
    };

    getShipGraph = () => {
        let shipGraphData = {};
        let shipGraph = {};
        if (window.getStore) {
            shipGraphData = window.getStore('const.$shipgraph');
        } else {
            shipGraphData = JSON.parse(localStorage.start2Body)['api_mst_shipgraph'];
        }
        if (_.isEmpty(shipGraphData)) return;
        shipGraphData.forEach((graph) => {shipGraph[graph.api_filename] = graph.api_id;});
        return shipGraph;
    };

    getVoiceMap = () => {
        let voiceMap = {};
        for (let no=1; no<=800; no++) {
            voiceMap[no] = {};
            for(let vno=1; vno <= VOICE_KEYS.length; vno++) {
                voiceMap[no][encodeSoundFilename(no, vno)] = vno;
            }
            // HACK: 联合舰队的语音文件名并未加密
            voiceMap[no]['141'] = 141;
        }
        return voiceMap;
    };
}