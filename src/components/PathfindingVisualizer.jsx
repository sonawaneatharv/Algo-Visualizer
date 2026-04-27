import React, { useState, useEffect, useCallback } from 'react';
import Node from './Node';
import { dijkstra, astar, aostar, greedy, bfs, dfs, getNodesInShortestPathOrder } from '../algorithms/pathfindingAlgorithms';
import { randomMaze, recursiveDivisionMaze, simpleStairPattern } from '../algorithms/mazeAlgorithms';
const ALGORITHM_INFO = {
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: "Dijkstra's algorithm guarantees the shortest path. It explores all possible paths from the starting node, expanding outwards uniformly, prioritizing nodes based on the cumulative distance from the start.",
    timeComplexity: "O(V + E log V)",
    spaceComplexity: "O(V)",
    isOptimal: true,
  },
  astar: {
    name: "A* Search",
    description: "A* Search is generally the best-performing pathfinding algorithm. It uses a heuristic (Manhattan distance) to guide its search towards the target, guaranteeing the shortest path while exploring fewer nodes than Dijkstra.",
    timeComplexity: "O(E)",
    spaceComplexity: "O(V)",
    isOptimal: true,
  },
  aostar: {
    name: "AO* Search",
    description: "AO* Search typically solves AND/OR graphs. In this visualizer, it's implemented as a variant that heavily weights the heuristic to simulate depth-first behavior, showing a different search pattern. It does not guarantee the shortest path here.",
    timeComplexity: "O(E)",
    spaceComplexity: "O(V)",
    isOptimal: false,
  },
  greedy: {
    name: "Greedy Best-first Search",
    description: "Greedy Best-first Search evaluates nodes based solely on their heuristic distance to the target. It is faster than Dijkstra and A* but does not guarantee the shortest path, as it ignores the cost of the path traversed so far.",
    timeComplexity: "O(V^2)",
    spaceComplexity: "O(V)",
    isOptimal: false,
  },
  bfs: {
    name: "Breadth-first Search",
    description: "Breadth-first Search explores all neighbor nodes at the present depth before moving on to the nodes at the next depth level. It guarantees the shortest path on an unweighted grid.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    isOptimal: true,
  },
  dfs: {
    name: "Depth-first Search",
    description: "Depth-first Search explores as far as possible along each branch before backtracking. It is a poor algorithm for pathfinding and does not guarantee the shortest path.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    isOptimal: false,
  }
};

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;
const MAX_ROWS = 21;
const MAX_COLS = 50;

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [movingStart, setMovingStart] = useState(false);
  const [movingFinish, setMovingFinish] = useState(false);
  
  const [startNodePos, setStartNodePos] = useState({ row: START_NODE_ROW, col: START_NODE_COL });
  const [finishNodePos, setFinishNodePos] = useState({ row: FINISH_NODE_ROW, col: FINISH_NODE_COL });
  
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra');
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(10); // 10ms Fast, 25ms Avg, 50ms Slow
  const [pathCost, setPathCost] = useState(null);
  const [algoCost, setAlgoCost] = useState(null);
  const [comparisonStats, setComparisonStats] = useState(null);
  useEffect(() => {
    const initialGrid = getInitialGrid(startNodePos, finishNodePos);
    setGrid(initialGrid);
  }, []);

  const handleMouseDown = (row, col) => {
    if (isAnimating) return;
    if (row === startNodePos.row && col === startNodePos.col) {
      setMovingStart(true);
    } else if (row === finishNodePos.row && col === finishNodePos.col) {
      setMovingFinish(true);
    } else {
      const newGrid = getNewGridWithToggle(grid, row, col);
      setGrid(newGrid);
    }
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed || isAnimating) return;
    if (movingStart) {
      const newGrid = getGridWithNewStart(grid, row, col, startNodePos);
      setStartNodePos({ row, col });
      setGrid(newGrid);
    } else if (movingFinish) {
      const newGrid = getGridWithNewFinish(grid, row, col, finishNodePos);
      setFinishNodePos({ row, col });
      setGrid(newGrid);
    } else {
      if ((row === startNodePos.row && col === startNodePos.col) || 
          (row === finishNodePos.row && col === finishNodePos.col)) return;
      const newGrid = getNewGridWithToggle(grid, row, col);
      setGrid(newGrid);
    }
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
    setMovingStart(false);
    setMovingFinish(false);
  };

  const clearBoard = () => {
    if (isAnimating) return;
    setPathCost(null);
    setAlgoCost(null);
    setComparisonStats(null);
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const node = document.getElementById(`node-${row}-${col}`);
        if (row === startNodePos.row && col === startNodePos.col) {
          node.className = 'node node-start';
        } else if (row === finishNodePos.row && col === finishNodePos.col) {
          node.className = 'node node-target';
        } else {
          node.className = 'node';
        }
      }
    }
    setGrid(getInitialGrid(startNodePos, finishNodePos));
  };

  const clearWalls = () => {
    if (isAnimating) return;
    const newGrid = grid.map(row => 
      row.map(node => ({
        ...node,
        isWall: false,
      }))
    );
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const node = document.getElementById(`node-${row}-${col}`);
        if (node.className.includes('node-wall')) {
          node.className = 'node';
        }
      }
    }
    setGrid(newGrid);
  };

  const clearPath = () => {
    if (isAnimating) return;
    setPathCost(null);
    setAlgoCost(null);
    setComparisonStats(null);
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const node = document.getElementById(`node-${row}-${col}`);
        if (node.className.includes('node-visited') || node.className.includes('node-shortest-path')) {
          if (row === startNodePos.row && col === startNodePos.col) {
            node.className = 'node node-start';
          } else if (row === finishNodePos.row && col === finishNodePos.col) {
            node.className = 'node node-target';
          } else {
            node.className = 'node';
          }
        }
      }
    }
    const newGrid = grid.map(row => {
      return row.map(node => ({
        ...node,
        isVisited: false,
        distance: Infinity,
        f: Infinity,
        g: Infinity,
        h: Infinity,
        previousNode: null,
      }));
    });
    setGrid(newGrid);
  };

  const runAlgo = (algoName, gridCopy, start, finish) => {
    switch (algoName) {
      case 'dijkstra': return dijkstra(gridCopy, start, finish);
      case 'astar': return astar(gridCopy, start, finish);
      case 'aostar': return aostar(gridCopy, start, finish);
      case 'greedy': return greedy(gridCopy, start, finish);
      case 'bfs': return bfs(gridCopy, start, finish);
      case 'dfs': return dfs(gridCopy, start, finish);
      default: return dijkstra(gridCopy, start, finish);
    }
  };

  const visualizeAlgorithm = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    clearPath();
    
    // clone grid for algo
    const gridCopy = grid.map(row => row.map(node => ({...node})));
    const startNodeCopy = gridCopy[startNodePos.row][startNodePos.col];
    const finishNodeCopy = gridCopy[finishNodePos.row][finishNodePos.col];
    
    const visitedNodesInOrder = runAlgo(selectedAlgorithm, gridCopy, startNodeCopy, finishNodeCopy);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNodeCopy);

    let algoCurrentCost = 0;
    for (const node of visitedNodesInOrder) {
      algoCurrentCost += 1;
    }
    setAlgoCost(algoCurrentCost);

    let currentCost = 0;
    if (nodesInShortestPathOrder.length > 0) {
      for (let i = 1; i < nodesInShortestPathOrder.length; i++) {
        currentCost += 1;
      }
      setPathCost(currentCost);
    } else {
      setPathCost(-1);
    }

    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const compareAllAlgorithms = () => {
    if (isAnimating) return;
    
    const algorithms = ['dijkstra', 'astar', 'aostar', 'greedy', 'bfs', 'dfs'];
    const results = [];
    
    algorithms.forEach(algo => {
      const gridCopy = grid.map(row => row.map(node => ({
        ...node, 
        isVisited: false, 
        distance: Infinity, 
        f: Infinity, 
        g: Infinity, 
        h: Infinity, 
        previousNode: null 
      })));
      const startNodeCopy = gridCopy[startNodePos.row][startNodePos.col];
      const finishNodeCopy = gridCopy[finishNodePos.row][finishNodePos.col];
      
      const visitedNodesInOrder = runAlgo(algo, gridCopy, startNodeCopy, finishNodeCopy);
      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNodeCopy);
      
      let algoTime = 0;
      for (const node of visitedNodesInOrder) {
        algoTime += 1;
      }
      
      let pTime = 0;
      if (nodesInShortestPathOrder.length > 0 && nodesInShortestPathOrder[nodesInShortestPathOrder.length - 1] === finishNodeCopy) {
        for (let i = 1; i < nodesInShortestPathOrder.length; i++) {
          pTime += 1;
        }
      } else {
        pTime = -1;
      }
      
      results.push({
        id: algo,
        name: ALGORITHM_INFO[algo].name,
        algoTime,
        pathTime: pTime,
        visitedCount: visitedNodesInOrder.length
      });
    });
    
    results.sort((a, b) => a.algoTime - b.algoTime);
    setComparisonStats(results);
  };

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if ((node.row !== startNodePos.row || node.col !== startNodePos.col) && 
            (node.row !== finishNodePos.row || node.col !== finishNodePos.col)) {
          document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
        }
        if (i === nodesInShortestPathOrder.length - 1) {
            setIsAnimating(false);
        }
      }, 50 * i);
    }
  };

  const animateAlgorithm = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, speed * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if ((node.row !== startNodePos.row || node.col !== startNodePos.col) && 
            (node.row !== finishNodePos.row || node.col !== finishNodePos.col)) {
          document.getElementById(`node-${node.row}-${node.col}`).className = `node node-visited`;
        }
      }, speed * i);
    }
  };

  const generateMaze = (mazeType) => {
    if (isAnimating) return;
    setIsAnimating(true);
    clearBoard();
    const gridCopy = getInitialGrid(startNodePos, finishNodePos);
    let nodesToAnimate = [];

    switch (mazeType) {
      case 'random':
        nodesToAnimate = randomMaze(gridCopy);
        break;
      case 'recursive':
        nodesToAnimate = recursiveDivisionMaze(gridCopy, startNodePos, finishNodePos, 'normal');
        break;
      case 'recursiveVertical':
        nodesToAnimate = recursiveDivisionMaze(gridCopy, startNodePos, finishNodePos, 'vertical');
        break;
      case 'recursiveHorizontal':
        nodesToAnimate = recursiveDivisionMaze(gridCopy, startNodePos, finishNodePos, 'horizontal');
        break;
      case 'stair':
        nodesToAnimate = simpleStairPattern(gridCopy);
        break;
      default:
        break;
    }

    animateMaze(nodesToAnimate, 'wall');
  };

  const animateMaze = (nodesToAnimate, type) => {
    for (let i = 0; i < nodesToAnimate.length; i++) {
      setTimeout(() => {
        const node = nodesToAnimate[i];
        if (
          (node.row === startNodePos.row && node.col === startNodePos.col) ||
          (node.row === finishNodePos.row && node.col === finishNodePos.col)
        ) return;
        
        setGrid((prevGrid) => {
          const newGrid = prevGrid.slice();
          newGrid[node.row] = prevGrid[node.row].slice();
          if (type === 'wall') {
            newGrid[node.row][node.col] = { ...newGrid[node.row][node.col], isWall: true };
          }
          return newGrid;
        });

      }, 10 * i);
    }
    setTimeout(() => setIsAnimating(false), 10 * nodesToAnimate.length);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">Pathfinding Visualizer</div>
        <div className="nav-controls">
          <select 
            className="select-control"
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            disabled={isAnimating}
          >
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="astar">A* Search</option>
            <option value="aostar">AO* Search</option>
            <option value="greedy">Greedy Best-first Search</option>
            <option value="bfs">Breadth-first Search</option>
            <option value="dfs">Depth-first Search</option>
          </select>

          <select 
            className="select-control"
            onChange={(e) => generateMaze(e.target.value)}
            disabled={isAnimating}
            defaultValue=""
          >
            <option value="" disabled>Mazes & Patterns</option>
            <option value="recursive">Recursive Division</option>
            <option value="recursiveVertical">Recursive Division (vertical skew)</option>
            <option value="recursiveHorizontal">Recursive Division (horizontal skew)</option>
            <option value="random">Basic Random Maze</option>
            <option value="stair">Simple Stair Pattern</option>
          </select>
          
          <button className="btn btn-primary" onClick={visualizeAlgorithm} disabled={isAnimating}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Visualize!
          </button>
          
          <button className="btn btn-secondary" onClick={compareAllAlgorithms} disabled={isAnimating}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            Compare All
          </button>
          
          <button className="btn" onClick={clearBoard} disabled={isAnimating}>Clear Board</button>
          <button className="btn" onClick={clearWalls} disabled={isAnimating}>Clear Walls</button>
          <button className="btn" onClick={clearPath} disabled={isAnimating}>Clear Path</button>
          
          <select 
            className="select-control"
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            value={speed}
            disabled={isAnimating}
          >
            <option value="10">Speed: Fast</option>
            <option value="25">Speed: Average</option>
            <option value="50">Speed: Slow</option>
          </select>
        </div>
      </nav>

      <div className="legend">
        <div className="legend-item"><div className="legend-color node-start"></div> Start Node</div>
        <div className="legend-item"><div className="legend-color node-target"></div> Target Node</div>
        <div className="legend-item"><div className="legend-color" style={{backgroundColor: 'var(--node-unvisited)'}}></div> Unvisited Node</div>
        <div className="legend-item"><div className="legend-color" style={{backgroundColor: 'var(--node-visited)'}}></div> Visited Node</div>
        <div className="legend-item"><div className="legend-color" style={{backgroundColor: 'var(--node-shortest-path)'}}></div> Shortest-path Node</div>
        <div className="legend-item"><div className="legend-color" style={{backgroundColor: 'var(--node-wall)'}}></div> Wall Node</div>
      </div>

      <div className="algorithm-info">
        <div className="info-header">
          <h3>{ALGORITHM_INFO[selectedAlgorithm].name}</h3>
          <span className={`optimal-badge ${ALGORITHM_INFO[selectedAlgorithm].isOptimal ? 'optimal' : 'not-optimal'}`}>
            {ALGORITHM_INFO[selectedAlgorithm].isOptimal ? 'Optimal' : 'Not Optimal'}
          </span>
        </div>
        <p className="info-description">{ALGORITHM_INFO[selectedAlgorithm].description}</p>
        <div className="complexity-container">
          <div className="complexity-item">
            <span className="complexity-label">Time Complexity:</span>
            <span className="complexity-value">{ALGORITHM_INFO[selectedAlgorithm].timeComplexity}</span>
          </div>
          <div className="complexity-item">
            <span className="complexity-label">Space Complexity:</span>
            <span className="complexity-value">{ALGORITHM_INFO[selectedAlgorithm].spaceComplexity}</span>
          </div>
          {pathCost !== null && (
            <div className="complexity-item" style={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
              <span className="complexity-label" style={{ color: 'var(--text)' }}>Current Path Time:</span>
              <span className="complexity-value" style={{ fontSize: '1.1rem' }}>
                {pathCost === -1 ? 'Not Found' : `${pathCost} units`}
              </span>
            </div>
          )}
          {algoCost !== null && (
            <div className="complexity-item" style={{ borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
              <span className="complexity-label" style={{ color: 'var(--text)' }}>Algorithm Time:</span>
              <span className="complexity-value" style={{ fontSize: '1.1rem', color: '#c4b5fd' }}>
                {algoCost} units
              </span>
            </div>
          )}
        </div>
      </div>

      {comparisonStats && (
        <div className="comparison-panel">
          <h3>Algorithm Comparison (Current Board)</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Algorithm Time (Exploration Cost)</th>
                <th>Path Time (Length/Cost)</th>
                <th>Nodes Visited</th>
              </tr>
            </thead>
            <tbody>
              {comparisonStats.map((stat, idx) => (
                <tr key={stat.id} className={idx === 0 ? 'winner-row' : ''}>
                  <td>{stat.name} {idx === 0 && '👑'}</td>
                  <td>{stat.algoTime} units</td>
                  <td>{stat.pathTime === -1 ? 'Not Found' : `${stat.pathTime} units`}</td>
                  <td>{stat.visitedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid-container">
        <div className="grid" onMouseLeave={handleMouseUp}>
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="row">
              {row.map((node, nodeIdx) => {
                const { row, col, isFinish, isStart, isWall } = node;
                return (
                  <Node
                    key={nodeIdx}
                    col={col}
                    isFinish={isFinish}
                    isStart={isStart}
                    isWall={isWall}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={(row, col) => handleMouseDown(row, col)}
                    onMouseEnter={(row, col) => handleMouseEnter(row, col)}
                    onMouseUp={() => handleMouseUp()}
                    row={row}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getInitialGrid = (startPos, finishPos) => {
  const grid = [];
  for (let row = 0; row < MAX_ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < MAX_COLS; col++) {
      currentRow.push(createNode(col, row, startPos, finishPos));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, startPos, finishPos) => {
  return {
    col,
    row,
    isStart: row === startPos.row && col === startPos.col,
    isFinish: row === finishPos.row && col === finishPos.col,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    f: Infinity,
    g: Infinity,
    h: Infinity,
  };
};

const getNewGridWithToggle = (grid, row, col) => {
  const newGrid = grid.slice();
  newGrid[row] = grid[row].slice();
  const node = newGrid[row][col];
  
  newGrid[row][col] = {
    ...node,
    isWall: !node.isWall,
  };
  return newGrid;
};

const getGridWithNewStart = (grid, row, col, oldStart) => {
  const newGrid = grid.slice();
  
  if (oldStart.row === row) {
    newGrid[row] = grid[row].slice();
    newGrid[oldStart.row][oldStart.col] = { ...newGrid[oldStart.row][oldStart.col], isStart: false };
    newGrid[row][col] = { ...newGrid[row][col], isStart: true, isWall: false };
  } else {
    newGrid[oldStart.row] = grid[oldStart.row].slice();
    newGrid[oldStart.row][oldStart.col] = { ...newGrid[oldStart.row][oldStart.col], isStart: false };
    
    newGrid[row] = grid[row].slice();
    newGrid[row][col] = { ...newGrid[row][col], isStart: true, isWall: false };
  }

  return newGrid;
};

const getGridWithNewFinish = (grid, row, col, oldFinish) => {
  const newGrid = grid.slice();
  
  if (oldFinish.row === row) {
    newGrid[row] = grid[row].slice();
    newGrid[oldFinish.row][oldFinish.col] = { ...newGrid[oldFinish.row][oldFinish.col], isFinish: false };
    newGrid[row][col] = { ...newGrid[row][col], isFinish: true, isWall: false };
  } else {
    newGrid[oldFinish.row] = grid[oldFinish.row].slice();
    newGrid[oldFinish.row][oldFinish.col] = { ...newGrid[oldFinish.row][oldFinish.col], isFinish: false };
    
    newGrid[row] = grid[row].slice();
    newGrid[row][col] = { ...newGrid[row][col], isFinish: true, isWall: false };
  }

  return newGrid;
};

export default PathfindingVisualizer;
