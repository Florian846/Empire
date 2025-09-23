// mapInitialization.ts
import { Application, Container, Texture, Sprite } from "pixi.js";
import { GameSettings } from "./types";
import { generateMap } from "./mapGeneratorInterface";
import { SCALE_MODES } from "pixi.js";

export async function initializeMap(
  app: Application,
  gameContainer: Container,
  settings: GameSettings,
) {
  console.log("Initializing map...");
  const map = await generateMap(settings);

  // Create a texture from the terrain data
  const canvas = document.createElement("canvas");
  canvas.width = map.width;
  canvas.height = map.height;
  const ctx = canvas.getContext("2d")!;
  const imageData = new ImageData(map.terrainMap, map.width, map.height);
  ctx.putImageData(imageData, 0, 0);

  const terrainTexture = Texture.from(canvas);

  // Display the map
  const terrainSprite = new Sprite(terrainTexture);
  gameContainer.addChild(terrainSprite);

  // Apply SCALE_MODES.NEAREST to all sprites in the container
  gameContainer.children.forEach((child) => {
    if (child instanceof Sprite) {
      child.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    }
  });

  // Center and scale the map if needed
  terrainSprite.position.set(
    (app.screen.width - map.width) / 2,
    (app.screen.height - map.height) / 2,
  );

  if (map.width > app.screen.width || map.height > app.screen.height) {
    const scale = Math.min(
      app.screen.width / map.width,
      app.screen.height / map.height,
    );
    terrainSprite.scale.set(scale);
  }

  console.log("Map initialized successfully.");
}
