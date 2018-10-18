import path from 'path';

export const EXTRA_CATEGORIES = ['enemies', 'npc', 'titlecall'];
export const VOICE_KEYS = [2475, 6547, 1471, 8691, 7847, 3595, 1767, 3311, 2507, 9651, 5321, 4473, 7117, 5947, 9489, 2669, 8741, 6149, 1301, 7297, 2975, 6413, 8391, 9705, 2243, 2091, 4231, 3107, 9499, 4205, 6013, 3393, 6401, 6985, 3683, 9447, 3287, 5181, 7587, 9353, 2135, 4947, 5405, 5223, 9457, 5767, 9265, 8191, 3927, 3061, 2805, 3273, 7331];
export const LANGS = ['zh-CN', 'zh-TW', 'ja-JP', 'en-US'];
export const REMOTE_HOST = 'https://acc.kcwiki.org/subtitles';
export const APPDATA_PATH = window.APPDATA_PATH;
export const BASE_DIR = path.join(__dirname, '../');
export const PACKAGE_INFO = require(path.join(BASE_DIR, 'package.json'));
export const PLUGIN_NAME = PACKAGE_INFO.name;
export const I18N_DATA_BASEDIR = path.join(APPDATA_PATH, PLUGIN_NAME, 'i18n');
export const DBG_EXTRA_HANDLER_NAME = 'subtitlesAudioResponse';
export const LOCALE_CONFIG_KEY = 'plugin.subtitle.locale';
export const FOREIGN_SHIPS = [126, 127, 128, 147, 155, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 191, 310, 311, 334, 347, 353, 358, 360, 361, 364, 365, 367, 372, 374, 375, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 403, 431, 432, 433, 436, 438, 439, 440, 441, 442, 443, 444, 446, 447, 448, 449, 483, 491, 492, 493, 494, 495, 496, 511, 512, 513, 515, 516, 519, 530, 535, 539, 544, 545, 549, 550, 561, 571, 574, 575, 576, 579, 580, 605, 606, 681];
