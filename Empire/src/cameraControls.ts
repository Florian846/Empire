import { Application, Container } from "pixi.js";

export class CameraControls {
  private app: Application;
  private container: Container;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private moveSpeed: number = 10;
  private zoomSpeed: number = 0.1;
  private edgeThreshold: number = 50;
  private keys: Set<string> = new Set();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private minZoom: number;
  private maxZoom: number;
  private defaultZoom: number;
  private mapWidth: number;
  private mapHeight: number;
  private wheelDelta: number = 0;
  private lastScrollTime: number = 0;
  private targetZoom: number;

  constructor(
    app: Application,
    container: Container,
    mapWidth: number,
    mapHeight: number,
    minZoom: number = 0.1,
    maxZoom: number = 100,
    defaultZoom: number = 1,
  ) {
    this.app = app;
    this.container = container;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.defaultZoom = defaultZoom;
    this.targetZoom = defaultZoom;

    this.container.scale.set(this.defaultZoom);

    this.cameraX = 0; // Start in der Mitte (0,0)
    this.cameraY = 0;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener("keydown", (e) => this.keys.add(e.key));
    window.addEventListener("keyup", (e) => this.keys.delete(e.key));

    this.app.view.addEventListener("mousemove", (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });

    this.app.view.addEventListener("wheel", (e) => {
      this.wheelDelta = e.deltaY;
      this.lastScrollTime = Date.now();
    });
  }

  public update() {
    this.handleKeyboardInput();
    this.handleMouseWheelInput();
    this.handleEdgePanning();
    this.applyTransform();
    console.log(this.cameraX, this.cameraY);
  }

  private handleMouseWheelInput() {
    const currentTime = Date.now();
    if (this.wheelDelta !== 0 && currentTime - this.lastScrollTime < 100) {
      const zoomDirection = this.wheelDelta > 0 ? -1 : 1;
      const zoomFactor = 1 + this.zoomSpeed * zoomDirection;
      const newScale = this.targetZoom * zoomFactor;

      this.targetZoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, newScale),
      );

      // Reset wheelDelta
      this.wheelDelta = 0;
    }
  }

  private handleKeyboardInput() {
    // Bewegungsgeschwindigkeit an Zoom anpassen
    const adjustedSpeed = this.moveSpeed / this.targetZoom;

    if (this.keys.has("ArrowUp")) this.cameraY += adjustedSpeed;
    if (this.keys.has("ArrowDown")) this.cameraY -= adjustedSpeed;
    if (this.keys.has("ArrowLeft")) this.cameraX += adjustedSpeed;
    if (this.keys.has("ArrowRight")) this.cameraX -= adjustedSpeed;
  }

  private handleEdgePanning() {
    // Bewegungsgeschwindigkeit an Zoom anpassen
    const adjustedSpeed = this.moveSpeed / this.targetZoom;

    if (this.mousePosition.x < this.edgeThreshold) {
      this.cameraX += adjustedSpeed;
    }
    if (this.mousePosition.x > window.innerWidth - this.edgeThreshold) {
      this.cameraX -= adjustedSpeed;
    }
    if (this.mousePosition.y < this.edgeThreshold) {
      this.cameraY += adjustedSpeed;
    }
    if (this.mousePosition.y > window.innerHeight - this.edgeThreshold) {
      this.cameraY -= adjustedSpeed;
    }
  }

  private applyTransform() {
    // Zoom unter dem Mauszeiger anwenden
    if (this.container.scale.x !== this.targetZoom) {
      // Berechne die Welt-Koordinate unter dem Mauszeiger vor dem Zoom
      const mouseWorldX =
        (this.mousePosition.x - this.container.x) / this.container.scale.x;
      const mouseWorldY =
        (this.mousePosition.y - this.container.y) / this.container.scale.y;

      // Neuen Zoom anwenden
      this.container.scale.set(this.targetZoom);
      // Kameraposition anpassen, um unter dem Mauszeiger zu zoomen
      this.container.x = this.mousePosition.x;
      this.container.y = this.mousePosition.y;
    }

    this.container.x = this.cameraX * this.container.scale.x;
    this.container.y = this.cameraY * this.container.scale.y;

    if (this.mapWidth > 0 && this.mapHeight > 0) {
      // Hier könnten später Begrenzungen implementiert werden
    }
  }

  private updateCameraFromContainer() {
    this.cameraX =
      (this.container.x - window.innerWidth / 2) / this.container.scale.x;
    this.cameraY =
      (this.container.y - window.innerHeight / 2) / this.container.scale.y;
  }

  public setCameraPosition(x: number, y: number, zoom?: number) {
    this.cameraX = x;
    this.cameraY = y;

    if (zoom !== undefined) {
      // Zoom zwischen min und max begrenzen
      this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    }

    this.applyTransform();
  }

  public getCameraPosition(): { x: number; y: number; zoom: number } {
    return {
      x: this.cameraX,
      y: this.cameraY,
      zoom: this.targetZoom,
    };
  }
}
