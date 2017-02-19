import _ from 'lodash';
import path from 'path';
import fs from 'fs-extra';
import Promise from 'bluebird';
import request from 'request';
Promise.promisifyAll(fs);
Promise.promisifyAll(request);
import {EXTRA_CATEGORIES, LANGS, APPDATA_PATH, BASE_DIR, VOICE_KEYS, PLUGIN_NAME, REMOTE_HOST, I18N_DATA_BASEDIR} from './constant';
import {throwPluginError, encodeSoundFilename, debug} from './util';
import {Traditionalized} from './traditionalized';
import {I18nService} from './i18n';


export class Loader {

    private i18nDataPath = {};
    private i18nSourcePath = {};
    private extraSourcePath = {};
    private needUpdate = false;

    constructor() {
        LANGS.forEach((lang) => {
            this.i18nDataPath[lang] = path.join(I18N_DATA_BASEDIR, `${lang}.json`);
            this.i18nSourcePath[lang] = path.join(BASE_DIR, 'data', `${lang}.json`);
        });
        EXTRA_CATEGORIES.forEach((category) => {
            this.extraSourcePath[category] = path.join(BASE_DIR, 'data', `${category}.json`);
        });
    }

    public getSubtitles() {
        let data = {};
        let source = {};
        this.needUpdate = false;
        for (let lang of LANGS) {
            data[lang] = this.readSubtitleDataFile(lang);
            if (lang == 'zh-TW') continue;
            source[lang] = this.readSubtitleSourceFile(lang);
            if (!this.isSubtitleDataNew(data[lang], source[lang])) {
                data[lang] = _.cloneDeep(source[lang]);
                this.needUpdate = true;
            }
        }
        data = this.fetchSubtitleUpdates(data);
        this.traditionalize(data);
        if (this.needUpdate)
            this.saveSubtitleData(data);
        return data;
    }

    private readSubtitleDataFile = async (lang)  => {
        let path = this.i18nDataPath[lang];
        await fs.ensureFileAsync(path);
        let data = await fs.readFileAsync(path);
        if (!data || data.length === 0)
            data = "{}";
        return JSON.parse(data);
    };

    private readSubtitleSourceFile = async (lang) => {
        let path = this.i18nSourcePath[lang];
        let data = await fs.readFileAsync(path);
        if (!data || data.length === 0)
            throwPluginError(`Source data not found: ${path}`);
        return JSON.parse(data);
    };

    private isSubtitleDataNew(data, source) {
        if (_.isEmpty(data)) return false;
        if (!_.has(data, 'version')) throwPluginError(`Data version not found, try remove the plugin directory in ${APPDATA_PATH}`);
        if (!_.has(source, 'version')) throwPluginError(`Source version not found, please contact to us (https://github.com/kcwikizh/poi-plugin-subtitle/issues)`);
        return +data.version >= +source.version;
    }

    private traditionalize(data) {
        if (_.has(data['zh-TW'], 'version') && this.isSubtitleDataNew(data['zh-TW'], data['zh-CN'])) return;
        this.assignSubtitle(data['zh-TW'], data['zh-CN'], Traditionalized);
    }

    private fetchSubtitleUpdates = async (data) => {
        let locale = I18nService.getLocale();
        locale = (locale == 'zh-TW') ? 'zh-CN' : locale;                                        // To Comment
        let abbr = locale.slice(0, 2);
        abbr = (abbr == 'ja') ? 'jp' : abbr;                                                    // To Comment
        let url = (abbr == 'zh') ? `${REMOTE_HOST}/diff/` : `${REMOTE_HOST}/${abbr}/diff/`;
        url += data[locale].version;
        let backup = _.cloneDeep(data);
        try {
            let response = await request.getAsync(url);
            if (response.statusCode >= 300)
                throwPluginError(`Network exception(${response.statusCode}): ${response.statusMessage}`);
            let updates = JSON.parse(response.body);
            if (_.isEmpty(updates) || _.has(updates, 'version')) {
                debug(response.body);
                let resBody = '' + response.body;
                throwPluginError(`Invalid subtitle updates: ${resBody.slice(0, 100)}`);
            }
            this.assignSubtitle(data, updates, (x)=>x);
            this.needUpdate = true;
        } catch (e) {
            console.error(e.message);
            console.error(e.stack);
            data = backup;
        }
        return data;
    };

    private assignSubtitle(data, updates, process) {
        for (let [key, value] of _.entries(updates)) {
            if (!_.isObject(value)) {
                data[key] = value;
            } else {
                let key = shipId;
                if(!_.has(data, shipId)) data[shipId] = {};
                for (let [voiceId, quote] of _.entries(value)) {
                    data[shipId][voiceId] = process(value);
                }
            }
        }
    }

    private saveSubtitleData = async (data) => {
        for (let lang of LANGS) {
            if (!_.isObject(data[lang]) || !_.has(data[lang], 'version')) {
                let dataStr = JSON.stringify(data[lang]).slice(0, 100);
                throwPluginError(`Invalid data(${lang}) for saveSubtitleData - ${dataStr}`);
            }
        }
        for (let lang of LANGS)
            await fs.writeFileAsync(this.i18nDataPath[lang], data[lang]);
    };

    public getExtraSubtitles = async (category) => {
        if (!EXTRA_CATEGORIES.includes(category))
            throwPluginError(`Invalid argument supplied for loadExtraSubtitles -- ${category}`);
        let data = await fs.readFileAsync(this.extraSourcePath[category]);
        return JSON.parse(data);
    }

    public getShipGraph() {
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
    }

    public getVoiceMap() {
        let voiceMap = {};
        for (let no=1; no<=600; no++) {
            voiceMap[no] = {};
            for(let vno=1; vno <= VOICE_KEYS.length; vno++) {
                voiceMap[no][encodeSoundFilename(no, vno)] = vno;
            }
        }
        return voiceMap;
    }
}