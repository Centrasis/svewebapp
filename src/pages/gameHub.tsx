import React from 'react';
import { Page, Navbar, Block, BlockTitle, Row, List, Button, ListInput, ListItem } from 'framework7-react';
import { SVEGameServer, SVEGame, SVEGameInfo } from 'svegamesapi';
import { f7, f7ready, theme } from 'framework7-react';
import store from '../components/store';
import { LoginHook } from '../components/LoginHook';
import { SVEPageComponent } from '../components/SVEPageComponent';

export default class extends SVEPageComponent {
  newGameName: string = "";
  newGameType: string = "";
  foundGames: SVEGameInfo[] = [];

  constructor(props) {
    super(props);  

  }

  protected customRender() {
    return (
      <Page>
        <Navbar title="Spiele-Hub" backLink="Back"/>
        <Block strong mediumInset>
          <BlockTitle>Spiel beitreten</BlockTitle>
          <List>
          {this.foundGames.map((game) => (
            <ListItem mediaItem
              key={game.name}
              title={game.name}
              subtitle={"Host: " + game.host + " Players: (" + game.playersCount + "/" + game.maxPlayers + ")"}
              footer={"Spiel: Unbekannt"}
              link={`/playgame/survival/${game.name}/join/`}
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
              <option value="Survival">Survival</option>
              <option value="TheGame">The Game</option>
              <option value="Uno">Uno</option>
              <option value="Busdriver">Busfahrer</option>
              <option value="Wizard">Wizard</option>
            </ListInput>
            </List>
            <Block largeInset strong>
              <Row tag="p">
                <Button disabled={this.newGameName == "" || this.newGameType == ""} className="col" raised fill onClick={this.hostGame.bind(this)}>Hosten</Button>
              </Row>
            </Block>
        </Block>
      </Page>
    )}

    updateGames() {
      this.foundGames = []; this.forceUpdate();

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
      f7.view.current.router.navigate("/playgame/" + this.newGameType + "/" + this.newGameName + "/host/");
    }

    componentDidMount() {
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