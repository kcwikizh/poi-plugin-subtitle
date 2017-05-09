import {Notifier} from './lib/notifier';
import {DBG_EXTRA_HANDLER_NAME} from './lib/constant';

let notifier = {};

export const
    pluginDidLoad = (e) => {
        dbg.extra(DBG_EXTRA_HANDLER_NAME);
        notifier = new Notifier();
        notifier.initialize();
        $('kan-game webview').addEventListener('did-get-response-details', notifier.handleResponseDetails);
        window.addEventListener('game.response', notifier.handleGameResponse);
    },
    pluginWillUnload = (e) => {
        $('kan-game webview').removeEventListener('did-get-response-details', notifier.handleResponseDetails);
        window.removeEventListener('game.response', notifier.handleGameResponse);
    },
    show = false;