import store from '../components/store';

export class PopupHandler {
    public static setPopupComponent(name: string, comp: React.Component) {
        let m = store.state.popupComponent;
        m.set(name, comp);
        store.state.popupComponent = m;
    }

    public static getPopupComponent(name: string): React.Component {
        return store.state.popupComponent.get(name);
    }
}
