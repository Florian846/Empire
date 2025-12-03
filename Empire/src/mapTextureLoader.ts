import { Assets, Texture } from "pixi.js";

export interface MapTextures {
    water: Texture;
    sand: Texture;
    grass: Texture;
    stone: Texture;
    tree1: Texture;
    tree2: Texture;
}

export interface LoadedAssets {
    textures: MapTextures;
    dirtSandBlendTextures: Texture[];
}

let cachedAssets: LoadedAssets | null = null;

export async function loadMapTextures(
    onProgress?: (progress: number) => void
): Promise<LoadedAssets> {
    if (cachedAssets) {
        return cachedAssets;
    }

    const totalAssets = 26; // 6 base textures + 20 blend textures
    let loadedCount = 0;

    const updateProgress = () => {
        loadedCount++;
        onProgress?.(loadedCount / totalAssets);
    };

    const textures: MapTextures = {
        water: await Assets.load<Texture>("src/textures/water.png").then(t => {
            updateProgress();
            return t;
        }),
        sand: await Assets.load<Texture>("src/textures/sand.png").then(t => {
            updateProgress();
            return t;
        }),
        grass: await Assets.load<Texture>("src/textures/dirt.png").then(t => {
            updateProgress();
            return t;
        }),
        stone: await Assets.load<Texture>("src/textures/Stone.png").then(t => {
            updateProgress();
            return t;
        }),
        tree1: await Assets.load<Texture>("src/textures/Tree1.png").then(t => {
            updateProgress();
            return t;
        }),
        tree2: await Assets.load<Texture>("src/textures/Tree2.png").then(t => {
            updateProgress();
            return t;
        }),
    };

    const dirtSandBlendTextures: Texture[] = [];
    for (let i = 0; i < 20; i++) {
        const texture = await Assets.load<Texture>(
            `src/textures/blend/DirtSand/DirtSand${i}.png`,
        );
        dirtSandBlendTextures.push(texture);
        updateProgress();
    }

    Object.values(textures).forEach((t) => (t.source.scaleMode = "nearest"));
    dirtSandBlendTextures.forEach((t) => (t.source.scaleMode = "nearest"));

    cachedAssets = { textures, dirtSandBlendTextures };
    return cachedAssets;
}

export function getLoadedAssets(): LoadedAssets | null {
    return cachedAssets;
}
