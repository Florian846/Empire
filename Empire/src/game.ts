import { Application, Container } from "pixi.js";
import { GameSettings } from "./types";
import { initializeMap } from "./mapInitialization";
import { CameraControls } from "./cameraControls";
import { ChatSystem } from "./chat"; // Import the new ChatSystem
import { MinimapRenderer } from "./minimapRenderer";

let cameraControls: CameraControls;

export async function startGame(gameSettings: GameSettings) {
  const app = await gameInit(gameSettings);
  cameraControls.setCameraPosition(0, 0);
  app.ticker.add(() => gameLoop());

  showGameGui();
  const chatSystem = new ChatSystem(gameSettings); // Instantiate the new ChatSystem
  chatSystem.pushMessage(
    "Server",
    `${gameSettings.playerName} ist der Runde beigetreten`,
  );
  setupKeyboardControls(); // No longer needs gameSettings
}

function showGameGui() {
  const gameGuiContainer = document.getElementById("game-gui-container");
  if (gameGuiContainer) {
    gameGuiContainer.removeAttribute("hidden");
    gameGuiContainer.style.display = "block";
  }
}

function setupKeyboardControls() {
  const scoreboardContainer = document.getElementById("scoreboard-container");

  window.addEventListener("keydown", (event) => {
    if (isTabKey(event)) {
      handleScoreboardToggle(event, scoreboardContainer);
    }
  });
}

function isTabKey(event: KeyboardEvent): boolean {
  return event.key === "Tab";
}

function handleScoreboardToggle(
  event: KeyboardEvent,
  scoreboardContainer: HTMLElement | null,
) {
  event.preventDefault();
  scoreboardContainer?.classList.toggle("hidden");
}

async function gameInit(gameSettings: GameSettings): Promise<Application> {
  console.log("Starting game...");

  const app = await createPixiApplication();
  const gameContainer = attachGameContainer(app);
  const minimapApp = await createMinimapPixiApplication();

  await initializeGameMap(app, gameContainer, minimapApp, gameSettings);

  return app;
}

async function createPixiApplication(): Promise<Application> {
  const app = new Application();
  await app.init({
    resizeTo: window,
    antialias: true,
    powerPreference: "high-performance",
    backgroundColor: 0x000000,
  });

  const pixiContainer = document.getElementById("pixi-container");
  if (!pixiContainer) {
    throw new Error("Pixi container not found!");
  }
  pixiContainer.appendChild(app.view);

  return app;
}

async function createMinimapPixiApplication(): Promise<Application> {
  const minimapApp = new Application();
  const minimapCanvas = document.getElementById("minimap-canvas");
  if (!minimapCanvas) {
    throw new Error("Minimap canvas not found!");
  }

  await minimapApp.init({
    width: 200, // Fixed size for the minimap
    height: 200, // Fixed size for the minimap
    backgroundColor: 0x000000,
    preference: "webgl",
    antialias: true,
    view: minimapCanvas as HTMLCanvasElement,
  });

  return minimapApp;
}

function attachGameContainer(app: Application): Container {
  const gameContainer = new Container();
  app.stage.addChild(gameContainer);
  return gameContainer;
}

async function initializeGameMap(
  app: Application,
  gameContainer: Container,
  minimapApp: Application, // Added minimapApp
  gameSettings: GameSettings,
) {
  console.log("Game started with settings:", gameSettings);

  let minimapRenderer: MinimapRenderer; // Declare minimapRenderer locally

  try {
    const TILE_SIZE = 16;
    const map = await initializeMap(app, gameContainer, gameSettings);
    cameraControls = new CameraControls(
      app,
      gameContainer,
      map.width * TILE_SIZE,
      map.height * TILE_SIZE,
    );

    minimapRenderer = new MinimapRenderer(app, minimapApp, map, cameraControls); // Pass both apps
    minimapRenderer.renderMapToMinimap();
    // minimapApp.stage is the minimapContainer, so we just add to it directly
    minimapApp.stage.addChild(minimapRenderer.minimapGraphics); // Add map graphics to minimapApp's stage
    minimapApp.stage.addChild(minimapRenderer.cameraViewRect); // Add camera view rect to minimapApp's stage
    // Also add minimapBackground directly to minimapApp.stage if not part of minimapGraphics

    minimapApp.ticker.add(() => minimapRenderer.updateCameraView()); // Update minimap's camera view via its own ticker
  } catch (error) {
    console.error("Error during map initialization:", error);
  }
}

function gameLoop() {
  cameraControls.update();
  // minimapRenderer.updateCameraView(); // This is now handled by minimapApp's ticker
}
