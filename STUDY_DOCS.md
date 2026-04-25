# Algorithm Study & Reference Guide

Welcome to the **Pathfinding Visualizer Study Guide**! This document breaks down the core concepts behind the algorithms powering the visualizer. Understanding these algorithms is foundational for computer science, AI, and game development.

---

## 1. Pathfinding Algorithms

Pathfinding algorithms fall into two broad categories:
1. **Unweighted Algorithms:** These assume every movement has the exact same cost (e.g., Cost = 1). They completely ignore "Weights" on the grid.
2. **Weighted Algorithms:** These take movement cost into account. If moving through a mud puddle (Weight Node) costs 15x more energy than walking on grass (Normal Node), the algorithm will try to find a way around the mud to save energy.

### Dijkstra's Algorithm (Weighted)
* **Status:** Guarantees the shortest path.
* **How it works:** Dijkstra's Algorithm behaves like a slow, expanding circle of water. It visits nodes uniformly in all directions, keeping track of the shortest distance from the start node to every other node it touches. Once it finally hits the target node, it stops. 
* **Pros:** 100% reliable for finding the absolute best path.
* **Cons:** Extremely slow. It explores blindly in all directions because it doesn't know where the target is geographically located.

### A* Search (Weighted)
* **Status:** Guarantees the shortest path.
* **How it works:** A* (A-Star) is arguably the most popular pathfinding algorithm in the world (widely used in video games and GPS routing). It combines Dijkstra's guaranteed accuracy with a "Heuristic" (an educated guess). 
  - **`g` score:** Distance from start node.
  - **`h` score (Heuristic):** Estimated distance to the target (we use "Manhattan Distance" in this app).
  - **`f` score:** Total score (`g + h`). 
  The algorithm always expands the node with the lowest `f` score. Because of `h`, it actively prioritizes searching *towards* the target, rather than in a blind circle.
* **Pros:** Extremely fast and still guarantees the absolute shortest path.

### AO* Search (Weighted Heuristic Variant)
* **Status:** Does *not* guarantee the shortest path in this specific grid context.
* **How it works:** Traditional AO* is used for AND/OR graphs where a goal requires multiple sub-goals to be met simultaneously (AND). A 2D grid is strictly an OR graph. In our visualizer, we implement AO* as an intensely heuristic-weighted search (often called Weighted A*). It calculates `f = g + (h * 1.5)`. 
* **Pros:** Blisteringly fast. It acts almost like a heat-seeking missile towards the target.
* **Cons:** Because it trusts its "guess" (heuristic) too much, it might run headfirst into a wall and have to backtrack, resulting in a path that isn't mathematically perfect.

### Greedy Best-first Search (Weighted)
* **Status:** Does *not* guarantee the shortest path.
* **How it works:** Greedy search only cares about one thing: the heuristic (`h`). It completely ignores how far it has already traveled (`g`). It asks, "Which adjacent node is physically closest to the target?" and goes there.
* **Pros:** Can be even faster than A* in completely open environments.
* **Cons:** It often creates highly suboptimal paths and can easily get trapped in "C" shaped wall enclosures because it refuses to step backwards (which would temporarily increase its distance to the target).

### Breadth-first Search (BFS) (Unweighted)
* **Status:** Guarantees the shortest path (in unweighted grids).
* **How it works:** Exactly like Dijkstra's, but it completely ignores node weights. It explores the grid level-by-level, checking all immediate neighbors, then all neighbors' neighbors, and so on.
* **Pros:** Excellent for simple grids without terrain variations.
* **Cons:** Cannot handle weighted graphs.

### Depth-first Search (DFS) (Unweighted)
* **Status:** Does *not* guarantee the shortest path.
* **How it works:** DFS goes as deep as possible down a single path until it hits a dead end (a wall or the edge of the board). Once stuck, it backtracks and tries the next path.
* **Pros:** Uses very little memory. Excellent for solving mazes where there is only one valid path.
* **Cons:** Terrible for open-area pathfinding. It might explore the entire board before stumbling onto the target, creating a massive, winding path.

---

## 2. Maze Generation Algorithms

Creating a good maze requires as much logic as solving one.

### Recursive Division
* **How it works:** 
  1. Start with an empty grid with a border wall around it.
  2. Bisect the grid by drawing a wall either horizontally or vertically across it.
  3. Poke a single "hole" in that new wall so the two sides remain connected.
  4. Now you have two smaller rooms. Repeat the process for both rooms recursively until the rooms are too small to divide.
* **Why it's cool:** It creates fractal-like, beautifully structured mazes. By tweaking the decision to split horizontally vs. vertically, we create **Skews**:
  - **Horizontal Skew:** Favors horizontal walls, creating long corridors.
  - **Vertical Skew:** Favors vertical walls, creating tall shafts.

### Random Maze & Random Weights
* **How it works:** Iterates through every single node on the grid and rolls a mathematical dice. `if (Math.random() < 0.25)`, it places a wall (or weight).
* **Why it's cool:** It simulates random, chaotic terrain.

### Simple Stair Pattern
* **How it works:** A procedural algorithm that steps diagonally across the grid (`row--`, `col++`, then `row++`, `col++`), creating a jagged wall. It showcases how algorithms navigate around simple but massive obstacles.

---

## Algorithm Summary Table

| Algorithm | Handles Weights? | Guarantees Shortest Path? | Search Strategy |
|-----------|-----------------|---------------------------|-----------------|
| **Dijkstra** | Yes | Yes | Blindly uniform expansion |
| **A* Search** | Yes | Yes | Guided expansion (Heuristic + Cost) |
| **AO* Variant** | Yes | No | Hyper-aggressive guided expansion |
| **Greedy** | Yes | No | Purely Heuristic (Ignores travel cost) |
| **BFS** | No | Yes (Unweighted only) | Layer-by-layer expansion |
| **DFS** | No | No | Plunge to dead-end, then backtrack |
