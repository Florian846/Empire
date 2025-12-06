import { Application } from "pixi.js";
import { MusicPlayer } from "../musicPlayer";

export class InGameMenu {
    private app: Application;
    private musicPlayer: MusicPlayer;

    constructor(app: Application, musicPlayer: MusicPlayer) {
        this.app = app;
        this.musicPlayer = musicPlayer;
        this.setupMenu();
    }

    private setupMenu() {
        const ingameSettingsButton = document.getElementById("ingame-settings-button");
        const closeMenuButton = document.getElementById("close-menu-button");
        const backToMainMenuButton = document.getElementById("back-to-main-menu-button");

        ingameSettingsButton?.addEventListener("click", () => this.openMenu());
        closeMenuButton?.addEventListener("click", () => this.closeMenu());
        backToMainMenuButton?.addEventListener("click", () => window.location.reload());

        this.setupVolumeControls();
        this.setupFilterControls();
        this.loadSettings();
    }

    private setupVolumeControls() {
        const masterVolumeSlider = document.getElementById("master-volume") as HTMLInputElement;
        const musicVolumeSlider = document.getElementById("music-volume") as HTMLInputElement;
        const effectsVolumeSlider = document.getElementById("effects-volume") as HTMLInputElement;

        masterVolumeSlider?.addEventListener("input", () => {
            this.updateMusicVolume();
            this.saveSettings();
        });

        musicVolumeSlider?.addEventListener("input", () => {
            this.updateMusicVolume();
            this.saveSettings();
        });

        effectsVolumeSlider?.addEventListener("input", () => {
            console.log(`Effects volume set to: ${effectsVolumeSlider.value}`);
            this.saveSettings();
        });
    }

    private setupFilterControls() {
        const crtFilterCheckbox = document.getElementById("crt-filter") as HTMLInputElement;
        crtFilterCheckbox?.addEventListener("change", () => this.saveSettings());
    }

    private updateMusicVolume() {
        const masterVolumeSlider = document.getElementById("master-volume") as HTMLInputElement;
        const musicVolumeSlider = document.getElementById("music-volume") as HTMLInputElement;

        if (!this.musicPlayer || !masterVolumeSlider || !musicVolumeSlider) return;

        const masterVolume = parseFloat(masterVolumeSlider.value);
        const musicVolume = parseFloat(musicVolumeSlider.value);
        this.musicPlayer.setVolume(masterVolume * musicVolume);
    }

    private saveSettings() {
        const masterVolumeSlider = document.getElementById("master-volume") as HTMLInputElement;
        const musicVolumeSlider = document.getElementById("music-volume") as HTMLInputElement;
        const effectsVolumeSlider = document.getElementById("effects-volume") as HTMLInputElement;
        const crtFilterCheckbox = document.getElementById("crt-filter") as HTMLInputElement;

        const settings = {
            masterVolume: masterVolumeSlider?.value,
            musicVolume: musicVolumeSlider?.value,
            effectsVolume: effectsVolumeSlider?.value,
            crtFilterEnabled: crtFilterCheckbox?.checked,
        };

        localStorage.setItem("gameSettings", JSON.stringify(settings));
    }

    private loadSettings() {
        const savedSettings = localStorage.getItem("gameSettings");
        if (!savedSettings) return;

        const settings = JSON.parse(savedSettings);
        const masterVolumeSlider = document.getElementById("master-volume") as HTMLInputElement;
        const musicVolumeSlider = document.getElementById("music-volume") as HTMLInputElement;
        const effectsVolumeSlider = document.getElementById("effects-volume") as HTMLInputElement;
        const crtFilterCheckbox = document.getElementById("crt-filter") as HTMLInputElement;

        if (masterVolumeSlider) masterVolumeSlider.value = settings.masterVolume;
        if (musicVolumeSlider) musicVolumeSlider.value = settings.musicVolume;
        if (effectsVolumeSlider) effectsVolumeSlider.value = settings.effectsVolume;
        if (crtFilterCheckbox) crtFilterCheckbox.checked = settings.crtFilterEnabled ?? false;

        this.updateMusicVolume();
    }

    private openMenu() {
        const ingameMenuContainer = document.getElementById("ingame-menu-container");
        const pixiContainer = document.getElementById("pixi-container");

        ingameMenuContainer?.classList.add("visible");
        pixiContainer?.classList.add("paused");
        this.app.ticker.stop();
    }

    private closeMenu() {
        const ingameMenuContainer = document.getElementById("ingame-menu-container");
        const pixiContainer = document.getElementById("pixi-container");

        ingameMenuContainer?.classList.remove("visible");
        pixiContainer?.classList.remove("paused");
        this.app.ticker.start();
    }
}