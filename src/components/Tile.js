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

const createItem = ({ tile, createSprite }) => {
  switch (tile) {
    case "p":
      return createSprite({ row: 0, col: 0 });
    case "t":
      return createSprite({ row: 0, col: 1 });
    case "s":
      return createSprite({ row: 0, col: 2 });
    case "S":
      return createSprite({ row: 0, col: 3 });
    case "m":
      return createSprite({ row: 0, col: 4 });
    case "M":
      return createSprite({ row: 0, col: 5 });
    case "a":
      return createSprite({ row: 0, col: 6 });
    case "e":
      return createSprite({ row: 0, col: 7 });
    case "A":
      return createSprite({ row: 0, col: 8 });
    case "E":
      return createSprite({ row: 0, col: 9 });
    case "l":
      return createSprite({ row: 1, col: 0 });
    case "h":
      return createSprite({ row: 1, col: 1 });
    case "8":
      return createSprite({ row: 1, col: 2 });
    case "w":
      return createSprite({ row: 1, col: 3 });
    case "L":
      return createSprite({ row: 1, col: 4 });
    case "d":
      return createSprite({ row: 1, col: 5 });
    case "b":
      return createSprite({ row: 1, col: 6 });
    case "f":
      return createSprite({ row: 1, col: 7 });
    case "3":
      return createSprite({ row: 1, col: 8 });
    case "4":
      return createSprite({ row: 1, col: 9 });
    case "F":
      return createSprite({ row: 2, col: 7 });
    case ".":
    default:
      return null;
  }
};

const createSelector = ({
  selected,
  selectedNeighborDirections,
  createSprite,
}) => {
  if (!selected) {
    return null;
  }

  if (Object.values(selectedNeighborDirections).length > 0) {
    console.log(selectedNeighborDirections);
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
  selectedNeighborDirections,
}) => {
  const background = createBackground({ location, createSprite, selected });
  const item = createItem({ tile, createSprite });
  const selector = createSelector({
    selected,
    selectedNeighborDirections,
    createSprite,
  });

  return (
    <div className="tile" onClick={onClick}>
      {background}
      {item}
      {selector}
    </div>
  );
};

export default Tile;
