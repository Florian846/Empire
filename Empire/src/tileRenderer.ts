import { Sprite, Texture } from "pixi.js";
import { MapTextures } from "./mapTextureLoader";

export const TILE_SIZE = 16;

export function createBaseSprite(
    terrainType: string,
    height: number,
    textures: MapTextures,
): Sprite | null {
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
        case "FOREST":
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
}

export function createTreeSprite(textures: MapTextures): Sprite {
    const treeTexture = Math.random() < 0.5 ? textures.tree1 : textures.tree2;
    return new Sprite(treeTexture);
}