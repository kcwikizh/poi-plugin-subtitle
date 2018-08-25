import _ from 'lodash';
import { VOICE_KEYS, PLUGIN_NAME, DBG_EXTRA_HANDLER_NAME } from './constant';

export const throwPluginError = (message) => {
    throw new Error(`[${PLUGIN_NAME}]: ${message}`);
};

export const encodeSoundFilename = (shipId, voiceId) => {
    return (shipId + 7) * 17 * VOICE_KEYS[voiceId - 1] % 99173 + 100000;
};

export const debug = (message) => {
    if (dbg.extra(DBG_EXTRA_HANDLER_NAME).isEnabled())
        console.log(message);
};

export const timeToNextHour = () => {
    let now = new Date();
    let sharpTime = new Date();
    sharpTime.setHours(now.getHours() + 1);
    sharpTime.setMinutes(0);
    sharpTime.setSeconds(0);
    sharpTime.setMilliseconds(0);
    return sharpTime - now < 0 ? 0 : sharpTime - now;
};