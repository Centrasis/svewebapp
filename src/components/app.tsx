import React from 'react';

import {
  App,
  Panel,
  View,
  Page,
  Navbar,
  List,
  ListItem,
  Actions,
  ActionsButton,
  ActionsLabel,
  ActionsGroup,
  Icon,
} from 'framework7-react';

import routes from '../js/routes';
import store from './store';
import {SVESystemInfo} from 'svebaselib';
import { f7, f7ready } from 'framework7-react';
import { MultiMediaDeviceHandler } from './multimediadevicehandler';
import { SideMenue } from './SideMenue';
import { getDevice } from 'framework7';


export default class extends React.Component {
  protected f7params = {
    name: 'sve-online', // App name
    theme: 'auto', // Automatic theme detection
    id: "sve.felixlehner.de",
    version: "1.0.0",
    iosTranslucentBars: true,
    externalLinks: ".external",
    notification: {
      title: 'SVE Media',
      closeTimeout: 3000,
    },
    // App store
    store: store,
    // App routes
    routes: routes,
  };

  constructor(props) {
    super(props);

    SVESystemInfo.getInstance().sources.sveService = window.location.hostname.replace("www.", "media.").replace("sve.", "media.");
    SVESystemInfo.getInstance().sources.authService = window.location.hostname.replace("www.", "accounts.").replace("sve.", "accounts.") + "/auth";
    SVESystemInfo.getInstance().sources.accountService = window.location.hostname.replace("www.", "accounts.").replace("sve.", "accounts.");
    SVESystemInfo.getInstance().sources.gameService = window.location.hostname.replace("www.", "games.").replace("sve.", "games.");
    SVESystemInfo.getInstance().sources.aiService = window.location.hostname.replace("www.", "ai.").replace("sve.", "ai.");

    try {
      if (process !== undefined) {
        SVESystemInfo.getInstance().sources.sveService = process.env.sveAPI;
        SVESystemInfo.getInstance().sources.authService = process.env.authAPI;
        SVESystemInfo.getInstance().sources.accountService = process.env.accountsAPI;
        SVESystemInfo.getInstance().sources.gameService = process.env.gameAPI;
        SVESystemInfo.getInstance().sources.aiService = process.env.aiAPI;
      }
    } catch {

    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).then(function(reg) {
        // Registrierung erfolgreich
        console.log('Registrierung erfolgreich. Scope ist ', reg.scope);
        //reg.showNotification("Update erfolgreich!");
      }).catch(function(error) {
        // Registrierung fehlgeschlagen
        console.log('Registrierung fehlgeschlagen mit ' + error);
      });
    };
  }

  render() {
    return (
      <App 
        { ...this.f7params } 
        themeDark={store.state.isDarkMode}>

        {/* Your main view, should have "view-main" class */}
        <View main className="safe-areas" url="/"/>

        {/* Right panel with cover effect*/}
        <Panel right cover themeDark={store.state.isDarkMode}>
          <View browserHistory>
            <Page>
              <Navbar title={`${SideMenue.getCurrentRightMenu().caption}`}/>
              <List>
                {SideMenue.getCurrentRightMenu().subMenuItems.map((item) => (item !== undefined) ? (
                  <ListItem 
                    panelClose="right"
                    title={item.caption}
                    onClick={() => {
                      var click = item.onClick.bind(this);
                      click();
                      f7.panel.close("right", true);
                      f7.panel.close("left", true);
                    }}
                    className="button"
                    style={(item.color !== undefined) ? {color: item.color} : {}}
                  />
                ) : "")}
                <ListItem panelClose="right"/>
              </List>
            </Page>
          </View>
        </Panel>
        
        {(store.state.selectDevicesInfo !== undefined) ? 
          <Actions grid={true} opened={store.state.selectDevicesInfo !== undefined} onActionsClosed={() => store.state.selectDevicesInfo = undefined}>
            <ActionsGroup>
              <ActionsLabel>Wähle Kamera (aktuell: {(store.state.selectDevicesInfo.selected !== undefined) ? MultiMediaDeviceHandler.getDeviceCaption(store.state.selectDevicesInfo.selected) : "Auto"})</ActionsLabel>
              {store.state.selectDevicesInfo.selections.map(dev => (
                <ActionsButton 
                  key={dev.deviceId}
                  onClick={() => { window.localStorage.setItem("cameraDevice", MultiMediaDeviceHandler.getDeviceCaption(dev)); }}
                >
                  <video slot="media" width="48" id={"camExample-" + dev.deviceId}></video>
                  <span>{MultiMediaDeviceHandler.getDeviceCaption(dev)}</span>
                </ActionsButton>
              ))}
              <ActionsButton color="green" onClick={() => { window.localStorage.removeItem("cameraDevice"); }}>
                <Icon slot="media" f7="sparkles"></Icon>
                <span>Auto</span>
              </ActionsButton>
              <ActionsButton color="red" close>
                <Icon slot="media" f7="arrow_down"></Icon>
                <span>Cancel</span>
              </ActionsButton>
            </ActionsGroup>
          </Actions>
        : ""}
      </App>
    )
  }

  protected parseLink() {
    if(location.search.length > 1) {
      let params = new Map();
      let vars = location.search.substring(1).split('&');
      for (var i = 0; i < vars.length; i++) {
        let pair = vars[i].split('=');
        params.set(pair[0], decodeURI(pair[1]));
      }

      store.state.routerParams = params;

      if(params.has("debug")) {
        console.log("Debug mode on!");
        store.state.debugMode = true;
      }

      if(params.has("page")) {
        console.log("Found page request: " + params.get("page"));
        f7.view.main.router.navigate("/" + params.get("page") + "/")
      }
    }
  }

  protected onWorkerMessage(msg) {
    console.log("Worker message: " + JSON.stringify(msg));
  }

  public componentDidMount() {
    var self = this;
    f7ready((f7) => {
      SideMenue.setApp(self);
      if (getDevice().standalone) {
        store.state.saveThisDevice = true;
      }

      // listen to service worker events
      navigator.serviceWorker.addEventListener("message", (evt) => {
        self.onWorkerMessage(evt.data);
      });

      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          store.state.activeService = registration.active;
          store.dispatch("sendRequest", "Startup!");
        }
      });

      SVESystemInfo.getFullSystemState().then(state => {
        self.parseLink();
      }, err => {
        console.log("Error on init: " + JSON.stringify(err));
        f7.dialog.alert("Der SVE Server ist nicht erreichbar! Bitte mit dem Admin kontakt aufnehmen.", "Server nicht erreichbar!");
      });
    });
  }
};