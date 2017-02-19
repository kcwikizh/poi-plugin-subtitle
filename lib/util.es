import _ from 'lodash';
import {VOICE_KEYS, PLUGIN_NAME} from './constant';

export const throwPluginError = (message) => {
    throw new Error(`[${PLUGIN_NAME}]: ${message}`);
};

export const encodeSoundFilename = (shipId, voiceId) => {
    return (shipId + 7) * 17 * (VOICE_KEYS[voiceId] - VOICE_KEYS[voiceId -1]) % 99173 + 100000;
};

export const debug = (message) => {
    if (dbg.extra('subtitlesAudioResponse').isEnabled())
        console.log(message);
};
