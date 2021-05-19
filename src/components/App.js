import React, { useState } from "react";
import Grid from "./Grid";
import Tile from "./Tile";
import SpriteSheet from "./SpriteSheet";
import sprites from "../../assets/sprites.png";
import {
  compareLocations,
  getCrossDirections,
  getLocation,
  getNeighbors,
} from "functional-game-utils";
import { remove } from "ramda";

// use mobx-state-tree to store game state

const spriteConfig = {
  size: 16,
  scale: 4,
};

const createSprite = SpriteSheet({
  sheet: sprites,
  width: 10,
  height: 10,
  tileWidth: spriteConfig.size,
  tileHeight: spriteConfig.size,
  scale: spriteConfig.scale,
});

const isLocationSelected = ({ location, selected }) =>
  selected &&
  selected.some((selectedLocation) =>
    compareLocations(location, selectedLocation)
  );

const omitKeys = (comparator, obj) => {
  return Object.entries(obj).reduce((newObj, [key, value]) => {
    if (comparator(value)) {
      return newObj;
    }

    return {
      ...newObj,
      [key]: value,
    };
  }, {});
};

const getRelativeDirection = (locationA, locationB) => {
  const relativeDirection = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  const rowDiff = locationA.row - locationB.row;
  const colDiff = locationA.col - locationB.col;

  if (rowDiff < 0) {
    relativeDirection.up = true;
  }

  if (rowDiff > 0) {
    relativeDirection.down = true;
  }

  if (colDiff < 0) {
    relativeDirection.left = true;
  }

  if (colDiff > 0) {
    relativeDirection.right = true;
  }

  return relativeDirection;
};

const getSelectedNeighborDirections = ({ tiles, location, selected }) => {
  const neighbors = getNeighbors(getCrossDirections, tiles, location);
  const selectedNeighbors = neighbors.filter((neighbor) =>
    selected.some((selectedLocation) =>
      compareLocations(neighbor, selectedLocation)
    )
  );

  return selectedNeighbors.reduce(
    (direction, neighborLocation) => ({
      ...direction,
      ...omitKeys(
        (key) => key === false,
        getRelativeDirection(location, neighborLocation)
      ),
    }),
    {}
  );
};

const App = ({ initialTiles }) => {
  const [tiles, setTiles] = useState(initialTiles);
  const [selected, setSelected] = useState([]);

  const addSelection = (location) => {
    setSelected([...selected, location]);
  };

  const removeSelection = (location) => {
    const removedSelectionIndex = selected.findIndex((selectedLocation) =>
      compareLocations(selectedLocation, location)
    );

    const newSelected = remove(removedSelectionIndex, 1, selected);

    setSelected(newSelected);
  };

  return (
    <Grid
      tiles={tiles}
      renderTile={(tile, location) => (
        <Tile
          createSprite={createSprite}
          tile={tile}
          location={location}
          selected={isLocationSelected({ location, selected })}
          selectedNeighborDirections={getSelectedNeighborDirections({
            tiles,
            location,
            selected,
          })}
          onClick={() =>
            isLocationSelected({ location, selected })
              ? removeSelection(location)
              : addSelection(location)
          }
          key={JSON.stringify(location)}
        />
      )}
      cellSize={`${spriteConfig.size * spriteConfig.scale}px`}
    />
  );
};

export default App;
