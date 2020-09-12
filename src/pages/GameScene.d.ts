import React from 'react';
import * as BABYLON from 'babylonjs';
import { GameRejectReason } from 'webgames';
import BaseGame from 'webgames/dist/BaseGame';
export declare type SceneEventArgs = {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    canvas: HTMLCanvasElement;
};
export declare type GraphicsSettings = {
    resolution: {
        X: number;
        Y: number;
    };
};
export declare type SceneProps = {
    engineOptions?: BABYLON.EngineOptions;
    adaptToDeviceRatio?: boolean;
    onSceneMount?: (args: SceneEventArgs) => void;
    onGameConnected?: (success: Boolean) => void;
    onGameRejected?: (reason: GameRejectReason) => void;
    OnNewPlayer: () => void;
    graphics?: GraphicsSettings;
    game: BaseGame;
    gameID: String;
    doHost: Boolean;
    player: String;
};
export default class Game extends React.Component<SceneProps & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    private scene;
    private engine;
    private canvas;
    protected game: BaseGame;
    onResizeWindow: () => void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    onCanvasLoaded: (c: HTMLCanvasElement) => void;
    render(): JSX.Element;
}
//# sourceMappingURL=GameScene.d.ts.map