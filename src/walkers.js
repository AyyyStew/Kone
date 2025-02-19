export class Walker {
  constructor(x, y, name, color, mazeState) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = color;
    this.visited = new Set();

    if (!mazeState || !(mazeState instanceof Set)) {
      throw new Error("Walker requires a valid mazeState Set.");
    }
    this.mazeState = mazeState;

    // Track initial position
    const pos = this.getPosition();
    this.visited.add(pos);
    this.mazeState.add(pos);
  }

  move() {
    throw new Error("move() must be implemented in subclasses");
  }

  getPosition() {
    return `${this.x},${this.y}`;
  }
}

export class RandomWalker extends Walker {
  constructor(x, y, mazeState, color = "red") {
    super(x, y, "R", color, mazeState);
  }

  move() {
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    let move;
    // 30% chance: prefer a visited cell if one exists nearby.
    if (Math.random() < 0.3) {
      move =
        directions.find((dir) =>
          this.mazeState.has(`${this.x + dir.dx},${this.y + dir.dy}`)
        ) || directions[Math.floor(Math.random() * directions.length)];
    } else {
      move = directions[Math.floor(Math.random() * directions.length)];
    }

    this.x += move.dx;
    this.y += move.dy;
    const pos = this.getPosition();
    this.visited.add(pos);
    this.mazeState.add(pos);
  }
}

export class WeightedWalker extends Walker {
  // Note: additional parameters follow after mazeState and color.
  constructor(
    x,
    y,
    mazeState,
    color = "blue",
    biasDirection = { dx: 1, dy: 0 },
    biasWeight = 3
  ) {
    super(x, y, "W", color, mazeState);
    this.biasDirection = biasDirection;
    this.biasWeight = biasWeight;
  }

  move() {
    const baseDirections = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    // Build a weighted array that favors the biasDirection.
    const weightedDirections = baseDirections.concat(
      Array(this.biasWeight).fill(this.biasDirection)
    );

    const move =
      weightedDirections[Math.floor(Math.random() * weightedDirections.length)];

    this.x += move.dx;
    this.y += move.dy;
    const pos = this.getPosition();
    this.visited.add(pos);
    this.mazeState.add(pos);
  }
}

export class CorridorWalker extends Walker {
  constructor(x, y, mazeState, color = "green") {
    super(x, y, "C", color, mazeState);
    this.direction = { dx: 1, dy: 0 };
    this.turnChance = 0.2;
  }

  move() {
    if (
      Math.random() < this.turnChance ||
      this.mazeState.has(
        `${this.x + this.direction.dx},${this.y + this.direction.dy}`
      )
    ) {
      this.direction =
        Math.random() > 0.5
          ? { dx: this.direction.dy, dy: -this.direction.dx }
          : { dx: -this.direction.dy, dy: this.direction.dx };
    }

    this.x += this.direction.dx;
    this.y += this.direction.dy;
    const pos = this.getPosition();
    this.visited.add(pos);
    this.mazeState.add(pos);
  }
}

export class RoomExpander extends Walker {
  // Parameter order: x, y, mazeState, color, roomSize.
  constructor(x, y, mazeState, color = "purple", roomSize = 5) {
    super(x, y, "O", color, mazeState);
    this.roomSize = roomSize;
    this.steps = 0;
  }

  move() {
    // Random move
    this.x += Math.floor(Math.random() * 3) - 1;
    this.y += Math.floor(Math.random() * 3) - 1;

    // "Stamp" a room: mark a square of cells centered on the current position.
    const half = Math.floor(this.roomSize / 2);
    for (let dx = -half; dx <= half; dx++) {
      for (let dy = -half; dy <= half; dy++) {
        const pos = `${this.x + dx},${this.y + dy}`;
        this.visited.add(pos);
        this.mazeState.add(pos);
      }
    }
    this.steps++;
  }
}

export class ZigZagWalker extends Walker {
  constructor(x, y, mazeState, color = "yellow") {
    super(x, y, "Z", color, mazeState);
    this.direction = { dx: 1, dy: 0 }; // Start moving right
    this.turnChance = 0.5; // 50% chance to switch direction
  }

  move() {
    if (Math.random() < this.turnChance) {
      this.direction =
        Math.random() > 0.5
          ? { dx: -this.direction.dy, dy: this.direction.dx } // Turn left
          : { dx: this.direction.dy, dy: -this.direction.dx }; // Turn right
    }

    this.x += this.direction.dx;
    this.y += this.direction.dy;
    const pos = this.getPosition();
    this.visited.add(pos);
    this.mazeState.add(pos);
  }
}

export class ChaoticClusterWalker extends Walker {
  constructor(x, y, mazeState, color = "orange", clusterRadius = 5) {
    super(x, y, "C", color, mazeState);
    this.startX = x;
    this.startY = y;
    this.clusterRadius = clusterRadius;
  }

  move() {
    let move;
    do {
      move = {
        dx: Math.floor(Math.random() * 3) - 1, // -1, 0, or 1
        dy: Math.floor(Math.random() * 3) - 1, // -1, 0, or 1
      };
    } while (
      Math.abs(this.x + move.dx - this.startX) > this.clusterRadius ||
      Math.abs(this.y + move.dy - this.startY) > this.clusterRadius
    );

    this.x += move.dx;
    this.y += move.dy;
    const pos = this.getPosition();
    this.visited.add(pos);
    this.mazeState.add(pos);
  }
}

export class SpiralWalker extends Walker {
  constructor(x, y, mazeState, color = "cyan") {
    super(x, y, "S", color, mazeState);
    this.stepSize = 1;
    this.stepsTaken = 0;
    this.directionIndex = 0;
    this.directions = [
      { dx: 1, dy: 0 }, // Right
      { dx: 0, dy: 1 }, // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 0, dy: -1 }, // Up
    ];
  }

  move() {
    const move = this.directions[this.directionIndex];

    this.x += move.dx;
    this.y += move.dy;
    const pos = this.getPosition();
    this.visited.add(pos);
    this.mazeState.add(pos);

    this.stepsTaken++;

    // Change direction when the step count reaches the step size.
    if (this.stepsTaken >= this.stepSize) {
      this.stepsTaken = 0;
      this.directionIndex = (this.directionIndex + 1) % 4;
      // Increase step size every two turns (to create a spiral).
      if (this.directionIndex % 2 === 0) {
        this.stepSize++;
      }
    }
  }
}

export class DrunkenWalker extends Walker {
  constructor(x, y, mazeState, color = "brown") {
    super(x, y, "D", color, mazeState);
    this.prevMove = null;
  }

  move() {
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    let move;
    if (Math.random() < 0.2 && this.prevMove) {
      // 20% chance to backtrack.
      move = { dx: -this.prevMove.dx, dy: -this.prevMove.dy };
    } else {
      move = directions[Math.floor(Math.random() * directions.length)];
    }

    this.x += move.dx;
    this.y += move.dy;
    const pos = this.getPosition();
    this.visited.add(pos);
    this.mazeState.add(pos);
    this.prevMove = move;
  }
}

export class WallHuggerWalker extends Walker {
  constructor(x, y, mazeState, color = "pink", direction = { dx: 1, dy: 0 }) {
    super(x, y, "H", color, mazeState);
    this.direction = direction;
  }

  move() {
    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 0, dy: 1 }, // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 }, // Right
    ];

    // Try to keep moving in the same direction if possible.
    let move = this.direction;

    // Check if the next step in the current direction is not part of this walker's own path.
    if (
      !this.visited.has(`${this.x + move.dx},${this.y + move.dy}`) &&
      !this.mazeState.has(`${this.x + move.dx},${this.y + move.dy}`)
    ) {
      // Find a different occupied space by others to follow.
      const possibleMoves = directions.filter(
        (dir) =>
          this.mazeState.has(`${this.x + dir.dx},${this.y + dir.dy}`) &&
          !this.visited.has(`${this.x + dir.dx},${this.y + dir.dy}`)
      );

      if (possibleMoves.length > 0) {
        move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      } else {
        // If no other trails are adjacent, continue in the same direction or choose a new random direction
        move = directions[Math.floor(Math.random() * directions.length)];
      }
    }

    this.x += move.dx;
    this.y += move.dy;
    const pos = this.getPosition();
    this.visited.add(pos);
    this.mazeState.add(pos);
    this.direction = move; // Update direction.
  }
}
