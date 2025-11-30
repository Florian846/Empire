import { GameSettings } from "./types";

export class ChatSystem {
  private chatState: "closed" | "open" = "closed";
  private chatInput: HTMLInputElement | null;
  private chatContainer: HTMLElement | null;

  constructor(private gameSettings: GameSettings) {
    this.chatContainer = document.getElementById("chat-container");
    this.chatInput = document.getElementById("chat-input") as HTMLInputElement;

    this.setupKeyboardControls();
  }

  private setupKeyboardControls() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.handleChatInteraction(event);
      }
    });
  }

  private handleChatInteraction(event: KeyboardEvent) {
    // When the chat is closed, any "Enter" press should open it.
    if (!this.isOpen()) {
      // We don't want form submission or other default 'Enter' behavior.
      event.preventDefault();
      this.open();
      return;
    }

    if (document.activeElement === this.chatInput) {
      event.preventDefault();
      const message = this.getMessage();

      if (message) {
        this.pushMessage(this.gameSettings.playerName, message);
        this.clearInput();
      } else {
        this.close();
      }
    }
  }

  private isOpen = () => this.chatState === "open";

  private open = () => {
    this.chatContainer?.classList.add("visible");
    this.chatInput?.focus();
    this.chatState = "open";
  };

  private close = () => {
    this.chatContainer?.classList.remove("visible");
    this.chatInput?.blur();
    this.chatState = "closed";
  };

  private getMessage = () => this.chatInput?.value.trim() || "";

  private clearInput = () => {
    if (this.chatInput) this.chatInput.value = "";
  };

  public pushMessage(sender: string, message: string) {
    const messageArea = document.getElementById('chat-messages');
    if (messageArea) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('chat-message');
      messageElement.innerHTML = `<span>${sender}:</span> ${message}`;
      messageArea.appendChild(messageElement);
      messageArea.scrollTop = messageArea.scrollHeight;
    }
  }
}
