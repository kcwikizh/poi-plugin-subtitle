import {Notifier} from './lib/notifier';

export const
    pluginDidLoad = (e) => {
        notifier = Notifier();
        notifier.initialize();
        $('kan-game webview').addEventListener('did-get-response-details', notifier.handleResponseDetails);
        window.addEventListener('game.response', notifier.handleGameResponse);
    },
    pluginWillUnload = (e) => {
        $('kan-game webview').removeEventListener('did-get-response-details', notifier.handleResponseDetails);
        window.removeEventListener('game.response', notifier.handleGameResponse);
    },
    show = false;