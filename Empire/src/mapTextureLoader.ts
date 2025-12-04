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
    dirtStoneBlendTextures: Texture[];
}

let cachedAssets: LoadedAssets | null = null;

export async function loadMapTextures(
    onProgress?: (progress: number) => void
): Promise<LoadedAssets> {
    if (cachedAssets) {
        return cachedAssets;
    }

    const totalAssets = 46; // 6 base textures + 20 blend textures + 20 dirt stone blend textures
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
        const path = `src/textures/blend/DirtSand/DirtSand${i}.png`;
        try {
            const texture = await Assets.load<Texture>(path);
            dirtSandBlendTextures.push(texture);
        } catch (error) {
            console.warn(`Could not load blend texture: ${path}. Using empty texture as placeholder.`, error);
            dirtSandBlendTextures.push(Texture.EMPTY);
        }
        updateProgress();
    }

    const dirtStoneBlendTextures: Texture[] = [];
    for (let i = 0; i < 20; i++) {
        const path = `src/textures/blend/DirtStone/DirtStone${i}.png`;
        try {
            const texture = await Assets.load<Texture>(path);
            dirtStoneBlendTextures.push(texture);
        } catch (error) {
            console.warn(`Could not load blend texture: ${path}. Using empty texture as placeholder.`, error);
            dirtStoneBlendTextures.push(Texture.EMPTY);
        }
        updateProgress();
    }

    Object.values(textures).forEach((t) => (t.source.scaleMode = "nearest"));
    dirtSandBlendTextures.forEach((t) => {
        if (t && t.source) {
            t.source.scaleMode = "nearest";
        }
    });
    dirtStoneBlendTextures.forEach((t) => {
        if (t && t.source) {
            t.source.scaleMode = "nearest";
        }
    });

    cachedAssets = { textures, dirtSandBlendTextures, dirtStoneBlendTextures };
    return cachedAssets;
}

export function getLoadedAssets(): LoadedAssets | null {
    return cachedAssets;
}
