import React from 'react';
import {
  Page,
  Navbar,
  List,
  ListInput,
  ListItem,
  Toggle,
  BlockTitle,
  Row,
  Button,
  Range,
  Block,
  Icon,
  ListButton,
  Popup,
  AccordionContent 
} from 'framework7-react';
import { f7, f7ready, theme } from 'framework7-react';
import store from '../components/store';
import Dom7 from 'dom7';
import { LoginState, SVESystemInfo, SVEToken, TokenInfo, TokenType } from 'svebaselib';
import { SVEPageComponent } from '../components/SVEPageComponent';
import { RegisterData } from './LoginScreen';

export default class extends SVEPageComponent {
  protected accountData: RegisterData;
  protected changePw: boolean = false;
  protected oldPw: string = "";
  protected installedVersions: string[] = ["Unbekannt"];
  protected isPublic: boolean = false;
  protected server: {
    api: string,
    host: string
  };
  protected serverFunctions: {
    ok: boolean,
    name: string,
    hint: string
  }[] = [];
  protected tokens: TokenInfo[] = [];

  constructor(props) {
    super(props);
    this.server = {
      api: "",
      host: location.hostname
    }
    this.accountData = {
      email: "",
      password: "",
      password2: "",
      username: "",
      token: undefined
    }
  }
  protected customRender() {
    return (
      <Page name="settings">
        <Navbar title="Einstellungen" backLink="Back"/>

        <List accordionList accordionOpposite>
          <ListItem accordionItem title="Servereinstellungen">
            <Icon slot="media" f7="cloud_upload" />
            <AccordionContent>
              <List>
                <ListInput
                  label="SVE-API Server"
                  type="url"
                  placeholder={location.hostname}
                  value={this.server.host}
                  onInput={(e) => {
                    this.server.host = e.target.value;
                    this.forceUpdate();
                  }}
                ></ListInput>

                <ListItem
                  title="API-Funktionen"
                >
                  <List>
                    {this.serverFunctions.map(f => (
                      <ListItem checkbox title={f.name} disabled={true} checked={f.ok} tooltip={f.hint}>
                      </ListItem>
                    ))} 
                  </List>
                </ListItem>
              </List>
              <Button iconF7="arrow_2_circlepath" raised fillIos onClick={this.refreshServerInfos.bind(this)}>Refresh</Button>
            </AccordionContent>
          </ListItem>

          {(this.user !== undefined) ? (<ListItem accordionItem title="SVE Media Einstellungen">
            <Icon slot="media" f7="photo_fill_on_rectangle_fill" />
            <AccordionContent>
              <Block>
                <BlockTitle>Sichtbarkeit</BlockTitle>
                <List mediaList>
                  <ListItem radio name="isPublic-radio" 
                    checked={!this.isPublic}
                    onChange={(e) => {
                      this.isPublic = !e.target.value;
                    }}
                    title="Privat"
                    text="Hochgeladene Medien sind nicht für Gruppenmitglieder sichtbar."
                  ></ListItem>
                  <ListItem radio name="isPublic-radio" 
                    checked={this.isPublic}
                    onChange={(e) => {
                      this.isPublic = e.target.value;
                    }}
                    title="Gruppen-Öffentlich"
                    text="Hochgeladene Medien sind für alle Gruppenmitglieder sichtbar."
                  ></ListItem>
                </List>
              </Block>
              <List>
                <ListInput 
                  label="E-Mail für Benachrichtigungen" 
                  type="email"
                  placeholder="e@mail.de"
                  value={this.accountData.email}
                  onInput={(e) => {
                    this.accountData.email = e.target.value;
                  }}
                ></ListInput>
                <ListButton
                  title="Passwort ändern"
                  onClick={() => { this.changePw = true; this.forceUpdate(); }}
                >
                </ListButton>
              </List>
            </AccordionContent>
          </ListItem>) : ""}
          {(this.user !== undefined) ? (<ListItem accordionItem title="SVE Sicherheit">
            <Icon slot="media" f7="lock_shield" />
            <AccordionContent>
              <Block>
                  <BlockTitle>Registrierte Geräte</BlockTitle>
                  {(this.tokens.length == 0) ? (
                    <Block>
                      <BlockTitle>Alle angemeldeten Geräte und Browser würden hier gelistet werden.</BlockTitle>
                      <Button iconF7="lock_shield" raised fillIos onClick={this.registerDevice.bind(this)}>Dieses Gerät registrieren</Button>
                    </Block>
                  ) : (
                    <div>
                      <List>
                        {this.tokens.map(t => (
                          <div>
                            <ListItem title={t.deviceAgent}>
                              <Icon slot="media" f7={(t.type == TokenType.DeviceToken) ? "person_crop_circle" : "folder_circle"} />
                              <Button slot="after-title" textColor="red" iconF7="trash" onClick={this.removeToken.bind(this, t)} />
                            </ListItem>
                          </div>
                        ))}
                      </List>
                      {(store.state.user.getLoginState() !== LoginState.LoggedInByToken) ? (
                          <Button iconF7="lock_shield" raised fillIos onClick={this.registerDevice.bind(this)}>Dieses Gerät registrieren</Button>
                        ) : ""}
                    </div>
                  )}
              </Block>    
            </AccordionContent>
          </ListItem>) : ""}
          <ListItem accordionItem title="Darstellung">
            <AccordionContent>
              <Block>
                <BlockTitle>Dark Mode</BlockTitle>
                <Toggle
                  color="#11a802"
                  onToggleChange={(e) => { store.state.isDarkMode = e; this.forceUpdate(); }}
                  value={store.state.isDarkMode}
                />
              </Block>
            </AccordionContent>
          </ListItem>
        </List>

        {(this.user !== undefined) ? (<Block largeInset strong>
          <Row tag="p">
            <Button className="col" raised fillIos onClick={this.commitToServer.bind(this)}>Anwenden</Button>
          </Row>
        </Block>) : ""}
        
        <Popup swipeToClose opened={this.changePw} onPopupClosed={() => { this.changePw = false; this.forceUpdate(); }}>
          <Page>
            <BlockTitle>Passwort ändern</BlockTitle>
            <List>
            <ListInput
                  label="Altes Passwort"
                  type="password"
                  placeholder={"Altes Passwort"}
                  value={this.oldPw}
                  onInput={(e) => {
                      this.oldPw = e.target.value;
                      this.forceUpdate();
                  }}
              />
              <ListInput
                  label="Neues Passwort"
                  type="password"
                  placeholder={"Neues Passwort"}
                  value={this.accountData.password}
                  onInput={(e) => {
                      this.accountData.password = e.target.value;
                      this.forceUpdate();
                  }}
              />
              <ListInput
                  label="Neues Passwort wiederholen"
                  type="password"
                  placeholder={"Neues Passwort wiederholen"}
                  value={this.accountData.password2}
                  onInput={(e) => {
                    this.accountData.password2 = e.target.value;
                    this.forceUpdate();
                  }}
              />
              <ListItem
                title="Übernehmen"
                onClick={() => { 
                  if (this.accountData.password === this.accountData.password2) {
                    store.state.user.changePassword(this.oldPw, this.accountData.password).then(val => {
                      if(!val) {
                        f7.dialog.alert("Änderung fehlgeschlagen!");
                      } else {
                        this.changePw = false;
                        this.oldPw = "";
                        this.accountData.password = "";
                        this.accountData.password2 = "";
                        this.forceUpdate();
                      }
                    });
                  } else {
                    f7.dialog.alert("Die neuen Passwörter müssen identisch sein!");
                  }
                }}
                style={{cursor: "pointer"}}
              />
            </List>
          </Page>
        </Popup>
      </Page>
    )
  }

  registerDevice() {
    SVEToken.register(store.state.user, TokenType.DeviceToken, store.state.user).then(token => {
      window.localStorage.setItem("sve_token", token);
      window.localStorage.setItem("sve_user", String(store.state.user.getID()));
      window.localStorage.setItem("sve_username", store.state.user.getName());
      this.refreshServerInfos();
    });
  }

  removeToken(token) {
    SVEToken.invalidateByInfo(store.state.user, token);
    setTimeout(() => this.refreshServerInfos(), 1000);
  }

  refreshServerInfos() {
    this.serverFunctions = [];
    let sources = SVESystemInfo.getInstance().sources;
    this.forceUpdate();
    for (let prop in sources) {
      if (prop !== "protocol") {
        let api = SVESystemInfo.getInstance().sources[prop];
        if (api !== undefined) {
          console.log("Api: ", api);
          SVESystemInfo.checkAPI(api).then(info => {
            console.log("Api info: ", info);
            this.serverFunctions.push({
              name: prop + " v" + info.version,
              ok: info.status,
              hint: api
            });
            this.forceUpdate();
          }, err => {
            console.log("Error checking api: ", api, err);
            this.serverFunctions.push({
              name: prop,
              ok: false,
              hint: api
            });
            this.forceUpdate();
          });
        }
      }
    }

    this.tokens = [];
    this.forceUpdate();

    if (store.state.user === undefined)
      return;

    SVEToken.listDevices(store.state.user).then(ti => {
      this.tokens = ti;
      this.forceUpdate();
    });
  }

  componentDidMount() {
    super.componentDidMount();
    let self = this;
    f7ready((f7) => {
      self.refreshServerInfos();
    });

    if(this.user !== undefined) {
      this.accountData = {
        email: "",
        password: "",
        password2: "",
        username: this.user.getName(),
        token: undefined
      }
    };
  }

  commitToServer() {
    
  }
};