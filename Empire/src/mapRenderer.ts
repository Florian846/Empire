import {
  Container,
  Assets,
  Texture,
  Sprite,
  Rectangle,
  Application,
  RenderTexture,
} from "pixi.js";
import { MapGenerator, TERRAIN } from "./mapGenerator";

/**
 * Renders the entire map to a single texture for maximum performance.
 * @param app The main PIXI Application instance.
 * @param container The main container to add the final map sprite to.
 * @param mapGenerator The map data.
 */
export async function renderMap(
  app: Application,
  container: Container,
  mapGenerator: MapGenerator,
) {
  console.log("Optimized Rendering: Rendering map to a single texture...");

  try {
    // --- TEXTURE LOADING ---
    const TILE_SIZE = 16;
    const textures = {
      water: await Assets.load<Texture>("src/textures/water.png"),
      sand: await Assets.load<Texture>("src/textures/sand.png"),
      grass: await Assets.load<Texture>("src/textures/dirt.png"),
      stone: await Assets.load<Texture>("src/textures/Stone.png"),
      tree1: await Assets.load<Texture>("src/textures/Tree1.png"),
      tree2: await Assets.load<Texture>("src/textures/Tree2.png"),
    };

    const dirtSandBlendTextures: Texture[] = [];
    for (let i = 0; i < 20; i++) {
      const texture = await Assets.load<Texture>(
        `src/textures/blend/DirtSand/DirtSand${i}.png`,
      );
      dirtSandBlendTextures.push(texture);
    }

    // Use modern, non-deprecated way to set scale mode for sharp pixels
    Object.values(textures).forEach((t) => (t.source.scaleMode = "nearest"));
    dirtSandBlendTextures.forEach((t) => (t.source.scaleMode = "nearest"));
    console.log("All textures loaded and configured successfully.");

    // --- RENDER TEXTURE SETUP ---
    const renderTexture = RenderTexture.create({
      width: mapGenerator.width * TILE_SIZE,
      height: mapGenerator.height * TILE_SIZE,
      scaleMode: "nearest", // Ensure the final texture is pixel-perfect
    });
    const tempContainer = new Container(); // We draw everything to this container first.

    // --- HELPER FUNCTIONS ---
    const terrainGrid = mapGenerator.getTerrainGrid();
    const heightMap = mapGenerator.getHeightMap();

    const getTerrainType = (x: number, y: number): string => {
      if (x < 0 || x >= mapGenerator.width || y < 0 || y >= mapGenerator.height)
        return "out_of_bounds";
      return terrainGrid[y][x];
    };

    const sandGrass8WayBlendMap = new Array(256).fill(-1);

    sandGrass8WayBlendMap[255] = 0;
    sandGrass8WayBlendMap[85] = 1;
    sandGrass8WayBlendMap[64] = 2;
    sandGrass8WayBlendMap[96] = 2;
    sandGrass8WayBlendMap[192] = 2;
    sandGrass8WayBlendMap[224] = 2;
    sandGrass8WayBlendMap[69] = 3;
    sandGrass8WayBlendMap[231] = 3;
    sandGrass8WayBlendMap[207] = 3;
    sandGrass8WayBlendMap[299] = 3;
    sandGrass8WayBlendMap[199] = 3;
    sandGrass8WayBlendMap[65] = 4;
    sandGrass8WayBlendMap[193] = 5;
    sandGrass8WayBlendMap[195] = 5;
    sandGrass8WayBlendMap[225] = 5;
    sandGrass8WayBlendMap[227] = 5;
    sandGrass8WayBlendMap[68] = 6;
    sandGrass8WayBlendMap[1] = 7;
    sandGrass8WayBlendMap[3] = 7;
    sandGrass8WayBlendMap[131] = 7;
    sandGrass8WayBlendMap[81] = 8;
    sandGrass8WayBlendMap[80] = 9;
    sandGrass8WayBlendMap[112] = 10;
    sandGrass8WayBlendMap[120] = 10;
    sandGrass8WayBlendMap[240] = 10;
    sandGrass8WayBlendMap[248] = 10;
    sandGrass8WayBlendMap[17] = 11;
    sandGrass8WayBlendMap[4] = 12;
    sandGrass8WayBlendMap[6] = 12;
    sandGrass8WayBlendMap[14] = 12;
    sandGrass8WayBlendMap[12] = 12;
    sandGrass8WayBlendMap[69] = 13;
    sandGrass8WayBlendMap[5] = 14;
    sandGrass8WayBlendMap[28] = 15;
    sandGrass8WayBlendMap[30] = 15;
    sandGrass8WayBlendMap[60] = 15;
    sandGrass8WayBlendMap[7] = 16;
    sandGrass8WayBlendMap[15] = 16;
    sandGrass8WayBlendMap[135] = 16;
    sandGrass8WayBlendMap[16] = 17;
    sandGrass8WayBlendMap[24] = 17;
    sandGrass8WayBlendMap[56] = 17;
    sandGrass8WayBlendMap[48] = 17;
    sandGrass8WayBlendMap[84] = 18;
    sandGrass8WayBlendMap[124] = 18;
    sandGrass8WayBlendMap[20] = 19;

    
    // --- Helper comments for user configuration ---

    // To add more rules, find the mask value and set the tile index.
    // Bitmask values: N=1, NE=2, E=4, SE=8, S=16, SW=32, W=64, NW=128
    // A value of -1 means no specific blend tile will be used.
    // Examples for other single sides (you need to provide the correct tile index):
    // sandGrass8WayBlendMap[1] = TILE_INDEX_FOR_NORTH_SIDE;  // N
    // sandGrass8WayBlendMap[4] = TILE_INDEX_FOR_EAST_SIDE;   // E
    // sandGrass8WayBlendMap[16] = TILE_INDEX_FOR_SOUTH_SIDE; // S


    const getBaseSpriteForTerrain = (
      terrainType: string,
      height: number,
    ): Sprite | null => {
      let sprite: Sprite;
      switch (terrainType) {
        case "DEEP_WATER":
        case "WATER":
          sprite = new Sprite(textures.water);
          break;
        case "SAND":
          sprite = new Sprite(textures.sand);
          break;
        case "GRASS":
        case "FOREST": // Forest base is grass
          sprite = new Sprite(textures.grass);
          break;
        case "MOUNTAIN":
          sprite = new Sprite(textures.stone);
          sprite.tint = 0xaaaaaa;
          break;
        case "SNOW":
          sprite = new Sprite(textures.stone);
          sprite.tint = 0xffffff;
          break;
        default:
          return null;
      }
      return sprite;
    };

    // --- MAIN RENDER LOOP ---
    // This loop populates the temporary container.
    for (let y = 0; y < mapGenerator.height; y++) {
      for (let x = 0; x < mapGenerator.width; x++) {
        const terrainType = getTerrainType(x, y);

        // --- Sand-Grass special blending (8-way) ---
        if (terrainType === "SAND") {
          const isGrass = (type: string) => type === 'GRASS' || type === 'FOREST';
          const n = isGrass(getTerrainType(x, y - 1));
          const ne = isGrass(getTerrainType(x + 1, y - 1));
          const e = isGrass(getTerrainType(x + 1, y));
          const se = isGrass(getTerrainType(x + 1, y + 1));
          const s = isGrass(getTerrainType(x, y + 1));
          const sw = isGrass(getTerrainType(x - 1, y + 1));
          const w = isGrass(getTerrainType(x - 1, y));
          const nw = isGrass(getTerrainType(x - 1, y - 1));

          const maskValue =
            (n ? 1 : 0) |
            (ne ? 2 : 0) |
            (e ? 4 : 0) |
            (se ? 8 : 0) |
            (s ? 16 : 0) |
            (sw ? 32 : 0) |
            (w ? 64 : 0) |
            (nw ? 128 : 0);

          const tileIndex = sandGrass8WayBlendMap[maskValue];

          if (tileIndex !== -1 && tileIndex < dirtSandBlendTextures.length) {
            const blendSprite = new Sprite(dirtSandBlendTextures[tileIndex]);
            blendSprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
            tempContainer.addChild(blendSprite);
            continue; // This tile is done, move to the next.
          }
        }

        // --- Default base tile drawing ---
        const baseSprite = getBaseSpriteForTerrain(
          terrainType,
          heightMap[y][x],
        );
        if (baseSprite) {
          baseSprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
          tempContainer.addChild(baseSprite);
        }

        // --- Add details on top ---
        if (terrainType === "FOREST") {
          const treeTexture =
            Math.random() < 0.5 ? textures.tree1 : textures.tree2;
          const treeSprite = new Sprite(treeTexture);
          treeSprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
          tempContainer.addChild(treeSprite);
        }
      }
    }

    // --- FINAL RENDER & CLEANUP ---
    app.renderer.render(tempContainer, { renderTexture });
    tempContainer.destroy({ children: true }); // Clean up the temporary container

    const mapSprite = new Sprite(renderTexture);
    container.addChild(mapSprite);

    // --- DEBUGGING: Click to get mask value ---
    mapSprite.eventMode = 'static'; // Use new eventMode in PixiJS v8
    mapSprite.on('pointerdown', (event) => {
        const pos = event.getLocalPosition(mapSprite);
        const tileX = Math.floor(pos.x / TILE_SIZE);
        const tileY = Math.floor(pos.y / TILE_SIZE);

        if (getTerrainType(tileX, tileY) === 'SAND') {
            const isGrass = (type: string) => type === 'GRASS' || type === 'FOREST';
            const n = isGrass(getTerrainType(tileX, tileY - 1));
            const ne = isGrass(getTerrainType(tileX + 1, tileY - 1));
            const e = isGrass(getTerrainType(tileX + 1, tileY));
            const se = isGrass(getTerrainType(tileX + 1, tileY + 1));
            const s = isGrass(getTerrainType(tileX, tileY + 1));
            const sw = isGrass(getTerrainType(tileX - 1, tileY + 1));
            const w = isGrass(getTerrainType(tileX - 1, tileY));
            const nw = isGrass(getTerrainType(tileX - 1, tileY - 1));

            const maskValue =
              (n ? 1 : 0) |
              (ne ? 2 : 0) |
              (e ? 4 : 0) |
              (se ? 8 : 0) |
              (s ? 16 : 0) |
              (sw ? 32 : 0) |
              (w ? 64 : 0) |
              (nw ? 128 : 0);
            
            console.log(`DEBUG: Clicked Sand Tile at [${tileX}, ${tileY}]. Mask Value: ${maskValue}`);
            // You can now use this mask value to update your sandGrass8WayBlendMap
            // Example: sandGrass8WayBlendMap[${maskValue}] = YOUR_TILE_INDEX;
        }
    });

    console.log("Map rendering complete. Final map is now a single sprite.");
  } catch (error) {
    console.error("Error loading textures or rendering map:", error);
  }
}
