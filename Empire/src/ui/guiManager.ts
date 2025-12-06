export class GuiManager {
    showGameGui() {
        const gameGuiContainer = document.getElementById("game-gui-container");
        if (gameGuiContainer) {
            gameGuiContainer.removeAttribute("hidden");
            gameGuiContainer.style.display = "block";
        }
    }

    hideGameGui() {
        const gameGuiContainer = document.getElementById("game-gui-container");
        if (gameGuiContainer) {
            gameGuiContainer.setAttribute("hidden", "true");
            gameGuiContainer.style.display = "none";
        }
    }
}