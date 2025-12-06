export class KeyboardControls {
    private scoreboardContainer: HTMLElement | null;

    constructor() {
        this.scoreboardContainer = document.getElementById("scoreboard-container");
        this.setupControls();
    }

    private setupControls() {
        window.addEventListener("keydown", (event) => {
            if (this.isTabKey(event)) {
                this.handleScoreboardToggle(event);
            }
        });
    }

    private isTabKey(event: KeyboardEvent): boolean {
        return event.key === "Tab";
    }

    private handleScoreboardToggle(event: KeyboardEvent) {
        event.preventDefault();
        this.scoreboardContainer?.classList.toggle("hidden");
    }
}