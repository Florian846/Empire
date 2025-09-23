import { Application, Container } from "pixi.js";
import { GameSettings } from "./types";
import { initializeMap } from "./mapInitialization";
import { CameraControls } from "./cameraControls";

let cameraControls: CameraControls;

export async function startGame(settings: GameSettings) {
  const app = await gameInit(settings);
  cameraControls.setCameraPosition(0, 0); // Setzt Kamera auf Position (100, 50)
  app.ticker.add(() => gameLoop());
}

async function gameInit(settings: GameSettings): Promise<Application> {
  console.log("Starting game...");
  const app = new Application();
  await app.init({ resizeTo: window });

  const pixiContainer = document.getElementById("pixi-container");
  if (!pixiContainer) {
    throw new Error("Pixi container not found!");
  }
  pixiContainer.appendChild(app.view);

  const gameContainer = new Container();
  app.stage.addChild(gameContainer);

  console.log("Game started with settings:", settings);

  try {
    const map = await initializeMap(app, gameContainer, settings);
    cameraControls = new CameraControls(app, gameContainer);
  } catch (error) {
    console.error("Error during map initialization:", error);
  }

  return app;
}

function gameLoop() {
  // Update camera controls every frame
  cameraControls.update();
}
