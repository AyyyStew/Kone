import {
  RandomWalker,
  WeightedWalker,
  CorridorWalker,
  RoomExpander,
} from "./walkers.js";

export class InfiniteDungeon {
  constructor(canvasId, walkers = []) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    // Set up canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Scale: How many pixels each movement step covers
    this.scale = 3;

    // Center the maze
    this.offsetX = this.canvas.width / 2;
    this.offsetY = this.canvas.height / 2;

    // Ensure mazeState is a Set
    this.mazeState = new Set();

    // Initialize walkers with shared mazeState.
    // If none are provided, use some defaults.
    this.walkers =
      walkers.length > 0
        ? walkers
        : [
            new RandomWalker(0, 0, this.mazeState), // red by default
            new WeightedWalker(10, 10, this.mazeState), // blue by default
            new CorridorWalker(-10, -10, this.mazeState), // green by default
            new RoomExpander(-5, 5, this.mazeState), // purple by default
          ];
  }

  moveWalkers() {
    this.walkers.forEach((walker) => walker.move());
  }

  expandMaze(steps = 10) {
    for (let i = 0; i < steps; i++) {
      this.moveWalkers();
      this.drawMaze();
    }
  }

  drawMaze() {
    this.walkers.forEach((walker) => {
      // Use the walker's own color, or fall back to white.
      this.ctx.fillStyle = walker.color || "white";

      walker.visited.forEach((pos) => {
        const [x, y] = pos.split(",").map(Number);
        this.ctx.fillRect(
          this.offsetX + x * this.scale,
          this.offsetY + y * this.scale,
          1,
          1
        );
      });
    });
  }
}
