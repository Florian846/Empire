import { Application, Container } from "pixi.js";
import { GameSettings } from "./types";
import { initializeMap } from "./mapInitialization";
import { CameraControls } from "./cameraControls";
import { ChatSystem } from "./chat";
import { MinimapRenderer } from "./minimapRenderer";
import { MusicPlayer } from "./musicPlayer";
import { CRTFilter } from "@pixi/filter-crt";

let app: Application; // Make app globally accessible
let gameContainer: Container; // Make gameContainer globally accessible
let cameraControls: CameraControls;
let musicPlayer: MusicPlayer;
let crtFilter: CRTFilter; // Declare globally

export async function startGame(gameSettings: GameSettings) {
  app = await gameInit(gameSettings); // Assign to global app
  cameraControls.setCameraPosition(0, 0);
  app.ticker.add(() => gameLoop());

  showGameGui();
  const chatSystem = new ChatSystem(gameSettings); // Instantiate the new ChatSystem
  chatSystem.pushMessage(
    "Server",
    `${gameSettings.playerName} ist der Runde beigetreten`,
  );
  setupKeyboardControls();

  musicPlayer = new MusicPlayer();
  musicPlayer.start();

  crtFilter = new CRTFilter({
    lineWidth: 2,
    lineContrast: 0.5,
    vignetting: 0.5,
    vignettingAlpha: 0.8,
    vignettingBlur: 0.3,
    curvature: 1,
    verticalLine: false,
    noise: 0.7,
    time: 0,
  });
  crtFilter.enabled = true;
  console.log("CRTFilter initialized:", crtFilter);

  // Apply filters to the gameContainer
  // Filters will be managed by their 'enabled' property
  gameContainer.filters = [crtFilter];
  console.log(
    "Filters applied to gameContainer.filters. Length:",
    gameContainer.filters.length,
  );

  setupInGameMenu(app, gameContainer);
}

function showGameGui() {
  const gameGuiContainer = document.getElementById("game-gui-container");
  if (gameGuiContainer) {
    gameGuiContainer.removeAttribute("hidden");
    gameGuiContainer.style.display = "block";
  }
}

function setupInGameMenu(app: Application, gameContainer: Container) {
  const ingameSettingsButton = document.getElementById(
    "ingame-settings-button",
  );
  const ingameMenuContainer = document.getElementById("ingame-menu-container");
  const closeMenuButton = document.getElementById("close-menu-button");
  const pixiContainer = document.getElementById("pixi-container");
  const backToMainMenuButton = document.getElementById(
    "back-to-main-menu-button",
  );

  const masterVolumeSlider = document.getElementById(
    "master-volume",
  ) as HTMLInputElement;
  const musicVolumeSlider = document.getElementById(
    "music-volume",
  ) as HTMLInputElement;
  const effectsVolumeSlider = document.getElementById(
    "effects-volume",
  ) as HTMLInputElement;

  // New UI element references for filters
  const crtFilterCheckbox = document.getElementById(
    "crt-filter",
  ) as HTMLInputElement;

  const saveSettings = () => {
    const settings = {
      masterVolume: masterVolumeSlider.value,
      musicVolume: musicVolumeSlider.value,
      effectsVolume: effectsVolumeSlider.value,
      crtFilterEnabled: crtFilterCheckbox.checked,
    };
    localStorage.setItem("gameSettings", JSON.stringify(settings));
  };

  const updateMusicVolume = () => {
    if (!musicPlayer) return;
    const masterVolume = parseFloat(masterVolumeSlider.value);
    const musicVolume = parseFloat(musicVolumeSlider.value);
    musicPlayer.setVolume(masterVolume * musicVolume);
  };

  const applyFilterSettings = () => {
    if (crtFilter && gameContainer) {
      // Ensure filters and gameContainer are initialized
      crtFilter.enabled = crtFilterCheckbox.checked;
      // Apply filters to gameContainer
      gameContainer.filters = [crtFilter].filter((f) => f.enabled); // Only apply enabled filters
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      masterVolumeSlider.value = settings.masterVolume;
      musicVolumeSlider.value = settings.musicVolume;
      effectsVolumeSlider.value = settings.effectsVolume;

      // Load filter settings
      crtFilterCheckbox.checked =
        settings.crtFilterEnabled !== undefined
          ? settings.crtFilterEnabled
          : false;
    }
    updateMusicVolume(); // Apply volume
    applyFilterSettings(); // Apply filters after loading
  };

  const openMenu = () => {
    ingameMenuContainer?.classList.add("visible");
    pixiContainer?.classList.add("paused");
    app.ticker.stop();
  };

  const closeMenu = () => {
    ingameMenuContainer?.classList.remove("visible");
    pixiContainer?.classList.remove("paused");
    app.ticker.start();
  };

  ingameSettingsButton?.addEventListener("click", openMenu);
  closeMenuButton?.addEventListener("click", closeMenu);

  backToMainMenuButton?.addEventListener("click", () => {
    window.location.reload();
  });

  masterVolumeSlider?.addEventListener("input", () => {
    updateMusicVolume();
    saveSettings();
  });
  musicVolumeSlider?.addEventListener("input", () => {
    updateMusicVolume();
    saveSettings();
  });

  effectsVolumeSlider?.addEventListener("input", () => {
    console.log(`Effects volume set to: ${effectsVolumeSlider.value}`);
    saveSettings();
  });

  // Add event listeners for filter controls
  crtFilterCheckbox?.addEventListener("change", () => {
    applyFilterSettings();
    saveSettings();
  });

  loadSettings();
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

  const tempApp = await createPixiApplication();
  gameContainer = attachGameContainer(tempApp); // Assign to global gameContainer
  const minimapApp = await createMinimapPixiApplication();

  await initializeGameMap(tempApp, gameContainer, minimapApp, gameSettings); // Corrected: use tempApp

  return tempApp;
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
  app: Application, // This 'app' is the one passed from gameInit (tempApp)
  gameContainer: Container,
  minimapApp: Application,
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

    minimapRenderer = new MinimapRenderer(
      app,
      minimapApp,
      map,
      cameraControls,
      TILE_SIZE,
    ); // Pass both apps
    minimapRenderer.renderMapToMinimap();
    // minimapApp.stage is the minimapContainer, so we just add to it directly
    minimapApp.ticker.add(() => minimapRenderer.updateCameraView()); // Update minimap's camera view via its own ticker
  } catch (error) {
    console.error("Error during map initialization:", error);
  }
}

function gameLoop() {
  cameraControls.update();
  // minimapRenderer.updateCameraView(); // This is now handled by minimapApp's ticker

  // Animate CRT scanlines if the filter is enabled
  if (crtFilter && crtFilter.enabled && app) {
    crtFilter.time += app.ticker.deltaMS / 1000;
  }
}
