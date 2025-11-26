// mapGenerator.ts
import { alea } from "seedrandom";
import { createNoise2D } from "simplex-noise";

// Terrain height thresholds
export const TERRAIN = {
  DEEP_WATER: { threshold: 0.3 },
  WATER: { threshold: 0.4 },
  SAND: { threshold: 0.45 },
  GRASS: { threshold: 0.75 },
  MOUNTAIN_BASE: { threshold: 0.78 }, // Lowered to increase mountain range
  MOUNTAIN: { threshold: 0.95 },
  SNOW: { threshold: 1.0 },
};

export class MapGenerator {
  public width: number;
  public height: number;
  public heightMap: number[][];
  public terrainGrid: string[][];
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
    this.terrainGrid = Array(height)
      .fill("")
      .map(() => Array(width).fill(""));
  }

  /**
   * Get the heightmap data
   */
  getHeightMap(): number[][] {
    return this.heightMap;
  }

  /**
   * Get the terrain grid
   */
  getTerrainGrid(): string[][] {
    return this.terrainGrid;
  }

  /**
   * Generates the heightmap using multiple layers of noise
   */
  generateHeightMap(): void {
    const prng = alea(this.seed);
    const noise2D = createNoise2D(prng);

    const octaves = 6;
    const persistence = 0.5;
    const lacunarity = 2.0;

    const borderSize = Math.floor(this.width * 0.05);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
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

        for (let i = 0; i < octaves; i++) {
          const sampleX = x * frequency;
          const sampleY = y * frequency;

          const noiseValue = (noise2D(sampleX, sampleY) + 1) * 0.5;
          noiseHeight += noiseValue * amplitude;

          normalizeFactor += amplitude;
          amplitude *= persistence;
          frequency *= lacunarity;
        }

        noiseHeight /= normalizeFactor;

        if (distFromEdge < borderSize) {
          const borderFactor = distFromEdge / borderSize;
          noiseHeight *= borderFactor;
        }

        this.heightMap[y][x] = Math.max(0, Math.min(1, noiseHeight));
      }
    }
  }

  /**
   * Converts the heightmap to a terrain map with string identifiers
   */
  generateTerrainMap(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const height = this.heightMap[y][x];

        if (height < TERRAIN.DEEP_WATER.threshold) {
          this.terrainGrid[y][x] = "DEEP_WATER";
        } else if (height < TERRAIN.WATER.threshold) {
          this.terrainGrid[y][x] = "WATER";
        } else if (height < TERRAIN.SAND.threshold) {
          this.terrainGrid[y][x] = "SAND";
        } else if (height < TERRAIN.GRASS.threshold) {
          this.terrainGrid[y][x] = "GRASS";
        } else if (height < TERRAIN.MOUNTAIN_BASE.threshold) {
          this.terrainGrid[y][x] = "GRASS"; 
        } else if (height < TERRAIN.MOUNTAIN.threshold) {
          this.terrainGrid[y][x] = "MOUNTAIN";
        } else {
          this.terrainGrid[y][x] = "SNOW";
        }
      }
    }

    this.addBeachAreas();
    this.addForestPatches();
  }

  private addForestPatches(): void {
    const prng = alea(this.seed + "-forest");
    const noise2D = createNoise2D(prng);
    const forestFreq = 0.02;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.terrainGrid[y][x] === 'GRASS') {
          const forestValue =
            (noise2D(x * forestFreq, y * forestFreq) + 1) * 0.5;

          if (forestValue > 0.45) { // Lowered to increase forest density
            this.terrainGrid[y][x] = "FOREST";
          }
        }
      }
    }
  }

  private addBeachAreas(): void {
    const beachDistance = 2;
    const newTerrainGrid = this.terrainGrid.map((row) => [...row]);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.heightMap[y][x] <= TERRAIN.SAND.threshold) continue;

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

        if (
          nearWater &&
          this.heightMap[y][x] < TERRAIN.GRASS.threshold + 0.05
        ) {
          newTerrainGrid[y][x] = "SAND";
        }
      }
    }
    this.terrainGrid = newTerrainGrid;
  }

  async generateMaps(): Promise<void> {
    this.generateHeightMap();
    this.generateTerrainMap();
  }
}
