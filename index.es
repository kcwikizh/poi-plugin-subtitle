import { Notifier } from './lib/notifier';
import { DBG_EXTRA_HANDLER_NAME } from './lib/constant';
import { remote } from 'electron';

const { session } = remote
const filter = {
    urls: [
        'http://*/kcs/sound/*',
        'https://*/kcs/sound/*'
    ]
}
let notifier = {};

export const
    pluginDidLoad = (e) => {
        dbg.extra(DBG_EXTRA_HANDLER_NAME);
        notifier = new Notifier();
        notifier.initialize(() => {
            const __ = notifier.__.bind(notifier)
            session.defaultSession.webRequest.onBeforeRequest(filter, (e, c) => {
                try {
                    notifier.handleResponseDetails(e)
                } catch (err) {
                    console.error(err)
                }
                c({ cancel: false })
            });
            window.addEventListener('game.response', notifier.handleGameResponse);
        });
    },
    pluginWillUnload = (e) => {
        session.defaultSession.webRequest.onBeforeRequest(filter, null);
        window.removeEventListener('game.response', notifier.handleGameResponse);
    };

export { settingsClass } from './lib/settings';
