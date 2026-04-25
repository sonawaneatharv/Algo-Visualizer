import React from 'react';

const Node = React.memo(({
  col,
  isFinish,
  isStart,
  isWall,
  isWeight,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  row,
}) => {
  const extraClassName = isFinish
    ? 'node-target'
    : isStart
    ? 'node-start'
    : isWall
    ? 'node-wall'
    : isWeight
    ? 'node-weight'
    : '';

  return (
    <div
      id={`node-${row}-${col}`}
      className={`node ${extraClassName}`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
    ></div>
  );
});

export default Node;
