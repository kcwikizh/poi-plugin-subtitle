import path from 'path';

export const EXTRA_CATEGORIES = ['enemies', 'npc', 'titlecall'];
export const VOICE_KEYS = [604825,607300,613847,615318,624009,631856,635451,637218,640529,643036,652687,658008,662481,669598,675545,685034,687703,696444,702593,703894,711191,714166,720579,728970,738675,740918,743009,747240,750347,759846,764051,770064,773457,779858,786843,790526,799973,803260,808441,816028,825381,827516,832463,837868,843091,852548,858315,867580,875771,879698,882759,885564,888837,896168];
export const LANGS = ['zh-CN', 'zh-TW', 'ja-JP', 'en-US'] ;
export const REMOTE_HOST = 'https://acc.kcwiki.org/subtitles';
export const APPDATA_PATH = window.APPDATA_PATH;
export const BASE_DIR = path.join(__dirname, '../');
export const PACKAGE_INFO = require(path.join(BASE_DIR, 'package.json'));
export const PLUGIN_NAME = PACKAGE_INFO.name;
export const I18N_DATA_BASEDIR = path.join(APPDATA_PATH, PLUGIN_NAME, 'i18n');
export const DBG_EXTRA_HANDLER_NAME = 'subtitlesAudioResponse';
export const LOCALE_CONFIG_KEY = 'plugin.subtitle.locale';
