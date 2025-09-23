import { MapGenerator } from "./mapGenerator";
import { GameSettings } from "./types";

export async function generateMap(settings: GameSettings): Promise<{
  heightMap: number[][];
  terrainMap: Uint8ClampedArray; // Changed from Uint8Array
  width: number;
  height: number;
}> {
  // Convert string settings to actual numbers
  const sizeMap = {
    small: 256,
    medium: 512,
    large: 1024,
  };

  // Parse map size from settings
  const mapSize = sizeMap[settings.mapSize as keyof typeof sizeMap] || 512;

  console.log(`Generating ${mapSize}x${mapSize} map...`);

  try {
    const generator = new MapGenerator(mapSize, mapSize);
    await generator.generateMaps();

    return {
      heightMap: generator.getHeightMap(),
      terrainMap: generator.getTerrainData(),
      width: mapSize,
      height: mapSize,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error generating map: ${errorMessage}`);
    throw error;
  }
}
