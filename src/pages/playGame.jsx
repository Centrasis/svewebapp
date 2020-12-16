import * as React from 'react';
import { Page, Navbar, Link, Icon, Button, Col, Block, Row, Preloader } from 'framework7-react';
import Game from './GameScene';
import { UNO, Busdriver, Wizard, TheGame } from 'webgames';
import { GameState, GameRejectReason } from 'svebaselib';

export default class extends React.Component {
  constructor(props) {
    super(props);
    var newGame = undefined;

    let hosting = (props.f7route.params.isHost == "host");

    let gameinfo = {};
    if (hosting) {
      gameinfo = {
        gameState: GameState.Undetermined,
        host: this.$f7.data.getUser().getName(),
        gameType: props.f7route.params.game,
        maxPlayers: 6,
        name: props.f7route.params.id
      };
    } else {
      gameinfo = {
        gameState: GameState.Undetermined,
        host: this.$f7.data.getUser().getName(),
        gameType: props.f7route.params.game,
        maxPlayers: 6,
        name: props.f7route.params.id
      };
    }

    if(props.f7route.params.game.toLowerCase() == "thegame") {
      newGame = new TheGame(gameinfo);
    }
    if(props.f7route.params.game.toLowerCase() == "uno") {
      newGame = new UNO(gameinfo);
    }
    if(props.f7route.params.game.toLowerCase() == "busdriver") {
      newGame = new Busdriver(gameinfo);
    }
    if(props.f7route.params.game.toLowerCase() == "wizard") {
      newGame = new Wizard(gameinfo);
    }

    if(newGame == undefined) {
      var self = this;
      this.$f7ready((f7) => {
        f7.dialog.alert("No valid game specified! (" + self.state.name + ")");
        self.$f7router.back();
      });
      return;
    }

    console.log("Should: " + props.f7route.params.isHost + " game");

    this.state = {
      name: props.f7route.params.game,
      game: newGame,
      gameID: props.f7route.params.id,
      canvas: null,
      hasEnoughPlayers: false,
      IsGameRunning: false,
      IsHosting: hosting
    };
    newGame.OnGameStart = () => this.onRequestFullscreen();
    this.setState({game: newGame});
  }

  onSceneMount = (e) => {
    console.log("On mount scene component");
    const { canvas, scene, engine } = e;
    this.setState({ canvas: canvas});
  }

  onGameConnected = (success) => {
    if (success) {
      console.log("Connected to game as: " + ((this.state.IsHosting) ? "Host" : "Client"));
    }
    else {
      this.$f7.dialog.alert("Could not host or join the game!");
    }
  }

  render() {
    return (
      <Page name="TheGame">
        <Navbar title={"Play: " + this.state.name + " im Raum: " + this.state.gameID} backLink="Back">
          <Link href="#" onClick={this.onRequestFullscreen.bind(this)}>
            <Icon f7="play_rectangle" tooltip="Vollbild an"></Icon>
          </Link>
        </Navbar>
        <div style={{width: "100%", height: "90%"}}>
          {(this.state.game !== undefined) ? 
            <Game
              player={this.$f7.data.getUser()}
              onSceneMount={this.onSceneMount} 
              onGameConnected={this.onGameConnected}
              game={this.state.game}
              doHost={this.state.IsHosting}
              onGameRejected={this.onGameRejected.bind(this)}
              OnNewPlayer={this.OnNewPlayer.bind(this)}
              engineOptions={{
                stencil: true
              }}
              graphics={{resolution: { X: 1920, Y: 1080}}} 
              style={{width: "100%", height: "100%"}} 
            />
            : 
            <div>
              <div style={{justifyContent: "center", justifyItems: "center", position: "fixed", zIndex: "9", left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}>
                <span>Hosting...</span><br />
                <Preloader></Preloader>
              </div>
            </div> }
        </div>
        <Block largeInset>
        <Row>
          <Col><Button raised disabled={this.state.IsGameRunning || !this.state.IsHosting || (!this.state.IsGameRunning && !this.state.hasEnoughPlayers)} onClick={this.onStartGame.bind(this)}>Starte Spiel</Button></Col>
          <Col><Button raised disabled={!this.state.IsGameRunning || !this.state.IsHosting} onClick={this.onGiveUp.bind(this)}>Aufgeben</Button></Col>
        </Row>
        </Block>
      </Page>
    );
  }

  OnNewPlayer() {
    this.setState({hasEnoughPlayers: this.state.game.GetPlayersCount() >= this.state.game.MinPlayers()});
  }

  onGiveUp() {
    this.state.game.GiveUp();
    this.setState({IsGameRunning: this.state.game.IsRunning()});
  }

  onStartGame() {
    this.state.game.StartGame();
    this.setState({IsGameRunning: this.state.game.IsRunning()});
    this.onRequestFullscreen();
  }

  onGameRejected(reason) {
    if (reason == GameRejectReason.PlayerLimitExceeded) {
      this.$f7.dialog.alert("Spiel ist bereits voll!");
    }

    if (reason == GameRejectReason.GameNotPresent) {
      this.$f7.dialog.alert("Spiel ist nicht mehr vorhanden!");
    }
  }

  onRequestFullscreen() {
    this.state.canvas.requestFullscreen();
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      if (self.state.IsHosting) {
        self.state.game.create(self.$f7.data.getUser()).then(() => {
          console.log("Created new game!");
          self.forceUpdate();
        }, err => {
          f7.dialog.alert("Error on host new game!");
          self.setState({game: undefined});
        });
      } else {
        self.state.game.join(self.$f7.data.getUser()).then(() => self.forceUpdate(), err => console.log("JOINING FAILED!"));
      }
    });
  }

  componentWillUnmount() {
    this.state.game.EndGame();
  }
}