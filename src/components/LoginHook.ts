import { LoginState, SVEAccount } from "svebaselib";
import store from "./store";

export class LoginHook {
    protected static onLoginHooks: ((user: SVEAccount) => void)[] = []

    public static add(hook: (user: SVEAccount) => void) {
        LoginHook.onLoginHooks.push(hook);
    }

    public static call(user: SVEAccount) {
        LoginHook.onLoginHooks.forEach(h => h(user));
    }

    public static tryRestoreUserSession(): Promise<void> {
        let sessionID = window.sessionStorage.getItem("sessionID");
        return new Promise<void>((resolve, reject) => {
          if (sessionID !== undefined && sessionID !== "") {
            new SVEAccount(sessionID, (usr) => {
              if (usr.getLoginState() !== LoginState.NotLoggedIn) {
                store.state.user = usr;
                LoginHook.call(usr);
                resolve();
              } else {
                reject();
              }
            });
          }
        });    
    }
}