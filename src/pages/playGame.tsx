import * as React from 'react';
import { Page, Navbar, Link, Icon, Button, Col, Block, Row, Preloader } from 'framework7-react';
import { f7, f7ready, theme } from 'framework7-react';
//import { UNO, Busdriver, Wizard, TheGame } from 'webgames';
import store from '../components/store';
import Iframe from 'react-iframe';
import {SVEGame, SVEGameInfo, SVEGameServer} from 'svegamesapi';
import { SVEPageComponent } from '../components/SVEPageComponent';

export default class extends SVEPageComponent {
  protected game: SVEGameInfo | undefined = undefined;
  protected gameID: string;
  protected gameURL: string = "";

  constructor(props) {
    super(props);
    this.gameID = this.f7route.params.id;
  }

  customRender() {
    return (
      <Page name="TheGame">
        <Navbar title={"Play: " + ((this.game !== undefined) ? this.game.type : "") + " im Raum: " + this.gameID} backLink="Back">
          <Link href="#" onClick={this.onRequestFullscreen.bind(this)}>
            <Icon f7="play_rectangle" tooltip="Vollbild an"></Icon>
          </Link>
        </Navbar>
        {(this.f7route.params.isHost == "host") ? (
          <Block>
            <p style={{fontSize: "large"}}>Host</p>
          </Block>
        ) : ""}
        <div style={{width: "100%", height: "90%"}}>
          {(this.game !== undefined) ? (
            /*<Game
              player={store.state.user}
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
            />*/
              <Row>
                <Col width="10"></Col>
                <Col width="80" style={{
                  height: "83vh"
                }}>
                  <Iframe url={this.gameURL}
                    width="100%"
                    height="100%"
                    id="gameFrame"
                    display="block"
                    styles={{margin: "0"}}
                  />
                  <Block style={{margin: "0", display: "block"}}>
                    <Button style={{margin: "0", display: "block"}} fill onClick={() => window.open(this.gameURL)}>Spiele in eigenem Fenster</Button>
                  </Block>
                </Col>
                <Col width="10"></Col>
              </Row>
            )
            : 
              <div>
                <div style={{justifyContent: "center", justifyItems: "center", position: "fixed", zIndex: 9, left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}>
                  <span>Joining...</span><br />
                  <Preloader color="#11a802"></Preloader>
                </div>
              </div>
            }
        </div>
      </Page>
    );
  }

  onRequestFullscreen() {
  //  this.state.canvas.requestFullscreen();
  }

  componentDidMount() {
    var self = this;
    f7ready((f7) => {
      SVEGameServer.listGames(store.state.user).then(gs => {
        gs.forEach(g => {
          if (g.name === this.gameID) {
            self.game = g;
          }
        });
        self.gameURL = "https://" + window.location.hostname.replace("www.", "play.").replace("sve.", "play.") + "/" + self.game.type + "/?name=" + self.game.id + "&sessionID=" + store.state.user.getSessionID();
        self.forceUpdate();
      });
    });
  }
}