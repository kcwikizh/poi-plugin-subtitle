import { Notifier } from './lib/notifier';
import { DBG_EXTRA_HANDLER_NAME } from './lib/constant';

import { ResourceNotifier } from 'views/services/resource-notifier'

let notifier = {};

export const
    pluginDidLoad = (e) => {
        dbg.extra(DBG_EXTRA_HANDLER_NAME);
        notifier = new Notifier();

        notifier.handleSountRequest = function (e) {
            if (e.url.includes('/kcs/sound/')) {
                try {
                    notifier.handleResponseDetails(e)
                } catch (err) {
                    console.error(err)
                }
            }
        };
        notifier.initialize(() => {
            const __ = notifier.__.bind(notifier)
            window.addEventListener('game.response', notifier.handleGameResponse);
            ResourceNotifier.addListener('request', notifier.handleSountRequest);
        });
    },
    pluginWillUnload = (e) => {
        ResourceNotifier.removeListener('request', notifier.handleSountRequest);
        window.removeEventListener('game.response', notifier.handleGameResponse);
    };

export { settingsClass } from './lib/settings';
