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
  Icon
} from 'framework7-react';

import Dom7 from 'dom7';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      installedVersions: ["Unbekannt"],
      user: {
        id: -1,
        name: ""
      },
      settings: {
        isPublic: false,
        email: ""
      },
      server: {
        api: "",
        host: location.hostname
      }
    };
  }
  render() {
    return (
      <Page name="settings">
        <Navbar title="Einstellungen" />

        <Block>
          <BlockTitle>Servereinstellungen</BlockTitle>
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

            <ListInput
              label="API-Version"
              type="select"
              smartSelect
              smartSelectParams={{openIn: 'sheet'}}
              value={(this.state.server.api == "") ? "Egal" : this.state.server.api}
              onInput={(e) => {
                this.setState({ server: {api: e.target.value, host: this.state.server.host }});
              }}
            >
              <option value="">Egal</option>
              <option value="1.0">Version 1.0</option>
              <option value="2.0">Version 2.0</option>
              <option value="3.0">Version 3.0</option>
            </ListInput>
            </List>
          </Block>

          <Block>
            <BlockTitle><Icon f7="photo_fill_on_rectangle_fill" />&nbsp;&nbsp;SVE Media Einstellungen</BlockTitle>
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
            </List>
        </Block>
        <Block largeInset strong>
          <Row tag="p">
            <Button className="col" raised fill onClick={this.commitToServer.bind(this)}>Anwenden</Button>
          </Row>
        </Block>
        
      </Page>
    )
  }

  componentDidMount() {
    var router = this.$f7router;
    var self = this;
    var $$ = Dom7;
    this.$f7ready((f7) => {
      self.setState({installedVersions: f7.versions});
      /*var info = JSON.parse(data);
      self.setState({
        user: state.user
      });

      if (info.settings || "settings" in info) {
        self.setState({
          settings: {
            isPublic: info.settings.isPublic,
            email: info.settings.email
          }
        });
      }
      else
      {
        console.log("No user settings upto now: " + JSON.stringify(info));
        self.setState({
          settings: {
            isPublic: false,
            email: ""
          }
        });
      }*/
    },
    function (data, status) {
      setTimeout(self.componentDidMount(), 1000);
    });
  }

  commitToServer() {
    var dlg = this.$f7.dialog;
    this.$f7.request.get(this.$f7.apiPath + "/setUserSettings.php?id="+this.state.user.id+"&isPublic="+((this.state.settings.isPublic) ? "1" : "0") + "&email="+this.state.settings.email, function(data) {
      if(!JSON.parse(data).Succeeded)
        dlg.alert("Ein Fehler auf dem Server trat auf! Die Einstellungen wurden nicht übernommen!");
    });
  }
};