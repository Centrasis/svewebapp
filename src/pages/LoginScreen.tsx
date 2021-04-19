import React, { useState } from 'react';
import {
  f7,
  Page,
  LoginScreenTitle,
  List,
  ListInput,
  ListButton,
  BlockFooter,
  BlockHeader,
  ListItem,
  Toggle,
  Link,
  Sheet,
  Toolbar,
  PageContent,
  BlockTitle,
  Col,
  Row,
  Block
} from 'framework7-react';
import { LoginState, SVEAccount, SVESystemInfo, SVEToken, TokenType } from 'svebaselib';
import { getDevice } from 'framework7';
import { LoginHook } from '../components/LoginHook';
import store from '../components/store';
import Dom7 from 'dom7';
import { SVEPageComponent } from '../components/SVEPageComponent';

export enum LoginType {
    Register = 0,
    Login
}

export type LoginScreenSettings = {
    type: LoginType
};

export interface LoginData {
    username: string;
    password: string;
    token?: SVEToken;
}
  
export interface RegisterData extends LoginData {
    password2: string;
    email: string;
}

export default class extends SVEPageComponent<LoginScreenSettings> {
    protected loginMessages = {
        errorMsg: '',
        loginType: ''
    };
    protected loginData: LoginData | RegisterData;
    protected no_install: boolean = false;
    protected showInstallHint: boolean = false; 
    protected type: LoginType = LoginType.Login;   

    constructor(props) {
        super(props);
        this.type = this.props.type;
        
        if (this.type == LoginType.Login) {
            this.loginData = {
                username: "",
                password: ""
            } as LoginData;
        } else {
            this.loginData = {
                username: "",
                password: "",
                email: "",
                password2: ""
            } as RegisterData;
        }
        this.no_install = false;       

        this.forceUpdate();
    }

    protected onLoginAction() {
        if(this.type == LoginType.Login) {
            this.loginMessages.errorMsg = '';
            new SVEAccount({ name: this.loginData.username, pass: this.loginData.password }, (usr: SVEAccount) => {
                window.sessionStorage.setItem("sessionID", usr.getSessionID());
                if (store.state.saveThisDevice) {
                    SVEToken.register(usr, TokenType.DeviceToken, usr).then(token => {
                        window.localStorage.setItem("sve_token", token);
                        window.localStorage.setItem("sve_user", String(usr.getID()));
                        window.localStorage.setItem("sve_username", this.loginData.username);
                    });
                }
                console.log("Logged in!");
                this.onLoggedIn(usr);
            });
        } else {
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
    }

    protected checkForToken(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          let token_str = window.localStorage.getItem("sve_token");
          if (token_str !== null && token_str !== undefined && token_str !== "undefined") {
            console.log("Found saved token");
            let usr_name = window.localStorage.getItem("sve_username");
            if (usr_name === null || usr_name === undefined || usr_name === "undefined") {
                reject();
                return;
            }
            this.loginData.username = usr_name;
            let usr_id = window.localStorage.getItem("sve_user");
            if (usr_id === null || usr_id === undefined || usr_id === "undefined") {
                reject();
                return;
            }
            new SVEToken(token_str, TokenType.DeviceToken, Number(usr_id), token => {
              this.loginData.token = token;
              if(!token.getIsValid()) {
                console.log("Device Token is not valid!");
                this.loginMessages.errorMsg = "Gepeichertes Geräte-Token ist ungültig!";
                store.dispatch("clearUser", {});
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

    protected doLogInWithToken(token: SVEToken): Promise<void> {
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
              store.dispatch("clearUser", {});
              this.forceUpdate();
              reject();
          });
        });
      }

    protected onLoggedIn(usr: SVEAccount) {
        if (this.loginData.token !== undefined) {
          this.loginData.token.use();
          this.loginData.token = undefined;
        }
    
        if (usr.getState() == LoginState.LoggedInByToken || usr.getState() == LoginState.LoggedInByUser) {
          //console.log("Login succeeded! State: " + JSON.stringify(usr.getState()));
          store.state.user = usr;

          if(store.state.routerParams.has("redirectProject")) {
            let pid = Number(store.state.routerParams.get("redirectProject"));
            f7.view.current.router.navigate("/project/" + pid + "/");
          }
    
          LoginHook.call(usr);
          this.f7router.back();
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
          this.forceUpdate();
        }
    }

    protected onPressEnter(event) {
        if(event.keyCode === 13) {
            this.onLoginAction();
        }
        else
        {
            var self = this;
            Dom7(document).once("keydown", function(e) {
              self.onPressEnter(e);
            });
        }
    }

    protected onOpenRegister() {
        this.type = LoginType.Register;
        this.forceUpdate();
    }

    protected onOpenLogin() {
        this.type = LoginType.Login;
        this.forceUpdate();
    }

    public componentDidMount() {
        super.componentDidUpdate();
        this.no_install = false;
        if (window.localStorage.getItem("no_install") !== null || window.localStorage.getItem("no_install") !== undefined) {
            this.no_install = window.localStorage.getItem("no_install") == "true";
        }
        
        setTimeout(() => {
            this.showInstallHint = !getDevice().standalone;
            this.forceUpdate();
        }, 1500);

        Dom7(document).once("keydown", this.onPressEnter.bind(this));

        LoginHook.tryRestoreUserSession().then(() => {
            this.f7router.back();
        }, err => this.checkForToken().then(() => this.f7router.back()));
    }

    componentDidUpdate() {
        super.componentDidUpdate();
        if (this.user !== undefined) {
            this.f7router.back();
        }
    }

    public componentWillUnmount() {
        Dom7(document).off("keydown", this.onPressEnter.bind(this));
    }

    protected customRender(): any {
        return (
            <Page noToolbar noNavbar noSwipeback loginScreen>
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
                        position: "absolute",
                        overflow: "visible"
                    }}
                />
                {(this.type == LoginType.Login) ? (
                    <div>
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
                            <ListButton title="Login" onClick={this.onLoginAction.bind(this)} />
                            <ListButton title="Register" onClick={this.onOpenRegister.bind(this)} />
                            <BlockFooter>
                                Die App verwendet die API an: <Link external href={SVESystemInfo.getAPIRoot() + "/check"}>{SVESystemInfo.getAPIRoot()}</Link>
                            </BlockFooter>
                        </List>
                        <Link iconF7="arrow_down_to_line_alt" onClick={() => store.dispatch("updateWebapp", {})} tooltip="Update WebApp" style={{position: "fixed", bottom: "2vh", right: "2vw"}}></Link>
                    </div>
                ): (
                    <div>
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

                                <ListButton title="Register" onClick={this.onLoginAction.bind(this)} />
                                <ListButton title="Zurück zum Login" onClick={this.onOpenLogin.bind(this)} />
                                <BlockFooter>
                                    Die App verwendet die API an: <Link external href={"https://" + SVESystemInfo.getAPIRoot() + "/check"}>{SVESystemInfo.getAPIRoot()}</Link>
                                </BlockFooter>
                            </List>
                    </div>
                )}

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
                            <p>
                            Zur Installation auf Desktop-Systemen muss mit einem Google Chrome basierten Browser diese Seite geöffnet werden. Die Installation wird oben rechts in der Ecke angeboten.
                            </p>
                        ) : (
                            <div>
                            {(getDevice().ios) ? (
                                <div>
                                <p>Zur installation von iOS aus müssen folgende beiden Schritte manuell durchgeführt werden:</p>
                                <img src="AddPage1.png"></img>
                                <hr/>
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
            </Page>
        )
    }
}