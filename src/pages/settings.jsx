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
import { SVESystemInfo, SVEToken, TokenType } from 'svebaselib';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      changePw: false,
      oldPw: "",
      newPw: "",
      newPw2: "",
      installedVersions: ["Unbekannt"],
      settings: {
        isPublic: false,
        email: ""
      },
      server: {
        api: "",
        host: window.hostname
      },
      serverFunctions: [],
      tokens: []
    };
  }
  render() {
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
                  value={this.state.server.host}
                  onInput={(e) => {
                    this.setState({ server: {host: e.target.value, api: this.state.server.api }});
                  }}
                ></ListInput>

                <ListItem
                  title="API-Funktionen"
                >
                  <List>
                    {this.state.serverFunctions.map(f => (
                      <ListItem checkbox title={f.name} disabled={true} checked={f.ok} tooltip={f.hint}>
                      </ListItem>
                    ))} 
                  </List>
                </ListItem>
              </List>
            </AccordionContent>
          </ListItem>

          <ListItem accordionItem title="SVE Media Einstellungen">
            <Icon slot="media" f7="photo_fill_on_rectangle_fill" />
            <AccordionContent>
              <Block>
                <BlockTitle>Sichtbarkeit</BlockTitle>
                <List mediaList>
                  <ListItem radio name="isPublic-radio" 
                    defaultChecked={!this.state.settings.isPublic}
                    value={false}
                    onChange={(e) => {
                      this.setState({ settings: {isPublic: !e.target.value, email: this.state.settings.email }});
                    }}
                    title="Privat"
                    text="Hochgeladene Medien sind nicht für Gruppenmitglieder sichtbar."
                  ></ListItem>
                  <ListItem radio name="isPublic-radio" 
                    defaultChecked={this.state.settings.isPublic} 
                    value={true}
                    onChange={(e) => {
                      this.setState({ settings: {isPublic: e.target.value, email: this.state.settings.email }});
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
                  value={this.state.settings.email}
                  onInput={(e) => {
                    this.setState({ settings: {email: e.target.value, isPublic: this.state.settings.isPublic }});
                  }}
                ></ListInput>
                <ListButton
                  title="Passwort ändern"
                  onClick={() => this.setState({changePw: true})}
                >
                </ListButton>
              </List>
            </AccordionContent>
          </ListItem>
          <ListItem accordionItem title="SVE Sicherheit">
            <Icon slot="media" f7="lock_shield" />
            <AccordionContent>
              <Block>
                  <BlockTitle>Registrierte Geräte</BlockTitle>
                  {(this.state.tokens.length == 0) ? (
                    <Block>
                      <BlockTitle>Alle angemeldeten Geräte und Browser würden hier gelistet werden.</BlockTitle>
                      <Button iconF7="lock_shield" raised fillIos>Dieses Gerät registrieren</Button>
                    </Block>
                  ) : (
                  <List>
                    {this.state.tokens.map(t => (
                      <ListItem title={t.deviceAgent}>
                        <Icon slot="media" f7={(t.type == TokenType.DeviceToken) ? "person_crop_circle" : "folder_circle"} />
                        <Icon slot="media" textColor="red" f7="trash" />
                      </ListItem>
                    ))} 
                  </List>
                  )}
              </Block>    
            </AccordionContent>
          </ListItem>
        </List>

        <Block largeInset strong>
          <Row tag="p">
            <Button className="col" raised fillIos onClick={this.commitToServer.bind(this)}>Anwenden</Button>
          </Row>
        </Block>
        
        <Popup swipeToClose opened={this.state.changePw} onPopupClosed={() => { this.setState({changePw: false}); }}>
          <Page>
            <BlockTitle>Passwort ändern</BlockTitle>
            <List>
            <ListInput
                  label="Altes Passwort"
                  type="password"
                  placeholder={"Altes Passwort"}
                  value={this.state.oldPw}
                  onInput={(e) => {
                      this.setState({oldPw: e.target.value});
                  }}
              />
              <ListInput
                  label="Neues Passwort"
                  type="password"
                  placeholder={"Altes Passwort"}
                  value={this.state.newPw}
                  onInput={(e) => {
                      this.setState({newPw: e.target.value});
                  }}
              />
              <ListInput
                  label="Neues Passwort wiederholen"
                  type="password"
                  placeholder={"Altes Passwort wiederholen"}
                  value={this.state.newPw2}
                  onInput={(e) => {
                      this.setState({newPw2: e.target.value});
                  }}
              />
              <ListItem
                title="Übernehmen"
                onClick={() => { 
                  if (this.state.newPw === this.state.newPw2) {
                    store.state.user.changePassword(this.state.oldPw, this.state.newPw).then(val => {
                      if(!val) {
                        f7.dialog.alert("Änderung fehlgeschlagen!");
                      } else {
                        this.setState({changePw: false, oldPw: "", newPw: "", newPw2: ""});
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

  componentDidMount() {
    var router = f7.view.current.router;
    var self = this;
    var $$ = Dom7;
    f7ready((f7) => {
      let funcs = [];
      let sources = SVESystemInfo.getInstance().sources;
      for (let prop in sources) {
        if (prop !== "protocol") {
          if (prop !== undefined) {
            let api = SVESystemInfo.getInstance().sources[prop];
            console.log("Api: ", api);
            SVESystemInfo.checkAPI(api).then(info => {
              funcs.push({
                name: prop + " v" + info.version,
                ok: info.status,
                hint: api
              });
              this.setState({serverFunctions: funcs});
            }, err => {
              funcs.push({
                name: prop,
                ok: false,
                hint: api
              });
              this.setState({serverFunctions: funcs});
            });
          }
        }
      }

      this.state.tokens = [];
      SVEToken.listDevices(store.state.user).then(ti => {
        this.setState({tokens: ti});
      });
    },
    function (data, status) {
      setTimeout(self.componentDidMount(), 1000);
    });
  }

  commitToServer() {
    var dlg = f7.dialog;
    f7.request.get(f7.apiPath + "/setUserSettings.php?id="+this.state.user.id+"&isPublic="+((this.state.settings.isPublic) ? "1" : "0") + "&email="+this.state.settings.email, function(data) {
      if(!JSON.parse(data).Succeeded)
        dlg.alert("Ein Fehler auf dem Server trat auf! Die Einstellungen wurden nicht übernommen!");
    });
  }
};