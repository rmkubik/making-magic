import React from "react";
import { getDimensions, mapMatrix } from "functional-game-utils";

const Grid = ({ tiles, renderTile, cellSize }) => {
  const { height, width } = getDimensions(tiles);
  const gridStyles = {
    display: "grid",
    gridTemplateColumns: `${cellSize} `.repeat(width),
    gridTemplateRows: `${cellSize} `.repeat(height),
  };

  return <div style={gridStyles}>{mapMatrix(renderTile, tiles)}</div>;
};

export default Grid;
