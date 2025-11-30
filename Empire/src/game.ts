import { Application, Container } from "pixi.js";
import { GameSettings } from "./types";
import { initializeMap } from "./mapInitialization";
import { CameraControls } from "./cameraControls";

let cameraControls: CameraControls;

export async function startGame(gameSettings: GameSettings) {
  const app = await gameInit(gameSettings);
  cameraControls.setCameraPosition(0, 0);
  app.ticker.add(() => gameLoop());

  showGameGui();
  setupKeyboardControls();
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
  const chatController = createChatController();

  window.addEventListener("keydown", (event) => {
    if (isTabKey(event)) {
      handleScoreboardToggle(event, scoreboardContainer);
    }

    if (isEnterKey(event)) {
      handleChatInteraction(event, chatController);
    }
  });
}

function createChatController() {
  const chatContainer = document.getElementById("chat-container");
  const chatInput = document.getElementById("chat-input") as HTMLInputElement;
  let chatState: "closed" | "open" = "closed";

  return {
    isOpen: () => chatState === "open",
    open: () => {
      chatContainer?.classList.add("visible");
      chatInput?.focus();
      chatState = "open";
    },
    close: () => {
      chatContainer?.classList.remove("visible");
      chatInput?.blur();
      chatState = "closed";
    },
    getMessage: () => chatInput?.value.trim() || "",
    clearInput: () => {
      if (chatInput) chatInput.value = "";
    },
    sendMessage: (message: string) => {
      console.log("Message sent:", message);
    },
  };
}

function isTabKey(event: KeyboardEvent): boolean {
  return event.key === "Tab";
}

function isEnterKey(event: KeyboardEvent): boolean {
  return event.key === "Enter";
}

function handleScoreboardToggle(
  event: KeyboardEvent,
  scoreboardContainer: HTMLElement | null,
) {
  event.preventDefault();
  scoreboardContainer?.classList.toggle("hidden");
}

function handleChatInteraction(
  event: KeyboardEvent,
  chatController: ReturnType<typeof createChatController>,
) {
  event.preventDefault();

  if (!chatController.isOpen()) {
    chatController.open();
    return;
  }

  const message = chatController.getMessage();

  if (message) {
    chatController.sendMessage(message);
    chatController.clearInput();
  } else {
    chatController.close();
  }
}

async function gameInit(gameSettings: GameSettings): Promise<Application> {
  console.log("Starting game...");

  const app = await createPixiApplication();
  const gameContainer = attachGameContainer(app);

  await initializeGameMap(app, gameContainer, gameSettings);

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

function attachGameContainer(app: Application): Container {
  const gameContainer = new Container();
  app.stage.addChild(gameContainer);
  return gameContainer;
}

async function initializeGameMap(
  app: Application,
  gameContainer: Container,
  gameSettings: GameSettings,
) {
  console.log("Game started with settings:", gameSettings);

  try {
    const TILE_SIZE = 16;
    const map = await initializeMap(app, gameContainer, gameSettings);
    cameraControls = new CameraControls(
      app,
      gameContainer,
      map.width * TILE_SIZE,
      map.height * TILE_SIZE,
    );
  } catch (error) {
    console.error("Error during map initialization:", error);
  }
}

function gameLoop() {
  cameraControls.update();
}
