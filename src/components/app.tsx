import React from 'react';

import {
  App,
  Panel,
  Col,
  Row,
  Views,
  View,
  Toggle,
  Page,
  Navbar,
  Toolbar,
  Link,
  LoginScreen,
  LoginScreenTitle,
  List,
  ListItem,
  ListInput,
  ListButton,
  BlockFooter,
  BlockHeader,
  NavTitle,
  NavTitleLarge,
  Block,
  Sheet,
  PageContent,
  NavRight,
  AccordionContent,
  Actions,
  ActionsButton,
  ActionsLabel,
  ActionsGroup,
  Icon,
  BlockTitle
} from 'framework7-react';

import Dom7 from 'dom7';
import routes from '../js/routes';
import store from './store';
import {SVESystemInfo, SVEAccount, LoginState, SVEToken, TokenType} from 'svebaselib';
import { f7, f7ready, theme } from 'framework7-react';
import { MultiMediaDeviceHandler } from './multimediadevicehandler';
import { LoginHook } from './LoginHook';
import { SideMenue } from './SideMenue';
import { getDevice } from 'framework7';

interface LoginData {
  username: string;
  password: string;
  token?: SVEToken;
}

interface RegisterData extends LoginData {
  password2: string;
  email: string;
}

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

  protected loginData: LoginData | RegisterData;

  protected loginMessages = {
    errorMsg: '',
    loginType: ''
  };

  protected openOverlay: "login-screen" | "register-screen" | undefined = undefined;
  protected showInstallHint: boolean = false;
  protected no_install: boolean = false;

  constructor(props) {
    super(props);

    SVESystemInfo.getInstance().sources.sveService = process.env.sveAPI || window.location.hostname.replace("www.", "media.").replace("sve.", "media.");
    SVESystemInfo.getInstance().sources.authService = process.env.authAPI || window.location.hostname.replace("www.", "accounts.").replace("sve.", "accounts.") + "/auth";
    SVESystemInfo.getInstance().sources.accountService = process.env.accountsAPI || window.location.hostname.replace("www.", "accounts.").replace("sve.", "accounts.");
    SVESystemInfo.getInstance().sources.gameService = process.env.gameAPI || window.location.hostname.replace("www.", "games.").replace("sve.", "games.");
    SVESystemInfo.getInstance().sources.aiService = process.env.aiAPI || window.location.hostname.replace("www.", "ai.").replace("sve.", "ai.");

    this.loginData = {
      username: "",
      password: ""
    };

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

  public tryRestoreUserSession(): Promise<void> {
    let sessionID = window.sessionStorage.getItem("sessionID");
    return new Promise<void>((resolve, reject) => {
      if (sessionID !== undefined && sessionID !== "") {
        new SVEAccount(sessionID, (usr) => {
          if (usr.getLoginState() !== LoginState.NotLoggedIn) {
            store.state.user = usr;
            f7.loginScreen.close();
            this.openOverlay = undefined;
            this.forceUpdate();
            resolve();
          } else {
            reject();
          }
        });
      } else {
        this.checkForToken().then(() => resolve(), err =>  reject());
      }
    });    
  }

  render() {
    return (store.state.error.has) ? (
      <App 
        { ...this.f7params } 
        themeDark>
        <View>
          <Page>
            <Navbar large sliding={false}>
              <NavTitle sliding>Ein kritischer Fehler trat auf!</NavTitle>
              <NavTitleLarge>Ein kritischer Fehler trat auf!</NavTitleLarge>
              <NavRight>
                <Link external iconF7="text_bubble" tooltip="Fehler melden" href={"mailto:info@felixlehner.de?subject=Webseitenfehler&body=Fehler%20trat%20auf%3A%0D%0A" + store.state.error.msg.replace("\\n", "\n")} />
                <Link style={{color: "green"}} iconF7="tornado" tooltip="Fehler auflösen" onClick={() => window.location.reload()} />
              </NavRight>
            </Navbar>
            <Block>
              <p>
                Es ist ein kritischer Fehler in der Webapp aufgetreten! Dies bedeutet jedoch nicht, 
                dass die letzte Operation nicht gespeichert wurde. Auf dem Server kann alles in bester Ordnung sein.
                Dementsprechend wird niemand von diesem Fehler erfahren, wenn er nicht mit Hilfe des Sprechblasen-Icons per Mail gemeldet wird.
                Nach der Meldung kann über den Tornado hier wieder aufgeräumt werden, damit es weiter gehen kann!
                Vielen Dank für die Geduld - die App ist eben noch in der Entwicklung.
              </p>
              <List accordionList>
                <ListItem accordionItem title="Fehlermeldung">
                  <AccordionContent>
                    <Block strong inset>
                      <p>
                        {store.state.error.msg}
                      </p>
                    </Block>
                  </AccordionContent>
                </ListItem>
              </List>
            </Block>
          </Page>        
        </View>
      </App>
    ) 
    :(
      <App 
        { ...this.f7params } 
        themeDark>

        {/* Right panel with cover effect*/}
        <Panel right cover themeDark>
          <View>
            <Page>
              <Navbar title={`${SideMenue.getCurrentRightMenu().caption}`}/>
              <List>
                {SideMenue.getCurrentRightMenu().subMenuItems.map((item) => (
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
                ))}
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


        {/* Views/Tabs container */}
        <Views tabs className="safe-areas">
          {/* Tabbar for switching views-tabs */}
          <Toolbar tabbar labels bottom>
            <Link tabLink="#view-home" tabLinkActive iconIos="f7:photo_fill_on_rectangle_fill" iconAurora="f7:photo_fill_on_rectangle_fill" iconF7="photo_fill_on_rectangle_fill" text="SVE Media" />
            <Link tabLink="#view-catalog" iconIos="f7:arrow_up_doc_fill" iconAurora="f7:arrow_up_doc_fill" iconF7="arrow_up_doc_fill" text="SVE Documents" />
            <Link tabLink="#view-gamehub" iconIos="f7:gamecontroller_alt_fill" iconAurora="f7:gamecontroller_alt_fill" iconF7="gamecontroller_alt_fill" text="Game Hub" />
          </Toolbar>

          {/* Your main view/tab, should have "view-main" class. It also has "tabActive" prop */}
          <View id="view-home" main tab tabActive url="/" />

          {/* Catalog View */}
          <View id="view-catalog" name="catalog" tab url="/docs/" />

          {/* gamehub View */}
          <View id="view-gamehub" name="gamehub" tab url="/gamehub/" />

        </Views>

        <LoginScreen id="register-screen">
          <View>
            <Page loginScreen>
              <div
                style={{
                  backgroundImage: "url('images/SnowVision_Logo_Alpha.png')",
                  backgroundRepeat: "no-repeat",
                  backgroundAttachment: "fixed",
                  backgroundPosition: "center",
                  backgroundSize: "30%",
                  filter: "blur(20px) brightness(30%)",
                  WebkitFilter: "blur(20px) brightness(30%)",
                  boxSizing: "border-box",
                  height: "100%",
                  width: "100%",
                  zIndex: -100,
                  position: "absolute"
                }}
              />
              <LoginScreenTitle>Register&nbsp;{this.loginMessages.loginType}</LoginScreenTitle>
              {(this.loginMessages.errorMsg.length > 0) ? (
                <BlockHeader color="red" style={{color: "red"}}>
                  <span color="red" style={{color: "red"}}>{this.loginMessages.errorMsg}</span>
                </BlockHeader>
              ) : ''}
              <List>
              <ListInput
                  label="Username"
                  type="text"
                  placeholder="Username"
                  value={this.loginData.username}
                  onInput={(e) => {
                    this.loginData.username = e.target.value;
                    this.forceUpdate();
                  }}
                  required
                ></ListInput>

                <ListInput
                    label="Password"
                    type="password"
                    placeholder="Dein Passwort"
                    value={this.loginData.password}
                    onInput={(e) => {
                      this.loginData.password = e.target.value;
                      this.forceUpdate();
                    }}
                    required
                />
                <ListInput
                    label="Password wiederholen"
                    type="password"
                    placeholder="Dein Passwort wiederholt"
                    value={(this.loginData as RegisterData).password2}
                    onInput={(e) => {
                      (this.loginData as RegisterData).password2 = e.target.value;
                      this.forceUpdate();
                    }}
                    required
                />

                <ListInput
                    label="E-Mail (optional)"
                    type="email"
                    placeholder="Deine E-Mail"
                    value={(this.loginData as RegisterData).email}
                    onInput={(e) => {
                      (this.loginData as RegisterData).email = e.target.value;
                      this.forceUpdate();
                    }}
                />

                {(this.loginData.token !== undefined && !this.loginData.token.getIsValid()) ?
                  <ListInput
                    id="regToken"
                    label="Registrierungs-Token"
                    type="text"
                    placeholder="Übermitteltes Token für die Registrierung war nicht gültig oder vorhanden"
                    disabled
                    value=""
                    onInput={(e) => {
                      this.forceUpdate();
                    }}
                  />
                : 
                  (this.loginData.token !== undefined && this.loginData.token.getIsValid()) ? 
                    <ListItem color="green" style={{color: "green"}}><span color="green" style={{color: "green"}}>Token akzeptiert</span></ListItem>
                  : ""
                }

                <ListButton title="Register" onClick={() => this.onRegister()} />
                <ListButton title="Zurück zum Login" onClick={() => this.onOpenLogin()} />
                <BlockFooter>
                  Die App verwendet die API an: <Link external href={"https://" + SVESystemInfo.getAPIRoot() + "/check"}>{SVESystemInfo.getAPIRoot()}</Link>
                </BlockFooter>
              </List>
            </Page>
          </View>
        </LoginScreen>

        <LoginScreen id="login-screen" style={{overflow: "visible"}}>
          <View style={{overflow: "visible"}}>
            <Page loginScreen style={{overflow: "visible"}}>
              <div
                style={{
                  backgroundImage: "url('images/SnowVision_Logo_Alpha.png')",
                  backgroundRepeat: "no-repeat",
                  backgroundAttachment: "fixed",
                  backgroundPosition: "center",
                  backgroundSize: "30%",
                  filter: "blur(20px) brightness(30%)",
                  WebkitFilter: "blur(20px) brightness(30%)",
                  boxSizing: "border-box",
                  height: "100%",
                  width: "100%",
                  zIndex: -100,
                  position: "absolute"
                }}
              />
              <LoginScreenTitle>Login&nbsp;{this.loginMessages.loginType}</LoginScreenTitle>
              {(this.loginMessages.errorMsg.length > 0) ? (
                <BlockHeader color="red" style={{color: "red"}}>
                  <span color="red" style={{color: "red"}}>{this.loginMessages.errorMsg}</span>
                </BlockHeader>
              ) : ''}
              
              <List form>
              <ListInput
                label="Username"
                type="text"
                placeholder="Dein Username"
                value={this.loginData.username}
                onInput={(e) => {
                  this.loginData.username = e.target.value;
                  this.forceUpdate();
                }}
                required
              ></ListInput>
              <ListInput
                label="Password"
                type="password"
                placeholder="Dein Passwort"
                value={this.loginData.password}
                onInput={(e) => {
                  this.loginData.password = e.target.value;
                  this.forceUpdate();
                }}
                required
              />
              {(getDevice().standalone) ? "" : (
              <ListItem>
                <span color="#008c0e">Dieses Gerät merken</span>
                <Toggle
                  color="#11a802"
                  onToggleChange={(e) => { store.state.saveThisDevice = e }}
                />
              </ListItem>
              )}
              </List>
              <List>
                <ListButton title="Login" onClick={() => this.onLogin()} />
                <ListButton title="Register" onClick={() => this.onOpenRegister()} />
                <BlockFooter>
                  Die App verwendet die API an: <Link external href={SVESystemInfo.getAPIRoot() + "/check"}>{SVESystemInfo.getAPIRoot()}</Link>
                </BlockFooter>
              </List>
              <Link iconF7="arrow_down_to_line_alt" onClick={this.updateWebapp.bind(this)} tooltip="Update WebApp" style={{position: "fixed", bottom: "2vh", right: "2vw"}}></Link>
            </Page>
          </View>
        </LoginScreen>

        <Sheet 
          className="install-sheet" 
          push={getDevice().desktop}
          opened={this.showInstallHint && !this.no_install}
          swipeToClose={!getDevice().desktop}
          backdrop
          swipeToStep={!getDevice().desktop}
        >
          {(getDevice().desktop) ? (
            <Toolbar>
              <div className="left"></div>
              <div className="right">
                <Link sheetClose textColor="green" onClick={() => {this.showInstallHint = false; window.localStorage.setItem("no_install", "true"); this.forceUpdate();}}>Schließen</Link>
              </div>
          </Toolbar>
          ) : (
            <div className="sheet-modal-swipe-step">
              <div className="display-flex padding justify-content-space-between align-items-center">
                <Block>
                  <BlockHeader>
                    Diese Webapp ist noch nicht bei Ihnen installiert. Um diese App vollständig nutzen zu können installiere sie bitte.
                  </BlockHeader>
                  
                  Nach oben wischen, um mehr zu erfahren.
                </Block>
              </div>
            </div>
          )}
          
          <PageContent>
              <Row>
                <Col></Col>
                <Col><BlockTitle>Installation</BlockTitle></Col>
                <Col></Col>
              </Row>
              <Row>
              <Col></Col>
              <Col>
              {(getDevice().desktop) ? (
                <div>
                  Zur Installation auf Desktop-Systemen muss mit einem Google Chrome basierten Browser diese Seite geöffnet werden. Die Installation wird oben rechts in der Ecke angeboten.
                </div>
              ) : (
                <div>
                  {(getDevice().ios) ? (
                    <div>
                      <p>Zur installation von iOS aus müssen folgende beiden Schritte manuell durchgeführt werden:</p>
                      <img src="AddPage1.png"></img>
                      <img src="AddPage2.png"></img>
                    </div>
                  ): (
                    <p>
                      Zur Installation auf Android muss mit einem Google Chrome basierten Browser diese Seite geöffnet werden. Die Installation wird angeboten.
                    </p>
                  )}
                </div>
              )}
              </Col>
              <Col></Col>
              </Row>
          </PageContent>
        </Sheet>
      </App>
    )
  }

  protected updateWebapp() {
    window.caches.delete("/js/app.js").then(r => {
      window.caches.delete("/").then(r => {
        window.location.reload();
      }, err => window.location.reload());
    }, err => window.location.reload());
  }

  static getDerivedStateFromError(error) {
    console.log("STATIC: Catching error!");
    return {error: {
      has: true,
      msg: "Error" + JSON.stringify(error)
    }};
  }

  public componentDidCatch(error, errorInfo) {
    let errorObj = store.state.error;
    console.log("DYNAMIC: Catching error: " + errorObj.msg);
    errorObj.has = true;
    errorObj.msg = errorObj.msg + "<br>\n Info: " + JSON.stringify(errorInfo) + "<br>\nError: " + JSON.stringify(error);
    store.state.error = errorObj;   
  }

  protected onPressEnter(event) {
    if (store.state.user === undefined) {
      if(event.keyCode === 13) {
        if (this.openOverlay === "login-screen") {
          this.onLogin();
        }
        if (this.openOverlay === "register-screen") {
          this.onRegister();
        }
      }
      else
      {
        var self = this;
        Dom7(document).once("keydown", function(e) {
          self.onPressEnter(e);
        });
      }
    }
  }

  protected onLogin() {
    this.loginMessages.errorMsg = '';
    var self = this;
    new SVEAccount({ name: this.loginData.username, pass: this.loginData.password}, (usr) => {
      window.sessionStorage.setItem("sessionID", usr.getInitializer().sessionID);
      if (store.state.saveThisDevice) {
        SVEToken.register(usr, TokenType.DeviceToken, usr).then(token => {
          window.localStorage.setItem("sve_token", token);
          window.localStorage.setItem("sve_user", String(usr.getID()));
          window.localStorage.setItem("sve_username", usr.getName());
        });
      }
      self.onLoggedIn(usr);
    });
  }

  protected onLoggedIn(usr) {
    if (this.loginData.token !== undefined) {
      this.loginData.token.use();
      this.loginData.token = undefined;
    }

    if (usr.getState() == LoginState.LoggedInByToken || usr.getState() == LoginState.LoggedInByUser) {
      //console.log("Login succeeded! State: " + JSON.stringify(usr.getState()));
      store.state.user = usr;
      f7.loginScreen.close();

      if(store.state.routerParams.has("redirectProject")) {
        let pid = Number(store.state.routerParams.get("redirectProject"));
        f7.view.current.router.navigate("/project/" + pid + "/");
      }

      LoginHook.call();
    } else {
      var self = this;
      Dom7(document).once("keydown", function(e) {
        this.onPressEnter(e);
      });
      
      if (usr.getState() == LoginState.NotLoggedIn) {
        this.loginMessages.errorMsg = 'Es konnte kein Account mit diesen Daten gefunden werden.';
      } else {
        self.loginMessages.errorMsg = 'SVE Serverfehler! (' + JSON.stringify(usr) + ')';
      }
    }
    this.forceUpdate();
  }

  protected onRegister() {
    this.loginMessages.errorMsg = '';
    if(this.loginData.token === undefined) {
      this.loginMessages.errorMsg = 'Für eine Registeriung muss ein Token vorhanden sein. Scanne dazu einfach einen QR-Code oder öffne einen Einladungslink.';
      return;
    }
    if(this.loginData.password === (this.loginData as RegisterData).password2) {
      SVEAccount.registerNewUser({ name: this.loginData.username, pass: this.loginData.password }, this.loginData.token).then(usr => {
        this.onLoggedIn(usr);
      }, err => this.loginMessages.errorMsg = 'Registrierung fehlgeschlagen! Der Name scheint bereits vergeben zu sein.');
    } else {
      this.loginMessages.errorMsg = 'Die beiden Passworteingaben müssen identisch sein.';
    }
    this.forceUpdate();
  }

  protected cleanUpLogInData() {
    let token_str = window.localStorage.getItem("sve_token");
    if (token_str !== null && token_str !== undefined) {
      new SVEToken(token_str, TokenType.DeviceToken, Number(window.localStorage.getItem("sve_user")), token => {
        token.invalidate(store.state.user);
      });
    }

    window.localStorage.removeItem("sve_token");
    window.localStorage.removeItem("sve_username");
    window.localStorage.removeItem("sve_user");
    store.state.user = undefined;

    let allCookies = document.cookie.split(';');
    for (let i = 0; i < allCookies.length; i++)
        document.cookie = allCookies[i] + "=;expires=" + new Date(0).toUTCString();

    //update complete webapp
    location.reload();
  }

  protected checkForToken(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let token_str = window.localStorage.getItem("sve_token");
      if (token_str !== null && token_str !== undefined) {
        console.log("Found saved token");
        this.loginData.username = window.localStorage.getItem("sve_username");
        new SVEToken(token_str, TokenType.DeviceToken, Number(window.localStorage.getItem("sve_user")), token => {
          this.loginData.token = token;
          if(!token.getIsValid()) {
            console.log("Device Token is not valid!");
            this.loginMessages.errorMsg = "Gepeichertes Geräte-Token ist ungültig!";
            this.cleanUpLogInData();
            reject();
          } else {
            this.doLogInWithToken(token).then(() => resolve(), err => {
              if (getDevice().standalone) {
                SVESystemInfo.checkAPI(SVESystemInfo.getInstance().sources.accountService).then(info => {
                  if (info.status) {
                    reject();
                  } else {
                    resolve();  // if we were logged in once but now we dont have our account service
                  }
                }, err => {
                  resolve();  // if we were logged in once but now we dont have internet
                });
              } else {
                reject();
              }
            });
          }
          this.forceUpdate();
        });
      } else {
        reject();
      }
    });
  }

  protected doLogInWithToken(token): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      store.state.saveThisDevice = false;
      console.log("Try login as: " + this.loginData.username);
      console.log("Use token");
    
      token.use().then((usr) => {
          console.log("After token use logged in user: " + JSON.stringify(usr.getInitializer()));
          store.state.user = usr;
          this.loginData.username = usr.getName();
          this.onLoggedIn(usr);
          this.forceUpdate();
          resolve();
      }, err => {
          console.log("Login via Geräte-Token fehlgeschlagen! (Use hat funktioniert)");
          this.loginMessages.errorMsg = "Login via Geräte-Token fehlgeschlagen!";
          this.onOpenLogin();
          this.forceUpdate();
          reject();
      });
      f7.loginScreen.close();
      this.openOverlay = undefined;
    });
  }

  protected onOpenRegister() {
    f7.loginScreen.close();
    this.loginData = {
      username: "",
      password: "",
      email: "",
      password2: ""
    };
    this.forceUpdate();
    if(store.state.routerParams.has("token")) {
      new SVEToken(store.state.routerParams.get("token"), TokenType.RessourceToken, Number(store.state.routerParams.get("context")), (token) => {
        this.loginData.token = token;
        if(!token.getIsValid()) {
          console.log("Token is not valid!");
          this.loginMessages.errorMsg = "Einladung ist nicht mehr gültig.";
        }
        this.forceUpdate();
      });
    }
    
    f7.loginScreen.open("#register-screen");
    this.openOverlay = "register-screen";
  }

  protected onOpenLogin(onlyIfNothingIsOpen = false) {
    this.tryRestoreUserSession().then(() => {
      LoginHook.call();
    }, err => {
      if(!onlyIfNothingIsOpen || this.openOverlay.length === 0) {
        f7.loginScreen.close();
        this.loginData = {
          username: "",
          password: ""
        };
        this.forceUpdate();
        if(store.state.routerParams.has("token")) {
          new SVEToken(store.state.routerParams.get("token"), TokenType.RessourceToken, Number(store.state.routerParams.get("context")), (token) => {
            this.loginData.token = token;
            if(!token.getIsValid()) {
              console.log("Token is not valid!");
              this.loginMessages.errorMsg = "Einladung ist nicht mehr gültig.";
            }
            this.loginData.token = token;
            this.forceUpdate();
          });
        }
        f7.loginScreen.open("#login-screen");
        this.openOverlay = "login-screen";
      }
    });
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
        if(params.get("page") === "register" || params.get("page") === "login") {
          if(params.get("page") === "register") {
            this.onOpenRegister();
          } else {
            this.onOpenLogin();
          }
        } else {
          if (params.get("page") === "404") {
            f7.loginScreen.close();
            this.openOverlay = undefined;
          }
          f7.view.current.router.navigate("/" + params.get("page") + "/");
        }
      }
    }
  }

  protected onWorkerMessage(msg) {
    console.log("Worker message: " + JSON.stringify(msg));
  }

  public componentDidUpdate() {
    if (store.state.user === undefined) {
      this.onOpenLogin(true);
    }
  }

  public componentDidMount() {
    var self = this;
    f7ready((f7) => {
      SideMenue.setApp(self);
      if (getDevice().standalone) {
        store.state.saveThisDevice = true;
      }
      
      setTimeout(() => {
        this.showInstallHint = !getDevice().standalone;
        this.forceUpdate();
      }, 1500);

      // listen to service worker events
      navigator.serviceWorker.addEventListener("message", (evt) => {
        self.onWorkerMessage(evt.data);
      });

      if (window.localStorage.getItem("no_install") !== null || window.localStorage.getItem("no_install") !== undefined) {
        this.no_install = window.localStorage.getItem("no_install") == "true";
      }

      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          store.state.activeService = registration.active;
          store.dispatch("sendRequest", "Startup!");
        }
      });

      self.onOpenLogin();

      SVESystemInfo.getFullSystemState().then(state => {
        this.checkForToken();

        self.parseLink();
      }, err => {
        console.log("Error on init: " + JSON.stringify(err));
        f7.dialog.alert("Der SVE Server ist nicht erreichbar! Bitte mit dem Admin kontakt aufnehmen.", "Server nicht erreichbar!");
      });
    });

    Dom7(document).once("keydown", function(e) {
      self.onPressEnter(e);
    });
  }
};