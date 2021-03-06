import React from "react";

const createBackground = ({ location, selected, createSprite }) => {
  const isEvenCol = location.col % 2 === 0;
  const isEvenRow = location.row % 2 === 0;

  let col;

  if (isEvenRow) {
    col = isEvenCol ? 1 : 2;
  } else {
    col = isEvenCol ? 3 : 4;
  }

  const row = selected ? 4 : 2;

  return createSprite({ row, col });
};

const createItem = ({ tile, createSprite, items }) => {
  if (!items[tile]) {
    return null;
  }

  return createSprite(items[tile].sprite);
};

const createSelector = ({
  selected,
  selectedNeighborDirections,
  createSprite,
}) => {
  if (!selected) {
    return null;
  }

  // left, up, right down
  return (
    <div className="selector">
      {!selectedNeighborDirections.right && createSprite({ row: 3, col: 0 })}
      {!selectedNeighborDirections.down && createSprite({ row: 3, col: 1 })}
      {!selectedNeighborDirections.left && createSprite({ row: 3, col: 2 })}
      {!selectedNeighborDirections.up && createSprite({ row: 3, col: 3 })}
    </div>
  );
};

const Tile = ({
  createSprite,
  tile,
  location,
  selected,
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  selectedNeighborDirections,
  items,
  highlighted,
  spriteConfig,
}) => {
  const background = createBackground({ location, createSprite, selected });
  const item = createItem({ tile, createSprite, items });
  const selector = createSelector({
    selected,
    selectedNeighborDirections,
    createSprite,
  });

  return (
    <div
      className="tile"
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
    >
      {background}
      {highlighted && (
        <div
          style={{
            width: `${spriteConfig.size * spriteConfig.scale}px`,
            height: `${spriteConfig.size * spriteConfig.scale}px`,
          }}
          className="highlight-anim"
        />
      )}
      {item}
      {selector}
    </div>
  );
};

export default Tile;
