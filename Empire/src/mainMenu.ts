import { showLoadingScreen } from "./loadingScreen";

export function showMainMenu() {
  const menuContainer = document.getElementById("menu-container");
  const matchSettingsContainer = document.getElementById(
    "match-settings-container",
  );

  if (!menuContainer || !matchSettingsContainer) {
    console.error("Menu containers not found!");
    return;
  }

  menuContainer.style.display = "flex";
  matchSettingsContainer.style.display = "none";

  document
    .getElementById("singleplayer-button")
    ?.addEventListener("click", () => {
      menuContainer.style.display = "none";
      matchSettingsContainer.style.display = "flex";
    });

  document
    .getElementById("start-game-button")
    ?.addEventListener("click", () => {
      const mapSize = (document.getElementById("map-size") as HTMLSelectElement)
        .value;
      const botCount = (
        document.getElementById("bot-count") as HTMLSelectElement
      ).value;

      matchSettingsContainer.style.display = "none";
      showLoadingScreen({ mapSize, botCount });
    });

  document
    .getElementById("back-to-menu-button")
    ?.addEventListener("click", () => {
      matchSettingsContainer.style.display = "none";
      menuContainer.style.display = "flex";
    });
}
