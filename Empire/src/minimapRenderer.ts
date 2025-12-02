import { Application, Container, Graphics, Rectangle } from "pixi.js";
import { MapGenerator, TERRAIN } from "./mapGenerator";
import { CameraControls } from "./cameraControls";

export class MinimapRenderer {
  private mapGenerator: MapGenerator;
  private cameraControls: CameraControls;
  public minimapContainer: Container;
  private minimapGraphics: Graphics; // For drawing the map tiles
  private cameraViewRect: Graphics; // For drawing the camera view
  private readonly MINIMAP_SIZE: number = 200; // px
  private minimapTileSize: number = 1; // px per map cell
  private terrainColors: { [key: string]: number } = {};
  private minimapApp: Application; // Declare minimapApp here

  constructor(
    private mainApp: Application, // The main game PIXI Application
    minimapApp: Application, // The minimap's PIXI Application
    mapGenerator: MapGenerator,
    cameraControls: CameraControls,
  ) {
    this.minimapApp = minimapApp;
    this.mapGenerator = mapGenerator;
    this.cameraControls = cameraControls;

    this.minimapContainer = minimapApp.stage; // Use the minimap's stage as its container
    // No explicit x, y positioning as it's controlled by the HTML canvas element

    this.minimapContainer.interactive = true;
    this.minimapContainer.hitArea = new Rectangle(
      0,
      0,
      this.MINIMAP_SIZE,
      this.MINIMAP_SIZE,
    );

    // Add a background for the minimap directly to the stage
    const minimapBackground = new Graphics();
    minimapBackground.fill({ color: 0x333333, alpha: 0.8 }); // Dark grey with some transparency
    minimapBackground.rect(0, 0, this.MINIMAP_SIZE, this.MINIMAP_SIZE);
    this.minimapContainer.addChild(minimapBackground);

    this.minimapGraphics = new Graphics();
    this.minimapContainer.addChild(this.minimapGraphics);

    this.cameraViewRect = new Graphics();
    this.minimapContainer.addChild(this.cameraViewRect);

    this.setupTerrainColors();
    this.calculateMinimapTileSize();
    this.setupMinimapInteraction();
  }

  private setupMinimapInteraction() {
    this.minimapContainer.on("pointerdown", (event) => {
      const clickPosition = event.data.getLocalPosition(this.minimapApp.stage); // Use minimapApp.stage for local position

      // Convert minimap coordinates to world coordinates
      const targetWorldX = clickPosition.x / this.minimapTileSize;
      const targetWorldY = clickPosition.y / this.minimapTileSize;

      // Adjust for centering the camera view on the clicked point
      const currentZoom = this.cameraControls.getCameraPosition().zoom;
      const viewportWidthInWorld = this.mainApp.view.width / currentZoom; // Use mainApp's view
      const viewportHeightInWorld = this.mainApp.view.height / currentZoom; // Use mainApp's view

      const cameraTargetX = -(targetWorldX - viewportWidthInWorld / 2);
      const cameraTargetY = -(targetWorldY - viewportHeightInWorld / 2);

      this.cameraControls.setCameraPosition(
        cameraTargetX,
        cameraTargetY,
        currentZoom,
      );
    });
  }

  private setupTerrainColors() {
    this.terrainColors = {
      DEEP_WATER: 0x000033, // Dark blue
      WATER: 0x000066, // Blue
      SAND: 0xffff99, // Light yellow
      GRASS: 0x006600, // Green
      FOREST: 0x003300, // Darker green
      MOUNTAIN: 0x999999, // Gray
      SNOW: 0xffffff, // White
      // Default for unknown terrain, should not happen with current setup
      DEFAULT: 0x000000,
    };
  }

  private calculateMinimapTileSize() {
    const mapWidth = this.mapGenerator.width;
    const mapHeight = this.mapGenerator.height;

    // Determine the largest tile size that fits both dimensions within MINIMAP_SIZE
    this.minimapTileSize = Math.min(
      this.MINIMAP_SIZE / mapWidth,
      this.MINIMAP_SIZE / mapHeight,
    );
  }

  public renderMapToMinimap() {
    this.minimapGraphics.clear();
    const terrainGrid = this.mapGenerator.getTerrainGrid();

    for (let y = 0; y < this.mapGenerator.height; y++) {
      for (let x = 0; x < this.mapGenerator.width; x++) {
        const terrainType = terrainGrid[y][x];
        const color =
          this.terrainColors[terrainType] || this.terrainColors.DEFAULT;

        this.minimapGraphics
          .rect(
            x * this.minimapTileSize,
            y * this.minimapTileSize,
            this.minimapTileSize,
            this.minimapTileSize,
          )
          .fill({ color: color });
      }
    }
  }

  public updateCameraView() {
    this.cameraViewRect.clear();

    const {
      x: cameraWorldX,
      y: cameraWorldY,
      zoom,
    } = this.cameraControls.getCameraPosition();
    const viewportWidth = this.mainApp.view.width; // Use mainApp's view
    const viewportHeight = this.mainApp.view.height; // Use mainApp's view

    // Calculate the visible world area
    // The cameraX and cameraY from CameraControls are effectively the top-left of the view in world coordinates when zoom is 1.
    // When zoomed, the container's position is cameraX * zoom and cameraY * zoom.
    // So, to get the top-left visible world coordinate, we do -container.x/zoom, -container.y/zoom
    const visibleWorldX = -cameraWorldX;
    const visibleWorldY = -cameraWorldY;
    const visibleWorldWidth = viewportWidth / zoom;
    const visibleWorldHeight = viewportHeight / zoom;

    // Convert world coordinates to minimap coordinates
    const minimapX = visibleWorldX * this.minimapTileSize;
    const minimapY = visibleWorldY * this.minimapTileSize;
    const minimapWidth = visibleWorldWidth * this.minimapTileSize;
    const minimapHeight = visibleWorldHeight * this.minimapTileSize;

    this.cameraViewRect
      .stroke({ width: 2, color: 0xff0000 }) // Red border for camera view
      .rect(minimapX, minimapY, minimapWidth, minimapHeight);
  }
}
