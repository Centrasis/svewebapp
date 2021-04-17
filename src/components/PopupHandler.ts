import store from '../components/store';
import NewGroupPopup from '../pages/NewGroupPopup';
import NewProjectPopup from '../pages/NewProjectPopup';
import QRCodeScanner from '../pages/QRCodeScanner';

export class PopupHandler {
    public static setPopupComponent(name: string, comp: NewGroupPopup | NewProjectPopup | QRCodeScanner ) {
        let m = store.state.popupComponent;
        m.set(name, comp);
        store.state.popupComponent = m;
    }

    public static getPopupComponent(name: string): NewGroupPopup | NewProjectPopup | QRCodeScanner {
        return store.state.popupComponent.get(name);
    }
}
