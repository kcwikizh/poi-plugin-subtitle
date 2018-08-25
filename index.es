import { Notifier } from './lib/notifier';
import { DBG_EXTRA_HANDLER_NAME, CONFLICT_PLUGINS } from './lib/constant';
import { remote } from 'electron';

const { session } = remote
const filter = {
    urls: ['*kcs/sound*']
}
let notifier = {};

export const
    pluginDidLoad = (e) => {
        dbg.extra(DBG_EXTRA_HANDLER_NAME);
        notifier = new Notifier();
        notifier.initialize(() => {
            const __ = notifier.__.bind(notifier)
            session.defaultSession.webRequest.onBeforeRequest(filter, (e, c) => {
                notifier.handleResponseDetails(e)
                c({ cancel: false })
            });
            if (CONFLICT_PLUGINS && !!CONFLICT_PLUGINS.length) {
                const allEnalbedPlugins = getStore('plugins')
                    .filter(a => a.enabled) || []
                const allConflictPlugins = allEnalbedPlugins
                    .filter(plugin => CONFLICT_PLUGINS.includes(plugin.id))
                    .reduce((ret, plugin) => !!ret ? ret += `, ${plugin.name}` : plugin.name, '')
                if (!!allConflictPlugins) {
                    window.warn(__('Plugin Confict', allConflictPlugins), { priority: 99999 })
                }
            }
            window.addEventListener('game.response', notifier.handleGameResponse);
        });
    },
    pluginWillUnload = (e) => {
        session.defaultSession.webRequest.onBeforeRequest(filter, null);
        window.removeEventListener('game.response', notifier.handleGameResponse);
    };

export { settingsClass } from './lib/settings';
