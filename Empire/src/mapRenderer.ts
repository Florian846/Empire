import { Container, Application, RenderTexture, Sprite } from "pixi.js";
import { MapGenerator } from "./mapGenerator";
import { loadMapTextures } from "./mapTextureLoader";
import { createSandGrassBlendMap, calculate8WayMask } from "./blendMaskCalculator";
import { TILE_SIZE, createBaseSprite, createTreeSprite } from "./tileRenderer";

export async function renderMap(
    app: Application,
    container: Container,
    mapGenerator: MapGenerator,
) {
    console.log("Optimized Rendering: Rendering map to a single texture...");

    try {
        const { textures, dirtSandBlendTextures } = await loadMapTextures();
        console.log("All textures loaded and configured successfully.");

        const renderTexture = RenderTexture.create({
            width: mapGenerator.width * TILE_SIZE,
            height: mapGenerator.height * TILE_SIZE,
            scaleMode: "nearest",
        });

        const tempContainer = new Container();
        const terrainGrid = mapGenerator.getTerrainGrid();
        const heightMap = mapGenerator.getHeightMap();
        const sandGrassBlendMap = createSandGrassBlendMap();

        const getTerrainType = (x: number, y: number): string => {
            if (x < 0 || x >= mapGenerator.width || y < 0 || y >= mapGenerator.height)
                return "out_of_bounds";
            return terrainGrid[y][x];
        };

        const isGrass = (type: string) => type === "GRASS" || type === "FOREST";

        for (let y = 0; y < mapGenerator.height; y++) {
            for (let x = 0; x < mapGenerator.width; x++) {
                const terrainType = getTerrainType(x, y);

                if (terrainType === "SAND") {
                    const maskValue = calculate8WayMask({
                        n: isGrass(getTerrainType(x, y - 1)),
                        ne: isGrass(getTerrainType(x + 1, y - 1)),
                        e: isGrass(getTerrainType(x + 1, y)),
                        se: isGrass(getTerrainType(x + 1, y + 1)),
                        s: isGrass(getTerrainType(x, y + 1)),
                        sw: isGrass(getTerrainType(x - 1, y + 1)),
                        w: isGrass(getTerrainType(x - 1, y)),
                        nw: isGrass(getTerrainType(x - 1, y - 1)),
                    });

                    const tileIndex = sandGrassBlendMap[maskValue];
                    if (tileIndex !== -1 && tileIndex < dirtSandBlendTextures.length) {
                        const blendSprite = new Sprite(dirtSandBlendTextures[tileIndex]);
                        blendSprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
                        tempContainer.addChild(blendSprite);
                        continue;
                    }
                }

                const baseSprite = createBaseSprite(terrainType, heightMap[y][x], textures);
                if (baseSprite) {
                    baseSprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
                    tempContainer.addChild(baseSprite);
                }

                if (terrainType === "FOREST") {
                    const treeSprite = createTreeSprite(textures);
                    treeSprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
                    tempContainer.addChild(treeSprite);
                }
            }
        }

        app.renderer.render(tempContainer, { renderTexture });
        tempContainer.destroy({ children: true });

        const mapSprite = new Sprite(renderTexture);
        container.addChild(mapSprite);

        setupDebugClickHandler(mapSprite, getTerrainType, isGrass);

        console.log("Map rendering complete. Final map is now a single sprite.");
    } catch (error) {
        console.error("Error loading textures or rendering map:", error);
    }
}

function setupDebugClickHandler(
    mapSprite: Sprite,
    getTerrainType: (x: number, y: number) => string,
    isGrass: (type: string) => boolean,
) {
    mapSprite.eventMode = "static";
    mapSprite.on("pointerdown", (event) => {
        const pos = event.getLocalPosition(mapSprite);
        const tileX = Math.floor(pos.x / TILE_SIZE);
        const tileY = Math.floor(pos.y / TILE_SIZE);

        if (getTerrainType(tileX, tileY) === "SAND") {
            const maskValue = calculate8WayMask({
                n: isGrass(getTerrainType(tileX, tileY - 1)),
                ne: isGrass(getTerrainType(tileX + 1, tileY - 1)),
                e: isGrass(getTerrainType(tileX + 1, tileY)),
                se: isGrass(getTerrainType(tileX + 1, tileY + 1)),
                s: isGrass(getTerrainType(tileX, tileY + 1)),
                sw: isGrass(getTerrainType(tileX - 1, tileY + 1)),
                w: isGrass(getTerrainType(tileX - 1, tileY)),
                nw: isGrass(getTerrainType(tileX - 1, tileY - 1)),
            });

            console.log(`DEBUG: Clicked Sand Tile at [${tileX}, ${tileY}]. Mask Value: ${maskValue}`);
        }
    });
}