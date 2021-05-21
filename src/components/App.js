import React, { useEffect, useState } from "react";
import Grid from "./Grid";
import Tile from "./Tile";
import SpriteSheet from "./SpriteSheet";
import sprites from "../../assets/sprites.png";
import {
  compareLocations,
  constructMatrix,
  constructMatrixFromTemplate,
  getCrossDirections,
  getLocation,
  getNeighbors,
} from "functional-game-utils";
import { remove, omit } from "ramda";
import { pickRandomFromArray } from "../utils/random";

// use mobx-state-tree to store game state

const items = {
  BOTTLE: {
    sprite: { row: 0, col: 0 },
  },
  FLOWER_TULIP: {
    sprite: { row: 0, col: 1 },
  },
  SKULL: {
    sprite: { row: 0, col: 2 },
  },
  SKULL_POWER: {
    sprite: { row: 0, col: 3 },
  },
  MUSHROOM_RED: {
    sprite: { row: 0, col: 4 },
  },
  MUSHROOM_GREEN: {
    sprite: { row: 0, col: 5 },
  },
  ACORN: {
    sprite: { row: 0, col: 6 },
  },
  EYE: {
    sprite: { row: 0, col: 7 },
  },
  AMETHYST: {
    sprite: { row: 0, col: 8 },
  },
  EGG_BLUE: {
    sprite: { row: 0, col: 9 },
  },
  LEAF_GREEN: {
    sprite: { row: 1, col: 0 },
  },
  FEATHER: {
    sprite: { row: 1, col: 1 },
  },
  SPIDER: {
    sprite: { row: 1, col: 2 },
  },
  WORM: {
    sprite: { row: 1, col: 3 },
  },
  LEAF_MAPLE: {
    sprite: { row: 1, col: 4 },
  },
  FLOWER_SUNFLOWER: {
    sprite: { row: 1, col: 5 },
  },
  BUTTERFLY: {
    sprite: { row: 1, col: 6 },
  },
  FLY: {
    sprite: { row: 1, col: 7 },
  },
  EGG_GREEN: {
    sprite: { row: 1, col: 8 },
  },
  EGG_RED: {
    sprite: { row: 1, col: 9 },
  },
  FAIRY: {
    sprite: { row: 2, col: 7 },
  },
};

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

const App = () => {
  const [tiles, setTiles] = useState([[""]]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const initialTiles = constructMatrix(
      () => {
        const itemKeys = Object.keys(omit(["BOTTLE"], items));

        return pickRandomFromArray(itemKeys);
      },
      {
        height: 10,
        width: 10,
      }
    );

    setTiles(initialTiles);
  }, [setTiles]);

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
          items={items}
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
