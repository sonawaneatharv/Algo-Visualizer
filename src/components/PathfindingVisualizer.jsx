import React, { useState, useEffect, useCallback } from 'react';
import Node from './Node';
import { dijkstra, astar, aostar, greedy, bfs, dfs, getNodesInShortestPathOrder } from '../algorithms/pathfindingAlgorithms';
import { randomMaze, weightMaze, recursiveDivisionMaze, simpleStairPattern } from '../algorithms/mazeAlgorithms';

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
  const [wPressed, setWPressed] = useState(false);
  const [speed, setSpeed] = useState(10); // 10ms Fast, 25ms Avg, 50ms Slow

  useEffect(() => {
    const initialGrid = getInitialGrid(startNodePos, finishNodePos);
    setGrid(initialGrid);

    const handleKeyDown = (e) => {
      if (e.key === 'w' || e.key === 'W') setWPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'w' || e.key === 'W') setWPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseDown = (row, col) => {
    if (isAnimating) return;
    if (row === startNodePos.row && col === startNodePos.col) {
      setMovingStart(true);
    } else if (row === finishNodePos.row && col === finishNodePos.col) {
      setMovingFinish(true);
    } else {
      const newGrid = getNewGridWithToggle(grid, row, col, wPressed);
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
      const newGrid = getNewGridWithToggle(grid, row, col, wPressed);
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

  const clearWallsAndWeights = () => {
    if (isAnimating) return;
    const newGrid = grid.map(row => 
      row.map(node => ({
        ...node,
        isWall: false,
        isWeight: false,
      }))
    );
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const node = document.getElementById(`node-${row}-${col}`);
        if (node.className.includes('node-wall') || node.className.includes('node-weight')) {
          node.className = 'node';
        }
      }
    }
    setGrid(newGrid);
  };

  const clearPath = () => {
    if (isAnimating) return;
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const node = document.getElementById(`node-${row}-${col}`);
        if (node.className.includes('node-visited') || node.className.includes('node-shortest-path')) {
          if (row === startNodePos.row && col === startNodePos.col) {
            node.className = 'node node-start';
          } else if (row === finishNodePos.row && col === finishNodePos.col) {
            node.className = 'node node-target';
          } else if (grid[row][col].isWeight) {
            node.className = 'node node-weight';
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

    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
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
          const extra = node.isWeight ? 'node-visited-weight' : '';
          document.getElementById(`node-${node.row}-${node.col}`).className = `node node-visited ${extra}`;
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
      case 'weight':
        nodesToAnimate = weightMaze(gridCopy);
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

    animateMaze(nodesToAnimate, mazeType === 'weight' ? 'weight' : 'wall');
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
          if (type === 'weight') {
            newGrid[node.row][node.col] = { ...newGrid[node.row][node.col], isWeight: true };
          } else {
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
            <option value="weight">Basic Weight Maze</option>
            <option value="stair">Simple Stair Pattern</option>
          </select>
          
          <button className="btn btn-primary" onClick={visualizeAlgorithm} disabled={isAnimating}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Visualize!
          </button>
          
          <button className="btn" onClick={clearBoard} disabled={isAnimating}>Clear Board</button>
          <button className="btn" onClick={clearWallsAndWeights} disabled={isAnimating}>Clear Walls & Weights</button>
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
        <div className="legend-item"><div className="legend-color node-weight"></div> Weight Node</div>
        <div className="legend-item"><div className="legend-color" style={{backgroundColor: 'var(--node-unvisited)'}}></div> Unvisited Node</div>
        <div className="legend-item"><div className="legend-color" style={{backgroundColor: 'var(--node-visited)'}}></div> Visited Node</div>
        <div className="legend-item"><div className="legend-color" style={{backgroundColor: 'var(--node-shortest-path)'}}></div> Shortest-path Node</div>
        <div className="legend-item"><div className="legend-color" style={{backgroundColor: 'var(--node-wall)'}}></div> Wall Node</div>
      </div>

      <div className="grid-container">
        <div className="grid" onMouseLeave={handleMouseUp}>
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="row">
              {row.map((node, nodeIdx) => {
                const { row, col, isFinish, isStart, isWall, isWeight } = node;
                return (
                  <Node
                    key={nodeIdx}
                    col={col}
                    isFinish={isFinish}
                    isStart={isStart}
                    isWall={isWall}
                    isWeight={isWeight}
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
    isWeight: false,
    previousNode: null,
    f: Infinity,
    g: Infinity,
    h: Infinity,
  };
};

const getNewGridWithToggle = (grid, row, col, wPressed) => {
  const newGrid = grid.slice();
  newGrid[row] = grid[row].slice();
  const node = newGrid[row][col];
  
  if (wPressed) {
    newGrid[row][col] = {
      ...node,
      isWeight: !node.isWeight,
      isWall: false,
    };
  } else {
    newGrid[row][col] = {
      ...node,
      isWall: !node.isWall,
      isWeight: false,
    };
  }
  return newGrid;
};

const getGridWithNewStart = (grid, row, col, oldStart) => {
  const newGrid = grid.slice();
  newGrid[oldStart.row] = grid[oldStart.row].slice();
  newGrid[oldStart.row][oldStart.col] = { ...newGrid[oldStart.row][oldStart.col], isStart: false };
  
  newGrid[row] = grid[row].slice();
  newGrid[row][col] = { ...newGrid[row][col], isStart: true, isWall: false, isWeight: false };
  return newGrid;
};

const getGridWithNewFinish = (grid, row, col, oldFinish) => {
  const newGrid = grid.slice();
  newGrid[oldFinish.row] = grid[oldFinish.row].slice();
  newGrid[oldFinish.row][oldFinish.col] = { ...newGrid[oldFinish.row][oldFinish.col], isFinish: false };
  
  newGrid[row] = grid[row].slice();
  newGrid[row][col] = { ...newGrid[row][col], isFinish: true, isWall: false, isWeight: false };
  return newGrid;
};

export default PathfindingVisualizer;
