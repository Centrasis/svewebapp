import React from 'react';
import { Page, Navbar, Block, BlockTitle, Row, List, Button, ListInput, ListItem, Col, AccordionContent, Icon } from 'framework7-react';
import { SVEGameServer, SVEGame, SVEGameInfo, GameState, SVEStaticGameInfo } from 'svegamesapi';
import { f7, f7ready, theme } from 'framework7-react';
import store from '../components/store';
import { LoginHook } from '../components/LoginHook';
import { SVEPageComponent } from '../components/SVEPageComponent';
import { SVEAccount } from 'svebaselib';
import { getDevice } from 'framework7';
import { height } from 'dom7';

class AnonymousAccountCreationPanel<P = {}> extends React.Component<P & React.HTMLAttributes<HTMLCanvasElement>, {}> {
  public tempUserName: string = "";

  protected createUserName(): string {
    let names = ["Todesschabe", "KomischerDude1Elf", "Evaporator", "Gamer8", "Bender", "Decay", "BigPapa", "Hotdog", "Starbug", "Helo", "Cobra"];
    return names[Math.floor(Math.random() * names.length)];
  }

  protected registerTempUser() {
    SVEAccount.registerTemporaryUser(this.tempUserName).then(usr => {
      LoginHook.call(usr);
    });
  }

  componentDidMount() {
    this.tempUserName = this.createUserName();

    this.forceUpdate();
  }

  render () {   
    return (
      <Block>
        <Row>
          <Col width="70" style={{textAlign: "center"}}><BlockTitle>Anonymen Nutzer erstellen</BlockTitle></Col>
          <Col width="15"></Col>
        </Row>
        <Row>
          <Col width={7.5}></Col>
          <Col width="85" style={{textAlign: "center"}}>
            <List noHairlinesMd>
              <ListInput
                style={{
                  margin: "0",
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                  maxWidth: "50%", 
                  minWidth: "200px",
                }}
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
          </Col>
          <Col width={7.5}></Col>
        </Row>
        <Row>
          <Col width="15"></Col>
          <Col width={70} style={{textAlign: "center"}}>
            <Button style={{
              maxWidth: "50%", 
              minWidth: "200px",
              margin: "0",
            }} onClick={() => this.registerTempUser()} fill>
              Erstellen
            </Button>
          </Col>
          <Col width="15"></Col>
        </Row>
      </Block>
    )
  }
}

export default class extends SVEPageComponent {
  newGame: SVEGameInfo;
  foundGames: SVEGameInfo[] = [];
  foundGameTypes: SVEStaticGameInfo[] = [];
  tempUserName: string = "";

  constructor(props) {
    super(props);
    this.newGame = {
      name: "",
      assetPath: "",
      host: "",
      id: 0,
      maxPlayers: 0,
      minPlayers: 0,
      playersCount: 0,
      state: GameState.UnReady,
      type: ""
    }
  } 

  protected customRender() {
    return (
      <Page>
        <Navbar title="Spiele-Hub" backLink="Back"/>
          {(store.state.user === undefined) ? (
            <Block>
              <Row>
                <Col width="100" style={{textAlign: "center"}}>
                  <p style={{fontSize: "large", fontWeight: "bold"}}>Sie sind nicht eingeloggt</p>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Row></Row>
                    <Col width="7.5"></Col>
                      <Col width="85">
                      {(getDevice().desktop) ? (
                        <Row>
                          <Col>
                            <Row><BlockTitle>Account vorhanden?</BlockTitle></Row>
                            <Row>
                              <Col>
                                <Button onClick={() => this.f7router.navigate("/login/")} fill>
                                  Einloggen
                                </Button>
                              </Col>
                            </Row>
                            <Row>&nbsp;</Row>
                          </Col>
                          <Col>
                            <AnonymousAccountCreationPanel></AnonymousAccountCreationPanel>
                          </Col>
                        </Row>
                    ) : (
                      <Row>
                        <Col>
                          <Row><BlockTitle>Account vorhanden?</BlockTitle></Row>
                          <Row>
                            <Col>
                              <Button onClick={() => this.f7router.navigate("/login/")} fill>
                                Einloggen
                              </Button>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <Row><BlockTitle>Oder</BlockTitle></Row>
                              <AnonymousAccountCreationPanel></AnonymousAccountCreationPanel>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    )}
                    </Col>
                    <Col width="7.5"></Col>
                  <Row></Row>
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
              link={`/playgame/${game.name}/client`}
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
          <List accordionList accordionOpposite>
            <ListInput
              label="Spielname"
              type="text"
              placeholder={"Spielname"}
              value={this.newGame.name}
              onInput={(e) => {
                this.newGame.name = e.target.value;
                this.forceUpdate();
              }}
            ></ListInput>

            <ListInput
              label="Spieltyp"
              type="select"
              value={this.newGame.type}
              onInput={(e) => {
                this.newGame.type = e.target.value;
                const possiblePrefabs = this.foundGameTypes.filter(e => e.type === this.newGame.type);
                if (possiblePrefabs.length > 0) {
                  const prefab = possiblePrefabs[0];
                  this.newGame.assetPath = prefab.assetPath;
                  this.newGame.maxPlayers = prefab.maxPlayers;
                  this.newGame.minPlayers = prefab.minPlayers;
                  this.newGame.host = this.user;
                } else {
                  this.newGame.name = "";
                }
                this.forceUpdate();
              }}
            >
              <option value="">Undefiniert</option>
              {this.foundGameTypes.map(t => (
                <option value={t.type}>{t.type}</option>
              ))}
            </ListInput>
            {(this.newGame.type !== "") ? (
              <ListItem accordionItem title="Spielinformationen">
                <Icon slot="media" f7="info_circle" />
                <AccordionContent>
                  <Block>
                    <List mediaList>
                      <ListItem title="Maximale Spieleranzahl">{this.newGame.maxPlayers}</ListItem>
                      <ListItem title="Minimale Spieleranzahl">{this.newGame.minPlayers}</ListItem>
                    </List>
                  </Block>
                </AccordionContent>
              </ListItem>) : ""}
            </List>
            <Block largeInset strong>
              <Row tag="p">
                <Button disabled={this.newGame.name == "" || this.newGame.type == "" || store.state.user === undefined} className="col" raised fill onClick={this.hostGame.bind(this)}>Hosten</Button>
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
      console.log("Host game: " + this.newGame.name + " as " + store.state.user.getName());
      SVEGameServer.hostGame(this.newGame).then(gi => {
        this.updateGames();
        this.f7router.navigate("/playgame/" + gi.name + "/host");
      }, err => f7.dialog.alert("Spiel konnte nicht erstellt werden! Eventuell ist der Name bereits vergeben: " + JSON.stringify(err.reason)));
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