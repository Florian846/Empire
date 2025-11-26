// mapInitialization.ts
import { Application, Container } from "pixi.js";
import { GameSettings } from "./types";
import { generateMap } from "./mapGeneratorInterface";
import { renderMap } from "./mapRenderer";
import { MapGenerator } from "./mapGenerator";

export async function initializeMap(
  app: Application,
  gameContainer: Container,
  settings: GameSettings,
): Promise<MapGenerator> {
  console.log("Initializing map...");
  const map = await generateMap(settings);

  await renderMap(gameContainer, map);

  console.log("Map initialized successfully.");
  return map;
}
