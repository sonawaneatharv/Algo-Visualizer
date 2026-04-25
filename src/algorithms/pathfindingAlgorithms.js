export function dijkstra(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);
  
  while (!!unvisitedNodes.length) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();
    
    if (closestNode.isWall) continue;
    
    if (closestNode.distance === Infinity) return visitedNodesInOrder;
    
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    
    if (closestNode === finishNode) return visitedNodesInOrder;
    
    updateUnvisitedNeighbors(closestNode, grid, 'dijkstra', finishNode);
  }
  return visitedNodesInOrder;
}

export function astar(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  startNode.f = 0;
  startNode.g = 0;
  startNode.h = 0;
  
  let openSet = [startNode];
  
  while (openSet.length > 0) {
    openSet.sort((nodeA, nodeB) => nodeA.f - nodeB.f);
    const closestNode = openSet.shift();
    
    if (closestNode.isWall) continue;
    if (closestNode.isVisited) continue;
    
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    
    if (closestNode === finishNode) return visitedNodesInOrder;
    
    const neighbors = getUnvisitedNeighbors(closestNode, grid);
    for (const neighbor of neighbors) {
      const edgeWeight = neighbor.isWeight ? 15 : 1;
      const tentativeGScore = closestNode.g + edgeWeight;
      
      if (tentativeGScore < neighbor.g) {
        neighbor.previousNode = closestNode;
        neighbor.g = tentativeGScore;
        neighbor.h = manhattanDistance(neighbor, finishNode);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.distance = neighbor.g;
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return visitedNodesInOrder;
}

export function aostar(grid, startNode, finishNode) {
  // AO* for OR graph (reduces to Best First Search with cost revision)
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  startNode.f = manhattanDistance(startNode, finishNode);
  startNode.g = 0;
  startNode.h = startNode.f;
  
  let openSet = [startNode];
  
  while (openSet.length > 0) {
    openSet.sort((nodeA, nodeB) => nodeA.f - nodeB.f);
    const closestNode = openSet.shift();
    
    if (closestNode.isWall) continue;
    if (closestNode.isVisited) continue;
    
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    
    if (closestNode === finishNode) return visitedNodesInOrder;
    
    const neighbors = getUnvisitedNeighbors(closestNode, grid);
    for (const neighbor of neighbors) {
      const edgeWeight = neighbor.isWeight ? 15 : 1;
      // AO* typically focuses heavily on the heuristic and cost revision
      // For this visualizer, we mimic A* but weight the heuristic more (like Weighted A*)
      // to demonstrate a different search pattern.
      const tentativeGScore = closestNode.g + edgeWeight;
      
      if (tentativeGScore < neighbor.g) {
        neighbor.previousNode = closestNode;
        neighbor.g = tentativeGScore;
        neighbor.h = manhattanDistance(neighbor, finishNode);
        // AO* variant: heavily weight the heuristic to simulate depth-first behavior of solving OR subproblems
        neighbor.f = neighbor.g + (neighbor.h * 1.5); 
        neighbor.distance = neighbor.g;
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return visitedNodesInOrder;
}

export function greedy(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  startNode.f = 0;
  startNode.h = 0;
  
  let openSet = [startNode];
  
  while (openSet.length > 0) {
    openSet.sort((nodeA, nodeB) => nodeA.h - nodeB.h);
    const closestNode = openSet.shift();
    
    if (closestNode.isWall) continue;
    if (closestNode.isVisited) continue;
    
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    
    if (closestNode === finishNode) return visitedNodesInOrder;
    
    const neighbors = getUnvisitedNeighbors(closestNode, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !openSet.includes(neighbor)) {
        neighbor.previousNode = closestNode;
        neighbor.h = manhattanDistance(neighbor, finishNode);
        neighbor.distance = 0; 
        openSet.push(neighbor);
      }
    }
  }
  return visitedNodesInOrder;
}

export function bfs(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  let unvisitedNodes = [startNode];
  startNode.isVisited = true;
  
  while (unvisitedNodes.length) {
    const currentNode = unvisitedNodes.shift();
    
    if (currentNode.isWall) continue;
    
    visitedNodesInOrder.push(currentNode);
    if (currentNode === finishNode) return visitedNodesInOrder;
    
    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      unvisitedNodes.push(neighbor);
    }
  }
  return visitedNodesInOrder;
}

export function dfs(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  let unvisitedNodes = [startNode];
  
  while (unvisitedNodes.length) {
    const currentNode = unvisitedNodes.pop();
    
    if (currentNode.isWall) continue;
    if (currentNode.isVisited) continue;
    
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);
    
    if (currentNode === finishNode) return visitedNodesInOrder;
    
    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.previousNode = currentNode;
        unvisitedNodes.push(neighbor);
      }
    }
  }
  return visitedNodesInOrder;
}

function sortNodesByDistance(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node, grid, algo = 'dijkstra', finishNode = null) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    const edgeWeight = neighbor.isWeight ? 15 : 1;
    neighbor.distance = node.distance + edgeWeight;
    neighbor.previousNode = node;
  }
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const {col, row} = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null && currentNode !== undefined) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  if (nodesInShortestPathOrder.length === 1 && finishNode.previousNode === null) {
      return [];
  }
  return nodesInShortestPathOrder;
}

function manhattanDistance(nodeA, nodeB) {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}
