import { InfiniteDungeon } from "./dungeon.js";
import {
  RandomWalker,
  WeightedWalker,
  CorridorWalker,
  RoomExpander,
  WallHuggerWalker,
  DrunkenWalker,
  SpiralWalker,
  ChaoticClusterWalker,
  ZigZagWalker,
} from "./walkers.js";

// Create the maze state (shared across all walkers)
const mazeState = new Set();

// Initialize different walkers with specific colors
const walkers = [
  new RandomWalker(0, 0, mazeState, "red"),
  new WeightedWalker(10, 10, mazeState, "blue", { dx: 1, dy: 0 }, 5),
  new CorridorWalker(-10, -10, mazeState, "green"),
  new RoomExpander(-5, 5, mazeState, "purple", 5),
  new WallHuggerWalker(15, 15, mazeState, "magenta"),
  new DrunkenWalker(-20, -20, mazeState, "yellow"),
  //   new SpiralWalker(0, 20, mazeState, "cyan"),
  new ChaoticClusterWalker(-30, -30, mazeState, "orange", 8),
  new ZigZagWalker(30, 30, mazeState, "pink"),
];

// Initialize the InfiniteDungeon with all walkers
const dungeon = new InfiniteDungeon("dungeonCanvas", walkers);

function animate() {
  dungeon.expandMaze(1);
  requestAnimationFrame(animate);
}

animate();
