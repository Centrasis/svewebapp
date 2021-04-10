import React, { useState, useEffect } from 'react';
//import * as BABYLON from 'babylonjs';
//import BaseGame from 'webgames/dist/BaseGame';
import { SVEAccount } from 'svebaselib';
import { GameRejectReason } from 'svegamesapi';

export type SceneEventArgs = {
  //engine: BABYLON.Engine,
  //scene: BABYLON.Scene,
  canvas: HTMLCanvasElement
};

export type GraphicsSettings = {
  resolution: {
    X: number,
    Y: number
  }
}

export type SceneProps = {
  //engineOptions?: BABYLON.EngineOptions,
  adaptToDeviceRatio?: boolean,
  onSceneMount?: (args: SceneEventArgs) => void,
  onGameConnected?: (success: Boolean) => void,
  onGameRejected?: (reason: GameRejectReason) => void,
  OnNewPlayer: () => void,
  graphics?: GraphicsSettings,
  game: any,// BaseGame,
  doHost: Boolean,
  player: SVEAccount
};

export default class Game extends React.Component<SceneProps & React.HTMLAttributes<HTMLCanvasElement>, {}> {
  //private scene: BABYLON.Scene;
  //private engine: BABYLON.Engine;
  private canvas: HTMLCanvasElement;
  protected game: any;

  onResizeWindow = () => {
    //if (this.engine) {
    //  this.engine.resize();
    //}
  }

  componentDidMount () {
    let canvasDOM = document.getElementsByTagName("canvas");

    let resolution = {
      X: 1920,
      Y: 1080
    };
    
    if (!this.props.graphics)
    {
      resolution = this.props.graphics.resolution;
    }

    for (let i = 0; i < canvasDOM.length; i++) { 
      canvasDOM[i].style.width = resolution.X + "px";
      canvasDOM[i].style.height = resolution.Y + "px";
    }

    /*this.engine = new BABYLON.Engine(
        this.canvas,
        true,
        this.props.engineOptions,
        this.props.adaptToDeviceRatio
    );

    for (let i = 0; i < canvasDOM.length; i++) { 
      canvasDOM[i].style.width = "100%";
      canvasDOM[i].style.height = "100%";
    }

    console.log("Mount scene:");

    this.game = this.props.game;
    this.game.OnGameRejected = this.props.onGameRejected;
    this.game.OnNewPlayer = this.props.OnNewPlayer;

    if (!this.game)
    {
      console.log("No game defined!");
    }
    else
    {
      console.log("Game was: " + this.game.name);
    }

    let scene = this.game?.CreateScene(this.engine, this.canvas);

    var self = this;
    this.engine.runRenderLoop(() => {
      if (scene) {
        scene.render();
        self.game.Tick();
      }
    });

    var self = this;

    this.game.OnConnected = function(success) {
      console.log("On connected game to server.");
      if (typeof self.props.onGameConnected === 'function') {
        self.props.onGameConnected(success);
      } else {
        console.error('onGameConnected function not available');
      }
      
      if(success) {
        //AddPlayer
      }
  
      if (typeof self.props.onSceneMount === 'function') {
        self.props.onSceneMount({
          scene,
          engine: self.engine,
          canvas: self.canvas
        });
      } else {
        console.error('onSceneMount function not available');
      }
    };

    window.addEventListener('resize', this.onResizeWindow);*/
  }
  
  componentWillUnmount () {
    window.removeEventListener('resize', this.onResizeWindow);
  }

  onCanvasLoaded = (c : HTMLCanvasElement) => {
    if (c !== null) {
      this.canvas = c;
    }
  }

  render () {
    // 'rest' can contain additional properties that you can flow through to canvas:

    let opts: any = {};

    return (
      <canvas
        touch-action="none"
        {...opts}
        ref={this.onCanvasLoaded}
      />
    )
  }
}