import { createStore } from 'framework7/lite';
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
        isDarkMode: true,
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
        clearUser({ state }, {}) {
            console.log("Clear UserInfos...");
            let acc: SVEAccount = state.user;
            state.user = undefined;
            let token_str = window.localStorage.getItem("sve_token");
            if (token_str !== null && token_str !== undefined) {
                new SVEToken(token_str, TokenType.DeviceToken, Number(window.localStorage.getItem("sve_user")), token => {
                    token.invalidate(acc);
                });
            }
        
            window.localStorage.removeItem("sve_token");
            window.localStorage.removeItem("sve_username");
            window.localStorage.removeItem("sve_user");
        
            let allCookies = document.cookie.split(';');
            for (let i = 0; i < allCookies.length; i++)
                document.cookie = allCookies[i] + "=;expires=" + new Date(0).toUTCString();
        
            //update complete webapp
            location.reload();
        },

        updateWebapp({ state }, {}) {
            window.caches.delete("/js/app.js").then(r => {
              window.caches.delete("/").then(r => {
                window.location.reload();
              }, err => window.location.reload());
            }, err => window.location.reload());
        },
        
        promptLogin({ state }, {}) {
            return state.onOpenLogin();
        },
        sendRequest({ state }, {msg}) { // request to service worker
            if (state.activeService !== undefined)
                state.activeService.postMessage(msg);
        },
    },
});

export default store;