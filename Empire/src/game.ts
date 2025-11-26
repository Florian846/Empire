import { Application, Container } from "pixi.js";
import { GameSettings } from "./types";
import { initializeMap } from "./mapInitialization";
import { CameraControls } from "./cameraControls";

let cameraControls: CameraControls;

export async function startGame(gameSettings: GameSettings) {
  const app = await gameInit(gameSettings);
  cameraControls.setCameraPosition(0, 0); // Setzt Kamera auf Position (100, 50)
  app.ticker.add(() => gameLoop());

  const gameGuiContainer = document.getElementById("game-gui-container");
  if (gameGuiContainer) {
    gameGuiContainer.classList.remove("hidden");
  }

  // Get GUI elements
  const scoreboardContainer = document.getElementById("scoreboard-container");
  const chatContainer = document.getElementById("chat-container");
  const chatInput = document.getElementById("chat-input") as HTMLInputElement;

  window.addEventListener("keydown", (event) => {
    // Toggle scoreboard with Tab key
    if (event.key === "Tab") {
      event.preventDefault();
      if (scoreboardContainer) {
        scoreboardContainer.classList.toggle("hidden");
      }
    }

    // Toggle chat with Enter key
    if (event.key === "Enter") {
      event.preventDefault();
      if (chatContainer) {
        chatContainer.classList.toggle("visible");
        if (chatContainer.classList.contains("visible")) {
          chatInput?.focus();
        } else {
          chatInput?.blur();
        }
      }
    }
  });
}

async function gameInit(gameSettings: GameSettings): Promise<Application> {
  console.log("Starting game...");
  const app = new Application();
  await app.init({ resizeTo: window, antialias: true, powerPreference: 'high-performance' });

  const pixiContainer = document.getElementById("pixi-container");
  if (!pixiContainer) {
    throw new Error("Pixi container not found!");
  }
  pixiContainer.appendChild(app.view);

  const gameContainer = new Container();
  app.stage.addChild(gameContainer);

  console.log("Game started with settings:", gameSettings);

  try {
    const map = await initializeMap(app, gameContainer, gameSettings);
    const TILE_SIZE = 16;
    cameraControls = new CameraControls(app, gameContainer, map.width * TILE_SIZE, map.height * TILE_SIZE);
  } catch (error) {
    console.error("Error during map initialization:", error);
  }

  return app;
}

function gameLoop() {
  // Update camera controls every frame
  cameraControls.update();
}
