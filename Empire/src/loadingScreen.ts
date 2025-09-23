import {
  Application,
  Assets,
  Container,
  Sprite,
  Text,
  SCALE_MODES,
} from "pixi.js";
import { startGame } from "./game";
import { GameSettings } from "./types";

export async function showLoadingScreen(settings: GameSettings) {
  try {
    const pixiContainer = document.getElementById("pixi-container");

    if (!pixiContainer) {
      console.error("Pixi container not found!");
      return;
    }

    pixiContainer.style.display = "block";

    const app = new Application();
    await app.init({ resizeTo: window });
    pixiContainer.appendChild(app.canvas);
    console.log("PIXI Application initialized");

    const loadingScreen = new Container();
    app.stage.addChild(loadingScreen);

    try {
      // Load assets
      const backgroundTexture = await Assets.load(
        "/src/textures/background.png",
      );
      const iconTexture = await Assets.load("/src/textures/icon.png");

      // Apply pixel art settings
      iconTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
      iconTexture.baseTexture.mipmap = false;

      console.log("Assets loaded successfully");

      // Setup background
      const background = new Sprite(backgroundTexture);
      background.width = app.screen.width;
      background.height = app.screen.height;
      loadingScreen.addChild(background);

      // Setup icon with animation properties
      const icon = new Sprite(iconTexture);
      icon.anchor.set(0.5);
      icon.position.set(app.screen.width / 2, app.screen.height / 2);
      loadingScreen.addChild(icon);

      // Animation settings
      const baseScale = 5;
      icon.scale.set(baseScale);
      let direction = 1;
      const bounceHeight = 30;
      const bounceSpeed = 3;
      const originalY = icon.position.y;
      const squishThreshold = 0.85;
      const squishFactor = 0.1;

      // Bounce and squish animation
      app.ticker.add((time) => {
        // Update position
        icon.position.y += direction * bounceSpeed * time.deltaTime;

        // Calculate normalized position in bounce cycle
        const normalizedPosition = Math.abs(
          (icon.position.y - originalY) / bounceHeight,
        );

        // Apply squish effect only near endpoints
        if (normalizedPosition > squishThreshold) {
          const intensity =
            (normalizedPosition - squishThreshold) / (1 - squishThreshold);

          if (direction < 0) {
            // Near bottom
            icon.scale.x = baseScale * (1 + squishFactor * intensity);
            icon.scale.y = baseScale * (1 - squishFactor * intensity);
          } else {
            // Near top
            icon.scale.x = baseScale * (1 - squishFactor * intensity);
            icon.scale.y = baseScale * (1 + squishFactor * intensity);
          }
        } else {
          // Reset to normal in the middle
          icon.scale.x = baseScale;
          icon.scale.y = baseScale;
        }

        // Bounce direction change
        if (icon.position.y < originalY - bounceHeight) {
          direction = 1;
        } else if (icon.position.y > originalY + bounceHeight) {
          direction = -1;
        }
      });
    } catch (error) {
      console.error("Error loading assets:", error);
      // Fallback text display
      const fallbackText = new Text("Loading...");
      fallbackText.style.fontFamily = "Arial";
      fallbackText.style.fontSize = 36;
      fallbackText.style.fill = "white";
      fallbackText.anchor.set(0.5);
      fallbackText.position.set(app.screen.width / 2, app.screen.height / 2);
      loadingScreen.addChild(fallbackText);
    }

    setTimeout(() => {
      app.destroy(true);
      pixiContainer.innerHTML = "";
      startGame(settings);
    }, 0);
  } catch (error) {
    console.error("Error in showLoadingScreen:", error);
    startGame(settings);
  }
}
