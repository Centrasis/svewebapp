import React from 'react';

import {
  App,
  Panel,
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
  BlockHeader
} from 'framework7-react';

import Dom7 from 'dom7';
import routes from '../js/routes';
import {SVESystemInfo, SVEAccount, LoginState} from 'svebaselib';

export default class extends React.Component {
  constructor() {
    super();

    SVESystemInfo.getInstance().sources.sveService = "api";

    var app = this;

    this.state = {
      // Framework7 Parameters
      f7params: {
        name: 'sve-online', // App name
        theme: 'auto', // Automatic theme detection
        id: "sve.felixlehner.de",
        version: "1.0.0",
        iosTranslucentBars: true,
        externalLinks: ".external",
        statusbar: {
          iosOverlaysWebview: true,
        },
        touch: {
          fastClicksExclude: "label.checkbox, label.radio, button"
        },
        notification: {
          title: 'SVE Media',
          closeTimeout: 3000,
        },

        // App root data
        data: function () {
          return {
            addLoginHook: function(hook) {
              app.state.onLoginHooks.push(hook);
            },
            getUser: function() {
              return app.state.user;
            },
            pushRightPanel: function(content) {
              app.panelMenueContent.push(content);
              app.setState({panelMenueContent: app.panelMenueContent});
            },
            popRightPanel: function() {
              app.panelMenueContent.pop();
              app.setState({panelMenueContent: app.panelMenueContent});
            },
            updateLeftPanel: function(content) {
              app.setState({panelMenueContentLeft: content});
            }
          }
        },

        // App routes
        routes: routes,
        // Register service worker
        serviceWorker: {
          path: '/service-worker.js',
        },
      },
      user: undefined,
      loginMessages: {
        errorMsg: '',
        loginType: ''
      },
      loginData: {
        username: '',
        password: '',
        password2: '',
        loginToken: '',
        email: ''
      },
      onLoginHooks: [],
      panelMenueContentLeft: undefined,
      panelMenueContent: [{
        caption: "_",
        menueItems: [
          {
            caption: "test",
            onClick: function() { self.dialog.alert("Test"); }
          }
        ]
      }]
    }
  }
  render() {
    return (
      <App params={ this.state.f7params } themeDark>

        {/* Right panel with cover effect*/}
        <Panel right cover themeDark>
          <View>
            <Page>
              {(this.state.panelMenueContent.length > 0) ? <Navbar title={`${this.state.panelMenueContent.caption}`}/> : ""}
              {(this.state.panelMenueContent.length > 0) ? 
              <List>
                {this.state.panelMenueContent.menueItems.map((item) => (
                  <ListItem 
                    panelClose="right"
                    title={item.caption}
                    onClick={() => {
                      var click = item.onClick.bind(this);
                      click();
                      this.$f7.panel.close("right", true);
                      this.$f7.panel.close("left", true);
                    }}
                    className="button"
                  />
                ))}
                <ListItem panelClose="right"/>
              </List>
              : ""}
            </Page>
          </View>
        </Panel>


        {/* Views/Tabs container */}
        <Views tabs className="safe-areas">
          {/* Tabbar for switching views-tabs */}
          <Toolbar tabbar labels bottom>
          <Link tabLink="#view-home" tabLinkActive iconIos="f7:photo_fill_on_rectangle_fill" iconAurora="f7:photo_fill_on_rectangle_fill" iconF7="photo_fill_on_rectangle_fill" text="SVE Media" />
            <Link tabLink="#view-catalog" iconIos="f7:arrow_up_doc_fill" iconAurora="f7:arrow_up_doc_fill" iconF7="arrow_up_doc_fill" text="SVE Documents" />
            <Link tabLink="#view-settings" iconIos="f7:gear" iconAurora="f7:gear" iconMd="material:settings" text="Settings" />
          </Toolbar>

          {/* Your main view/tab, should have "view-main" class. It also has "tabActive" prop */}
          <View id="view-home" main tab tabActive url="/" />

          {/* Catalog View */}
          <View id="view-catalog" name="catalog" tab url="/docs/" />

          {/* Settings View */}
          <View id="view-settings" name="settings" tab url="/settings/" />

        </Views>

        <LoginScreen id="register-screen">
          <View>
            <Page loginScreen>
              <LoginScreenTitle>Register&nbsp;{this.state.loginMessages.loginType}</LoginScreenTitle>
              <List>
              <ListInput
                  label="Username"
                  type="text"
                  placeholder="Username"
                  value={this.state.loginData.username}
                  onInput={(e) => {
                    let lData = this.state.loginData;
                    lData.username = e.target.value;
                    this.setState({loginData: lData});
                  }}
                  required
                ></ListInput>

                <ListInput
                    label="Password"
                    type="password"
                    placeholder="Dein Passwort"
                    value={this.state.loginData.password}
                    onInput={(e) => {
                      let lData = this.state.loginData;
                      lData.password = e.target.value;
                      this.setState({loginData: lData});
                    }}
                    required
                />
                <ListInput
                    label="Password wiederholen"
                    type="password"
                    placeholder="Dein Passwort wiederholt"
                    value={this.state.loginData.password2}
                    onInput={(e) => {
                      let lData = this.state.loginData;
                      lData.password2 = e.target.value;
                      this.setState({loginData: lData});
                    }}
                    required
                />

                <ListInput
                    label="E-Mail (optional)"
                    type="email"
                    placeholder="Deine E-Mail"
                    value={this.state.loginData.email}
                    onInput={(e) => {
                      let lData = this.state.loginData;
                      lData.email = e.target.value;
                      this.setState({loginData: lData});
                    }}
                />

                {(this.state.loginData.loginToken.length == 0) ? (
                  <ListInput
                    id="regToken"
                    label="Registrierungs-Token"
                    type="text"
                    placeholder="Übermitteltes Token für die Registrierung"
                    value={this.state.loginData.loginToken}
                    onInput={(e) => {
                      let lData = this.state.loginData;
                      lData.loginToken = e.target.value;
                      this.setState({loginData: lData});
                    }}
                    required
                  />
                ) : (
                  <ListItem color="green"><span color="green">Token akzeptiert</span></ListItem>
                )}

                <ListButton title="Register" onClick={() => this.onRegister()} />
                <ListButton title="Zurück zum Login" onClick={() => this.onOpenLogin()} />
                <BlockFooter>
                  Die App verwendet die API an: <Link external href={"https://" + window.location.hostname + "/" + SVESystemInfo.getAPIRoot() + "/check"}>{window.location.hostname + "/" + SVESystemInfo.getAPIRoot()}</Link>
                </BlockFooter>
              </List>
            </Page>
          </View>
        </LoginScreen>

        <LoginScreen id="login-screen">
          <View>
            <Page loginScreen>
              <LoginScreenTitle>Login&nbsp;{this.state.loginMessages.loginType}</LoginScreenTitle>
              {(this.state.loginMessages.errorMsg.length > 0) ? (
                <BlockHeader large color="red" style={{color: "red"}}>
                  <span color="red" style={{color: "red"}}>{this.state.loginMessages.errorMsg}</span>
                </BlockHeader>
              ) : ''}
              
              <List form>
              <ListInput
                label="Username"
                type="text"
                placeholder="Dein Username"
                value={this.state.loginData.username}
                onInput={(e) => {
                  let lData = this.state.loginData;
                  lData.username = e.target.value;
                  this.setState({loginData: lData});
                }}
                required
              ></ListInput>
              <ListInput
                label="Password"
                type="password"
                placeholder="Dein Passwort"
                value={this.state.loginData.password}
                onInput={(e) => {
                  let lData = this.state.loginData;
                  lData.password = e.target.value;
                  this.setState({loginData: lData});
                }}
                required
              />
              <ListItem>
                <span color="#008c0e">Dieses Gerät merken</span>
                <Toggle 
                  color="#11a802"
                  onToggleChange={(e) => { this.setState({saveThisDevice: e}) }}
                />
              </ListItem>
              </List>
              <List>
                <ListButton title="Login" onClick={() => this.onLogin()} />
                <ListButton title="Register" onClick={() => this.onOpenRegister()} />
                <BlockFooter>
                  Die App verwendet die API an: <Link external href={"https://" + window.location.hostname + "/" + SVESystemInfo.getAPIRoot() + "/check"}>{window.location.hostname + "/" + SVESystemInfo.getAPIRoot()}</Link>
                </BlockFooter>
              </List>
            </Page>
          </View>
        </LoginScreen>
      </App>
    )
  }

  onPressEnter(event) {
    if (this.$f7.user === undefined) {
      if(event.keyCode === 13) {
        this.onLogin();
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

  onLogin() {
    this.setState({loginMessages: {errorMsg: '', loginType: this.state.loginMessages.loginType}});
    console.log("Try login..");
    var self = this;
    new SVEAccount({ name: this.state.loginData.username, pass: this.state.loginData.password}, (usr) => {
      if (usr.getState() == LoginState.LoggedInByToken || usr.getState() == LoginState.LoggedInByUser) {
        console.log("Login succeeded! State: " + JSON.stringify(usr.getState()));
        self.state.user = usr;
        self.setState({user: self.state.user});
        self.$f7.loginScreen.close();

        self.state.onLoginHooks.forEach(h => h());
      } else {
        Dom7(document).once("keydown", function(e) {
          self.onPressEnter(e);
        });
        
        if (usr.getState() == LoginState.NotLoggedIn) {
          self.setState({loginMessages: {errorMsg: 'Es konnte kein Account mit diesen Daten gefunden werden.', loginType: this.state.loginMessages.loginType}});
        } else {
          self.setState({loginMessages: {errorMsg: 'SVE Serverfehler! (' + JSON.stringify(usr) + ')', loginType: this.state.loginMessages.loginType}});
        }
      }
    });
  }

  onRegister() {

  }

  checkForToken() {
    let token = window.localStorage.getItem("sve_token");
    if (token !== null && token !== undefined) {
      console.log("Found saved token");
      let loginData = this.state.loginData;
      loginData.username = window.localStorage.getItem("sve_user");
      loginData.loginToken = token;
      this.setState({loginData: loginData});
  
      this.doLogInWithToken(loginData.username, token);
    }
  }

  doLogInWithToken(user, token) {
    var self = this;
    this.setState({saveThisDevice: false});
    console.log("Try login as: " + user);
    console.log("Use token");
  
    let usr = new SVEAccount({
      name: user,
      token: token
    }, (s) => {
      if(s !== LoginState.NotLoggedIn) {
        self.$f7.user = usr;
      } else {
        self.$f7.user = undefined;
      }
      self.onLoginComplete(s !== LoginState.NotLoggedIn);
    }, err => {
      self.$f7.dialog.alert("Login by token at server failed: " + JSON.stringify(err), "Login Error!");
    });
  }

  onOpenRegister() {
    this.$f7.loginScreen.close();
    this.$f7.loginScreen.open("#register-screen");
  }

  onOpenLogin() {
    this.$f7.loginScreen.close();
    this.$f7.loginScreen.open("#login-screen");
  }

  parseLink() {
    const parsed = qs.parse(location.search);
    var router = self.$f7router;
    if ("page" in parsed)
    {
      if ("token" in parsed && "context" in parsed)
      {
        // means that we will add this user to the context
        self.state.addUserRequest = f7.apiPath + "/addUserTo.php?atoken=" + encodeURI(decodeURI(parsed.token)) + "&context=" + parsed.context;
      }
      else
      {
        var param = "";
        if ("id" in parsed)
        {
          param = "/" + parsed.id;
        }
        
        router.navigate("/" + parsed.page + param + "/");
        return;
      }
    }
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      console.log("App ready!");
      if (!f7.device.standalone && f7.device.ios)
      {
        f7.dialog.confirm("Die Webapp ist noch nicht bei Ihnen installiert. Um diese App vollständig nutzen zu können installiere sie bitte.", "App ist nicht installiert", function() { router.navigate("/install/"); }, function() {});
      }

      SVESystemInfo.getFullSystemState().then(state => {
        if(state.user === undefined) {
          self.state.user = undefined;
          this.checkForToken();
        } else {
          self.state.user = state.user;
          self.setState({ loginData: { username: state.user.getName(), password: '', loginToken: '' }, user: state.user});
        }
      }, err => {
        console.log("Error on init: " + JSON.stringify(err));
        f7.dialog.alert("Der SVE Server ist nicht erreichbar! Bitte mit dem Admin kontakt aufnehmen.", "Server nicht erreichbar!");
      });
    });

    Dom7(document).once("keydown", function(e) {
      self.onPressEnter(e);
    });
  }
}