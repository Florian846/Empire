import {
    Application,
    Assets,
    Container,
    Sprite,
    Text,
    SCALE_MODES,
    Graphics,
} from "pixi.js";
import { startGame } from "./game";
import { GameSettings } from "./types";
import { loadMapTextures } from "./mapTextureLoader";

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
            // Load UI assets
            const backgroundTexture = await Assets.load("/src/textures/background.png");
            const iconTexture = await Assets.load("/src/textures/icon.png");

            iconTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
            iconTexture.baseTexture.mipmap = false;

            console.log("UI Assets loaded successfully");

            // Setup background
            const background = new Sprite(backgroundTexture);
            background.width = app.screen.width;
            background.height = app.screen.height;
            loadingScreen.addChild(background);

            // Setup icon
            const icon = new Sprite(iconTexture);
            icon.anchor.set(0.5);
            icon.position.set(app.screen.width / 2, app.screen.height / 2 - 50);
            loadingScreen.addChild(icon);

            // Create progress bar
            const progressBarWidth = 300;
            const progressBarHeight = 20;
            const progressBarY = app.screen.height / 2 + 100;

            const progressBarBg = new Graphics();
            progressBarBg.rect(
                app.screen.width / 2 - progressBarWidth / 2,
                progressBarY,
                progressBarWidth,
                progressBarHeight
            );
            progressBarBg.fill(0x333333);
            progressBarBg.stroke({ width: 2, color: 0xffffff });
            loadingScreen.addChild(progressBarBg);

            const progressBarFill = new Graphics();
            loadingScreen.addChild(progressBarFill);

            const progressText = new Text("Loading: 0%");
            progressText.style.fontFamily = "Arial";
            progressText.style.fontSize = 18;
            progressText.style.fill = "white";
            progressText.anchor.set(0.5);
            progressText.position.set(app.screen.width / 2, progressBarY + 40);
            loadingScreen.addChild(progressText);

            // Icon animation
            const baseScale = 5;
            icon.scale.set(baseScale);
            let direction = 1;
            const bounceHeight = 30;
            const bounceSpeed = 3;
            const originalY = icon.position.y;
            const squishThreshold = 0.85;
            const squishFactor = 0.1;

            app.ticker.add((time) => {
                icon.position.y += direction * bounceSpeed * time.deltaTime;

                const normalizedPosition = Math.abs(
                    (icon.position.y - originalY) / bounceHeight,
                );

                if (normalizedPosition > squishThreshold) {
                    const intensity =
                        (normalizedPosition - squishThreshold) / (1 - squishThreshold);

                    if (direction < 0) {
                        icon.scale.x = baseScale * (1 + squishFactor * intensity);
                        icon.scale.y = baseScale * (1 - squishFactor * intensity);
                    } else {
                        icon.scale.x = baseScale * (1 - squishFactor * intensity);
                        icon.scale.y = baseScale * (1 + squishFactor * intensity);
                    }
                } else {
                    icon.scale.x = baseScale;
                    icon.scale.y = baseScale;
                }

                if (icon.position.y < originalY - bounceHeight) {
                    direction = 1;
                } else if (icon.position.y > originalY + bounceHeight) {
                    direction = -1;
                }
            });

            // Load map textures with progress
            await loadMapTextures((progress) => {
                const percentage = Math.round(progress * 100);
                progressText.text = `Loading: ${percentage}%`;

                progressBarFill.clear();
                progressBarFill.rect(
                    app.screen.width / 2 - progressBarWidth / 2,
                    progressBarY,
                    progressBarWidth * progress,
                    progressBarHeight
                );
                progressBarFill.fill(0x4CAF50);
            });

            console.log("All game assets loaded successfully");

        } catch (error) {
            console.error("Error loading assets:", error);
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
        }, 500);
    } catch (error) {
        console.error("Error in showLoadingScreen:", error);
        startGame(settings);
    }
}
