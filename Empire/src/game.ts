import { Application, Container } from "pixi.js";
import { GameSettings } from "./types";
import { initializeMap } from "./mapInitialization";
import { CameraControls } from "./cameraControls";
import { ChatSystem } from "./chat";
import { MinimapRenderer } from "./minimapRenderer";
import { MusicPlayer } from "./musicPlayer";
import { GuiManager } from "./ui/guiManager";
import { InGameMenu } from "./ui/inGameMenu";
import { KeyboardControls } from "./ui/keyboardControls";
import { PixiApplicationFactory } from "./pixiApplicationFactory";

const TILE_SIZE = 16;

let app: Application;
let gameContainer: Container;
let cameraControls: CameraControls;
let musicPlayer: MusicPlayer;

export async function startGame(gameSettings: GameSettings) {
  app = await gameInit(gameSettings);
  cameraControls.setCameraPosition(0, 0);
  app.ticker.add(() => gameLoop());

  const guiManager = new GuiManager();
  guiManager.showGameGui();

  const chatSystem = new ChatSystem(gameSettings);
  chatSystem.pushMessage("Server", `${gameSettings.playerName} ist der Runde beigetreten`);

  new KeyboardControls();

  musicPlayer = new MusicPlayer();
  musicPlayer.start();

  new InGameMenu(app, musicPlayer);

  console.log("Filters applied to gameContainer.filters. Length:");
}

async function gameInit(gameSettings: GameSettings): Promise<Application> {
  const tempApp = await PixiApplicationFactory.createMainApplication();
  gameContainer = attachGameContainer(tempApp);
  const minimapApp = await PixiApplicationFactory.createMinimapApplication();

  await initializeGameMap(tempApp, gameContainer, minimapApp, gameSettings);

  return tempApp;
}

function attachGameContainer(app: Application): Container {
  const gameContainer = new Container();
  app.stage.addChild(gameContainer);
  return gameContainer;
}

async function initializeGameMap(
    app: Application,
    gameContainer: Container,
    minimapApp: Application,
    gameSettings: GameSettings,
) {
  console.log("Game started with settings:", gameSettings);

  try {
    const map = await initializeMap(app, gameContainer, gameSettings);
    cameraControls = new CameraControls(
        app,
        gameContainer,
        map.width * TILE_SIZE,
        map.height * TILE_SIZE,
    );

    const minimapRenderer = new MinimapRenderer(
        app,
        minimapApp,
        map,
        cameraControls,
        TILE_SIZE,
    );
    minimapRenderer.renderMapToMinimap();
    minimapApp.ticker.add(() => minimapRenderer.updateCameraView());
  } catch (error) {
    console.error("Error during map initialization:", error);
  }
}

function gameLoop() {
  cameraControls.update();
}