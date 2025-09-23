// mapGenerator.ts
import { alea } from "seedrandom";
import { createNoise2D } from "simplex-noise";
import { SCALE_MODES, Texture } from "pixi.js";

// Terrain height thresholds and colors
const TERRAIN = {
  DEEP_WATER: { threshold: 0.3, color: [0, 0, 150] },
  WATER: { threshold: 0.4, color: [0, 120, 255] },
  SAND: { threshold: 0.45, color: [240, 240, 150] },
  GRASS: { threshold: 0.75, color: [50, 220, 50] },
  FOREST: { threshold: 0.85, color: [0, 100, 0] },
  MOUNTAIN: { threshold: 0.95, color: [120, 120, 120] },
  SNOW: { threshold: 1.0, color: [250, 250, 250] },
};

export class MapGenerator {
  private width: number;
  private height: number;
  private heightMap: number[][];
  private terrainData: Uint8ClampedArray; // Change this
  private seed: string;

  constructor(width: number, height: number, seed?: string) {
    // Validate map size
    if (width < 10 || height < 10) {
      throw new Error("Map dimensions must be at least 10x10");
    }
    if (width > 3000 || height > 3000) {
      throw new Error("Map dimensions must not exceed 3000x3000");
    }

    this.width = width;
    this.height = height;
    this.seed = seed || Math.random().toString();
    this.heightMap = Array(height)
      .fill(0)
      .map(() => Array(width).fill(0));
    // RGBA format: 4 bytes per pixel
    this.terrainData = new Uint8ClampedArray(width * height * 4);
  }

  /**
   * Get the heightmap data
   */
  getHeightMap(): number[][] {
    return this.heightMap;
  }

  /**
   * Get the terrain data as RGBA array
   */
  getTerrainData(): Uint8ClampedArray {
    return this.terrainData;
  }

  /**
   * Generates the heightmap using multiple layers of noise
   */
  generateHeightMap(): void {
    // Create seeded random generator
    const prng = alea(this.seed);
    const noise2D = createNoise2D(prng);

    // Use multiple octaves of noise for more natural terrain
    const octaves = 6;
    const persistence = 0.5;
    const lacunarity = 2.0;

    // Force water borders
    const borderSize = Math.floor(this.width * 0.05); // 5% border

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Calculate distance from edge for border water
        const distFromEdge = Math.min(
          x,
          y,
          this.width - x - 1,
          this.height - y - 1,
        );

        let amplitude = 1;
        let frequency = 0.005;
        let noiseHeight = 0;
        let normalizeFactor = 0;

        // Add multiple layers of noise
        for (let i = 0; i < octaves; i++) {
          const sampleX = x * frequency;
          const sampleY = y * frequency;

          // noise2D returns values between -1 and 1
          const noiseValue = (noise2D(sampleX, sampleY) + 1) * 0.5;
          noiseHeight += noiseValue * amplitude;

          normalizeFactor += amplitude;
          amplitude *= persistence;
          frequency *= lacunarity;
        }

        // Normalize the height value
        noiseHeight /= normalizeFactor;

        // Apply border water effect
        if (distFromEdge < borderSize) {
          const borderFactor = distFromEdge / borderSize;
          noiseHeight *= borderFactor;
        }

        this.heightMap[y][x] = Math.max(0, Math.min(1, noiseHeight));
      }
    }
  }

  /**
   * Converts the heightmap to a terrain map with RGB colors
   */
  generateTerrainMap(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const height = this.heightMap[y][x];
        const index = (y * this.width + x) * 4;

        // Determine terrain type based on height
        let terrainColor;
        if (height < TERRAIN.DEEP_WATER.threshold) {
          terrainColor = TERRAIN.DEEP_WATER.color;
        } else if (height < TERRAIN.WATER.threshold) {
          terrainColor = TERRAIN.WATER.color;
        } else if (height < TERRAIN.SAND.threshold) {
          terrainColor = TERRAIN.SAND.color;
        } else if (height < TERRAIN.GRASS.threshold) {
          terrainColor = TERRAIN.GRASS.color;
        } else if (height < TERRAIN.FOREST.threshold) {
          terrainColor = TERRAIN.FOREST.color;
        } else if (height < TERRAIN.MOUNTAIN.threshold) {
          terrainColor = TERRAIN.MOUNTAIN.color;
        } else {
          terrainColor = TERRAIN.SNOW.color;
        }

        this.terrainData[index] = terrainColor[0]; // R
        this.terrainData[index + 1] = terrainColor[1]; // G
        this.terrainData[index + 2] = terrainColor[2]; // B
        this.terrainData[index + 3] = 255; // Alpha
      }
    }

    // Add forest patches using a separate noise layer
    this.addForestPatches();

    // Make sand appear near water
    this.addBeachAreas();
  }

  /**
   * Add forest patches using a different noise pattern
   */
  private addForestPatches(): void {
    const prng = alea(this.seed + "-forest");
    const noise2D = createNoise2D(prng);
    const forestFreq = 0.02;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const height = this.heightMap[y][x];
        const index = (y * this.width + x) * 4;

        // Only add forests on grass areas
        if (
          height >= TERRAIN.SAND.threshold &&
          height < TERRAIN.FOREST.threshold
        ) {
          const forestValue =
            (noise2D(x * forestFreq, y * forestFreq) + 1) * 0.5;

          if (forestValue > 0.6) {
            this.terrainData[index] = TERRAIN.FOREST.color[0]; // R
            this.terrainData[index + 1] = TERRAIN.FOREST.color[1]; // G
            this.terrainData[index + 2] = TERRAIN.FOREST.color[2]; // B
          }
        }
      }
    }
  }

  /**
   * Add sand near water areas
   */
  private addBeachAreas(): void {
    const beachDistance = 2; // How far beaches extend from water
    // Create a copy of the terrain data with the correct type
    const tempData = new Uint8ClampedArray(this.terrainData);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = (y * this.width + x) * 4;

        // Skip if this is already water or sand
        if (this.heightMap[y][x] <= TERRAIN.SAND.threshold) continue;

        // Check nearby cells for water
        let nearWater = false;

        for (let dy = -beachDistance; dy <= beachDistance && !nearWater; dy++) {
          for (
            let dx = -beachDistance;
            dx <= beachDistance && !nearWater;
            dx++
          ) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
              if (this.heightMap[ny][nx] < TERRAIN.WATER.threshold) {
                nearWater = true;
              }
            }
          }
        }

        // If near water and not too high, make it sand
        if (
          nearWater &&
          this.heightMap[y][x] < TERRAIN.GRASS.threshold + 0.05
        ) {
          tempData[index] = TERRAIN.SAND.color[0]; // R
          tempData[index + 1] = TERRAIN.SAND.color[1]; // G
          tempData[index + 2] = TERRAIN.SAND.color[2]; // B
        }
      }
    }

    // Copy values from tempData to terrainData
    this.terrainData.set(tempData);
  }

  /**
   * Generate both map types
   */
  async generateMaps(): Promise<void> {
    this.generateHeightMap();
    this.generateTerrainMap();
  }

  /**
   * Creates a PixiJS texture from the terrain data
   */
  createTerrainTexture(): ImageData {
    return new ImageData(this.terrainData, this.width, this.height);
  }
}
