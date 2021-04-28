import React from 'react';
import { Page, Navbar, Block, BlockTitle, Row, List, Button, ListInput, ListItem, Col } from 'framework7-react';
import { SVEGameServer, SVEGame, SVEGameInfo, GameState } from 'svegamesapi';
import { f7, f7ready, theme } from 'framework7-react';
import store from '../components/store';
import { LoginHook } from '../components/LoginHook';
import { SVEPageComponent } from '../components/SVEPageComponent';
import { SVEAccount } from 'svebaselib';

export default class extends SVEPageComponent {
  newGameName: string = "";
  newGameType: string = "";
  foundGames: SVEGameInfo[] = [];
  foundGameTypes: string[] = [];
  tempUserName: string = "";

  constructor(props) {
    super(props);
    this.tempUserName = this.createUserName();
  }

  protected createUserName(): string {
    let names = ["Todesschabe", "KomischerDude1Elf", "Evaporator", "Gamer8", "Bender", "Decay", "BigPapa", "Hotdog", "Starbug", "Helo", "Cobra"];
    return names[Math.floor(Math.random() * names.length)];
  }

  protected customRender() {
    return (
      <Page>
        <Navbar title="Spiele-Hub" backLink="Back"/>
          {(store.state.user === undefined) ? (
            <Block>
              <Row>
                <Col width="100" style={{textAlign: "center"}}>
                  <p>Sie sind nicht Eingeloggt</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Row></Row>
                  <Row>
                    <Button onClick={() => this.f7router.navigate("/login/")} fill>
                      Einloggen
                    </Button>
                  </Row>
                  <Row></Row>
                </Col>
                <Col>
                  <BlockTitle>Oder einfach Spielerenamen festlegen</BlockTitle>
                  <List noHairlinesMd>
                    <ListInput
                      label="Name"
                      type="text"
                      value={this.tempUserName}
                      placeholder="Dein Name"
                      clearButton
                      onInput={(e) => {
                        this.tempUserName = (e.target.value as string).trim();
                        if (this.tempUserName.length === 0) 
                          this.tempUserName = this.createUserName();
                        this.forceUpdate();
                      }}
                      onInputClear={() => {
                        this.tempUserName = this.createUserName();
                        this.forceUpdate();
                      }}
                    />
                  </List>
                  <Button onClick={() => this.registerTempUser()} fill>
                    Erstellen
                  </Button>
                </Col>
              </Row>
            </Block>
          ) : ""}
        <Block strong mediumInset>
          <BlockTitle>Spiel beitreten</BlockTitle>
          <List>
          {this.foundGames.map((game) => (
            <ListItem mediaItem
              key={game.name}
              title={game.name}
              subtitle={"Host: " + game.host + " Players: (" + game.playersCount + "/" + game.maxPlayers + ")"}
              footer={"Spiel: " + game.type}
              link={window.location.hostname.replace("www.", "play.").replace("sve.", "play.") + `/${game.type}?name=${game.name}&join=1&sessionID=${store.state.user.getSessionID()}`}
              external
              target="_blank"
            >
            </ListItem>
          ))}
          </List>
          <Block largeInset strong>
              <Row tag="p">
                <Button className="col" raised fill onClick={this.updateGames.bind(this)}>Neu laden</Button>
              </Row>
          </Block>
        </Block>
        <Block largeInset>
          <BlockTitle>Spiel hosten</BlockTitle>
          <List>
            <ListInput
              label="Spielname"
              type="text"
              placeholder={"Spielname"}
              value={this.newGameName}
              onInput={(e) => {
                this.newGameName = e.target.value;
                this.forceUpdate();
              }}
            ></ListInput>

            <ListInput
              label="Spieltyp"
              type="select"
              value={this.newGameType}
              onInput={(e) => {
                this.newGameType = e.target.value;
                this.forceUpdate();
              }}
            >
              <option value="">Undefiniert</option>
              {this.foundGameTypes.map(t => (
                <option value={t}>{t}</option>
              ))}
            </ListInput>
            </List>
            <Block largeInset strong>
              <Row tag="p">
                <Button disabled={this.newGameName == "" || this.newGameType == "" || store.state.user === undefined} className="col" raised fill onClick={this.hostGame.bind(this)}>Hosten</Button>
              </Row>
            </Block>
        </Block>
      </Page>
    )}

    updateGames() {
      this.foundGames = []; this.foundGameTypes = []; this.forceUpdate();

      if (store.state.user === undefined)
        return;

      SVEGameServer.listGameTypes(store.state.user).then((infos) => {
        this.foundGameTypes = infos; this.forceUpdate();
      });

      SVEGameServer.listGames(store.state.user).then((infos) => {
        this.foundGames = infos; this.forceUpdate();
      });
    } 

    registerTempUser() {
      SVEAccount.registerTemporaryUser(this.tempUserName).then(usr => {
        LoginHook.call(usr);
      });
    }

    gameTypeToReadable(type) {
      if (type == "thegame")
        return "The Game";

      if (type.toLowerCase() == "uno")
        return "Uno";

      if (type.toLowerCase() == "busdriver")
        return "Busfahrer";

      if (type.toLowerCase() == "wizard")
        return "Wizard";

      return type;
    }

    hostGame() {
      console.log("Host game: " + this.newGameName + " as " + store.state.user.getName());
      SVEGameServer.hostGame({
        host: store.state.user,
        id: 0,
        maxPlayers: 10,
        minPlayers: 2,
        name: this.newGameName,
        type: this.newGameType,
        playersCount: 0,
        state: GameState.UnReady
      }).then(gi => {
        window.open(window.location.hostname.replace("www.", "play.").replace("sve.", "play.") + `/${gi.type}?name=${gi.name}&host=1&sessionID=${store.state.user.getSessionID()}`);
      });
    }

    componentDidMount() {
      super.componentDidMount();
      var self = this;
      f7ready((f7) => {
        LoginHook.add(() => {
          self.updateGames();
        });
      });
    }

    pageReinit() {
      this.updateGames();
    }

    pageAfterNavigate() {
      this.updateGames();
    }
};