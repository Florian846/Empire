import { Sprite } from "pixi.js";
import { MapTextures } from "./mapTextureLoader";

export const TILE_SIZE = 16;

export function createBaseSprite(
    terrainType: string,
    textures: MapTextures,
): [Sprite | null, number] {
    let sprite: Sprite;
    let rotation = 0;
    const rotations = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

    switch (terrainType) {
        case "DEEP_WATER":
        case "WATER":
            sprite = new Sprite(textures.water);
            break;
        case "SAND":
            sprite = new Sprite(textures.sand);
            rotation = rotations[Math.floor(Math.random() * rotations.length)];
            break;
        case "GRASS":
        case "FOREST":
            sprite = new Sprite(textures.grass);
            rotation = rotations[Math.floor(Math.random() * rotations.length)];
            break;
        case "MOUNTAIN":
            sprite = new Sprite(textures.stone);
            sprite.tint = 0xaaaaaa;
            rotation = rotations[Math.floor(Math.random() * rotations.length)];
            break;
        case "SNOW":
            sprite = new Sprite(textures.stone);
            sprite.tint = 0xffffff;
            rotation = rotations[Math.floor(Math.random() * rotations.length)];
            break;
        default:
            return [null, 0];
    }

    return [sprite, rotation];
}

export function createTreeSprite(textures: MapTextures): Sprite {
    const treeTexture = Math.random() < 0.5 ? textures.tree1 : textures.tree2;
    return new Sprite(treeTexture);
}