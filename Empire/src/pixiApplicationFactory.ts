import { Application } from "pixi.js";

export class PixiApplicationFactory {
    static async createMainApplication(): Promise<Application> {
        const app = new Application();
        await app.init({
            resizeTo: window,
            antialias: true,
            powerPreference: "high-performance",
            backgroundColor: 0x000000,
        });

        const pixiContainer = document.getElementById("pixi-container");
        if (!pixiContainer) {
            throw new Error("Pixi container not found!");
        }
        pixiContainer.appendChild(app.view);

        return app;
    }

    static async createMinimapApplication(): Promise<Application> {
        const minimapApp = new Application();
        const minimapCanvas = document.getElementById("minimap-canvas");
        if (!minimapCanvas) {
            throw new Error("Minimap canvas not found!");
        }

        await minimapApp.init({
            width: 200,
            height: 200,
            backgroundColor: 0x000000,
            preference: "webgl",
            antialias: true,
            view: minimapCanvas as HTMLCanvasElement,
        });

        return minimapApp;
    }
}