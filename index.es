import {Notifier} from './lib/notifier';
import {DBG_EXTRA_HANDLER_NAME} from './lib/constant';
import {remote} from 'electron';
import { EventEmitter } from 'events';

const {session} = remote
const ipc = remote.require('./lib/ipc')
const filter = {
    urls: ['*kcs/sound*']
}
let notifier = {};

function hackHowler() {
    window.getStore('layout.webview.ref').executeJavaScript(`(function () {
    try {
        const Howler = document.querySelector('#game_frame') ? document.querySelector('#game_frame').contentDocument.querySelector('#htmlWrap').contentWindow.Howler
        : document.querySelector('#htmlWrap') ? document.querySelector('#htmlWrap').contentWindow.Howler
        : window.Howler
        if (!Howler || Howler.__howls || !window.ipc.access('gameSound')) {
            return
        }
        const emitter = window.ipc.access('gameSound').event
        Howler.__howls = Howler._howls
        Howler._howls = new Proxy(Howler.__howls, {
            set: function(target, property, value, receiver) {
                target[property] = value
                if (value && value._src && property == target.length - 1) {
                    const src = Array.isArray(value._src) ? value._src[0] : value._src
                    emitter.emit('get-sound-url', src)
                }
                return true
            }
        })
    } catch(e) {
        return
    }
})()
`)
}

function recoverHowler() {
    window.getStore('layout.webview.ref').executeJavaScript(`(function () {
    try {
        const Howler = document.querySelector('#game_frame') ? document.querySelector('#game_frame').contentDocument.querySelector('#htmlWrap').contentWindow.Howler
        : document.querySelector('#htmlWrap') ? document.querySelector('#htmlWrap').contentWindow.Howler
        : window.Howler
        if (!Howler || !Howler.__howls) {
            return
        }
        Howler._howls = Howler.__howls
        delete Howler.__howls
    } catch(e) {
        return
    }
})()
`)
}

export const
    pluginDidLoad = (e) => {
        dbg.extra(DBG_EXTRA_HANDLER_NAME);
        notifier = new Notifier();
        notifier.initialize();
        if (!ipc.access('gameSound')) {
            ipc.register('gameSound', {
                event: new EventEmitter()
            })
        }
        ipc.access('gameSound').event.addListener('get-sound-url', notifier.handleResponseDetails)
        window.addEventListener('game.start', hackHowler);
        window.addEventListener('game.response', notifier.handleGameResponse);
        hackHowler()
    },
    pluginWillUnload = (e) => {
        ipc.access('gameSound').event.removeListener('get-sound-url', notifier.handleResponseDetails)
        window.removeEventListener('game.start', hackHowler);
        window.removeEventListener('game.response', notifier.handleGameResponse);
        recoverHowler();
    };

export {settingsClass} from './lib/settings';
