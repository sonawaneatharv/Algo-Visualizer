# Pathfinding Visualizer (React)

A modern, highly interactive React application designed to visualize how various pathfinding and maze-generation algorithms work under the hood. Built from the ground up as a fully modernized version of a legacy vanilla JavaScript application, this project emphasizes performance, clean UI, and deep educational value.

## 🌟 Features

- **6 Pathfinding Algorithms:**
  - Dijkstra's Algorithm
  - A* Search
  - AO* Search (Weighted Heuristic Variant)
  - Greedy Best-first Search
  - Breadth-first Search
  - Depth-first Search
- **5 Maze & Pattern Generators:**
  - Recursive Division
  - Recursive Division (Vertical Skew)
  - Recursive Division (Horizontal Skew)
  - Basic Random Maze
  - Basic Weight Maze
  - Simple Stair Pattern
- **Interactive Grid System:**
  - Click and drag to construct **Walls** (impenetrable boundaries).
  - Hold `W` and click/drag to lay down **Weights** (costs 15x more to travel through).
  - Dynamically drag the **Start Node** and **Target Node** to see the algorithm adapt.
- **Micro-Animations & Visual Polish:** Smooth, modern CSS animations for node discovery, path selection, and wall/weight placements.
- **Playback Controls:** Instantly adjust visualization speed (Fast, Average, Slow) or clear the board/path seamlessly.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/en/) installed on your machine.

### Installation & Run Instructions

1. **Clone or Navigate to the directory:**
   ```bash
   cd react-visualizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173/` (or the port Vite provides) to start exploring!

## 📚 Study Documentation
If you are interested in learning about the mathematics and logic behind these algorithms, please check out the [STUDY_DOCS.md](./STUDY_DOCS.md) included in this repository. It provides deep-dive explanations and visual breakdowns of every algorithm featured in this application.

## 🛠 Tech Stack
- **Framework:** React + Vite
- **Styling:** Vanilla CSS3 with Custom Properties (CSS Variables) and Keyframe Animations
- **Deployment:** Ready for Vercel / Netlify / GitHub Pages

---
*This application is an excellent sandbox for computer science students and engineers looking to understand search algorithms visually.*
