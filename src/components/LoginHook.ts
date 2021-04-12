export class LoginHook {
    protected static onLoginHooks: (() => void)[] = []

    public static add(hook: () => void) {
        LoginHook.onLoginHooks.push(hook);
    }

    public static call() {
        LoginHook.onLoginHooks.forEach(h => h());
    }
}