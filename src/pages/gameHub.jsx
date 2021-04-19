import React from 'react';
import { Page, Navbar, Block, BlockTitle, Row, List, Button, ListInput, ListItem } from 'framework7-react';
//import { SVEGameServer } from 'svegamesapi';
import { f7, f7ready, theme } from 'framework7-react';
import store from '../components/store';
import { LoginHook } from '../components/LoginHook';

export default class extends React.Component {
  constructor(props) {
    super(props);  

    this.state = {
      newGame: {
        name: "",
        type: ""
      },
      foundGames: []
    };
  }

  render() {
    return (
      <Page>
        <Navbar title="Spiele-Hub" />
        <Block strong mediumInset>
          <BlockTitle>Spiel beitreten</BlockTitle>
          <List>
          {this.state.foundGames.map((game) => (
            <ListItem mediaItem
              key={game.name}
              title={game.name}
              subtitle={"Host: " + game.host + " Players: (" + game.playersCount + "/" + game.maxPlayers + ")"}
              footer={"Spiel: " + this.gameTypeToReadable(game.gameType)}
              link={`/playgame/${game.gameType}/${game.name}/join/`}
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
              value={this.state.newGame.name}
              onInput={(e) => {
                this.setState({ newGame: {name: e.target.value, type: this.state.newGame.type }});
              }}
            ></ListInput>

            <ListInput
              label="Spieltyp"
              type="select"
              smartSelect
              smartSelectParams={{openIn: 'sheet'}}
              value={this.state.newGame.type}
              onInput={(e) => {
                this.setState({ newGame: {type: e.target.value, name: this.state.newGame.name }});
              }}
            >
              <option value="">Undefiniert</option>
              <option value="TheGame">The Game</option>
              <option value="Uno">Uno</option>
              <option value="Busdriver">Busfahrer</option>
              <option value="Wizard">Wizard</option>
            </ListInput>
            </List>
            <Block largeInset strong>
              <Row tag="p">
                <Button disabled={this.state.newGame.type == "" || this.state.newGame.name == ""} className="col" raised fill onClick={this.hostGame.bind(this)}>Hosten</Button>
              </Row>
            </Block>
        </Block>
      </Page>
    )}

    updateGames() {
      this.foundGames = []; this.forceUpdate();

      /*SVEGameServer.listGames(store.state.user).then((infos) => {
        let list = [];
        infos.forEach(i => {
          list.push({
            host: i.host.getName(),
            gameType: "Survival",
            name: i.name,
            playersCount: i.playersCount,
            maxPlayers: i.maxPlayers
          });
        });
        this.foundGames = list; this.forceUpdate();
      });*/
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
      f7.view.current.router.navigate("/playgame/" + this.state.newGame.type + "/" + this.state.newGame.name + "/host/");
    }

    componentDidMount() {
      var self = this;
      f7ready((f7) => {
        LoginHook.add(() => {
          self.updateGames();
        });
      });
    }
};