import { createStore } from 'framework7/lite';
import { f7, f7ready, theme } from 'framework7-react';
import { SVEAccount, SVEToken, TokenType } from 'svebaselib';

const store = createStore({
    state: {
        user: undefined as (SVEAccount | undefined),
        debugMode: false,
        error: {
            has: false,
            msg: ""
        },
        saveThisDevice: false,
        selectDevicesInfo: undefined as {
            selections: MediaDeviceInfo[],
            selected: string
        },
        popupComponent: new Map<string, any>(),
        hasCameraPermission: false,
        onLoginHooks: [],
        activeService: undefined,
        routerParams: new Map(),
    },
    getters: {
        getUser({ state }) {
            return state.user;
        },
        getRouterParams({ state }) {
            return state.routerParams;
        },
        getIsMobileDataConnection({ state }) {
            try {
              /*let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
              let type = connection.NetworkInformation.type;
              return (type !== "wifi" && type !== "ethernet")*/
              return false;
            } catch {
              return false;
            }
        },
    },
    actions: {
        clearUser({ state }) {
            state.user = undefined;
        },
        
        promptLogin({ state }) {
            return state.onOpenLogin();
        },
        sendRequest({ state }, msg) { // request to service worker
            if (state.activeService !== undefined)
                state.activeService.postMessage(msg);
        },
    },
});

export default store;