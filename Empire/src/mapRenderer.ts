import { Container, Assets, Texture, Sprite, SCALE_MODES } from "pixi.js";
import { MapGenerator, TERRAIN } from "./mapGenerator";

export async function renderMap(
  container: Container,
  mapGenerator: MapGenerator,
) {
  console.log("Rendering map with tiles...");

  try {
    const textures = {
      water: await Assets.load<Texture>("src/textures/water.png"),
      dirt: await Assets.load<Texture>("src/textures/dirt.png"),
      sand: await Assets.load<Texture>("src/textures/sand.png"),
      stone: await Assets.load<Texture>("src/textures/Stone.png"),
      tree1: await Assets.load<Texture>("src/textures/Tree1.png"),
      tree2: await Assets.load<Texture>("src/textures/Tree2.png"),
        };
    
            for (const key in textures) {
                textures[key as keyof typeof textures].baseTexture.scaleMode = SCALE_MODES.NEAREST;
            }
    
        console.log("All textures loaded and configured successfully");

    const TILE_SIZE = 16;
    const terrainGrid = mapGenerator.getTerrainGrid();
    const heightMap = mapGenerator.getHeightMap();

    const grassMinHeight = TERRAIN.SAND.threshold;
    const grassMaxHeight = TERRAIN.MOUNTAIN_BASE.threshold;
    const mountainMinHeight = TERRAIN.MOUNTAIN_BASE.threshold;
    const mountainMaxHeight = TERRAIN.MOUNTAIN.threshold;

    for (let y = 0; y < mapGenerator.height; y++) {
      for (let x = 0; x < mapGenerator.width; x++) {
        const terrainType = terrainGrid[y][x];
        const height = heightMap[y][x];
        let baseSprite: Sprite;

        const getTint = (val: number, min: number, max: number) => {
          const normalized = Math.max(
            0,
            Math.min(1, (val - min) / (max - min)),
          );
          const dark = 0.6; // Changed from 0.8 to make tinting stronger
          const light = 1.0;
          const intensity = dark + normalized * (light - dark);
          const channel = Math.floor(255 * intensity);
          return (channel << 16) | (channel << 8) | channel;
        };

        switch (terrainType) {
          case "DEEP_WATER":
          case "WATER":
            baseSprite = new Sprite(textures.water);
            break;
          case "SAND":
            baseSprite = new Sprite(textures.sand);
            break;
          case "GRASS":
            baseSprite = new Sprite(textures.dirt);
            baseSprite.tint = getTint(height, grassMinHeight, grassMaxHeight);
            break;
          case "FOREST":
            // Base dirt tile
            baseSprite = new Sprite(textures.dirt);
            baseSprite.tint = getTint(height, grassMinHeight, grassMaxHeight);
            baseSprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
            container.addChild(baseSprite);

            // Add tree on top
            const treeTexture =
              Math.random() < 0.5 ? textures.tree1 : textures.tree2;
            const treeSprite = new Sprite(treeTexture);
            treeSprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
            container.addChild(treeSprite);
            continue; // Continue to next tile
          case "MOUNTAIN":
            baseSprite = new Sprite(textures.stone);
            baseSprite.tint = getTint(
              height,
              mountainMinHeight,
              mountainMaxHeight,
            );
            break;
          case "SNOW":
            baseSprite = new Sprite(textures.stone);
            baseSprite.tint = 0xffffff; // Full white for snow
            break;
          default:
            baseSprite = new Sprite(textures.dirt);
            break;
        }

        baseSprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
        container.addChild(baseSprite);
      }
    }
  } catch (error) {
    console.error("Error loading textures or rendering map:", error);
  }
}
