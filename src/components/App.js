import React, { useEffect, useState } from "react";
import Grid from "./Grid";
import Tile from "./Tile";
import SpriteSheet from "./SpriteSheet";
import sprites from "../../assets/sprites.png";
import {
  compareLocations,
  constructArray,
  constructMatrix,
  constructMatrixFromTemplate,
  getCrossDirections,
  getLocation,
  getNeighbors,
  isLocationInBounds,
  mapMatrix,
} from "functional-game-utils";
import { remove, update } from "ramda";
import { pickRandomFromArray, randIntBetween } from "../utils/random";

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

const createBag = (items) => {
  let bag = [...items];

  // This function will return undefined once
  // your bag is empty.
  const pickFromBag = () => {
    const pickedIndex = randIntBetween(0, bag.length - 1);
    const pickedItem = bag[pickedIndex];

    bag = remove(pickedIndex, 1, bag);

    return pickedItem;
  };

  return pickFromBag;
};

const compareArraysIgnoringOrder = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }

  const aCopy = [...a].sort();
  const bCopy = [...b].sort();

  return aCopy.every((aValue, index) => aValue === bCopy[index]);
};

const areTilesSettled = (tiles) => {
  let isAnyTileEmpty = false;

  // misuse mapMatrix as a pseudo "Array.some" style function
  mapMatrix((tile) => {
    if (tile === "") {
      isAnyTileEmpty = true;
    }
  }, tiles);

  return !isAnyTileEmpty;
};

const App = () => {
  const [tiles, setTiles] = useState([[""]]);
  const [selected, setSelected] = useState([]);
  const [isMouseDown, setMouseDown] = useState(false);
  const [mouseDownLocation, setMouseDownLocation] = useState();
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [prevCurrentLevel, setPrevCurrentLevel] = useState();
  const [effects, setEffects] = useState([
    "flammable",
    "possessed", // a spirit posses this item
    "thirst", // needs to hit enemies
    "vampirism",
    "disintegration",
    "corruption",
    "icy",
    "undying",
    "magnetic",
    "stonecutter",
    "trickster",
    "ghastly",
    "elastic",
    "exploding",
    "draconic",
    "binding",
    "forceful",
    "precise",
    "lawful",
    "chaotic",
    "lightbane",
    "darkbane",
    "animated",
    "sentient",
    "sacred",
    "cursed",
  ]);
  const [items, setItems] = useState({
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
    HEART_FULL: {
      sprite: { row: 3, col: 5 },
    },
    HEART_HALF: {
      sprite: { row: 3, col: 6 },
    },
    HEART_EMPTY: {
      sprite: { row: 3, col: 7 },
    },
  });
  const [recipes, setRecipes] = useState({
    fireball: {
      ingredients: ["LEAF_GREEN", "LEAF_GREEN", "MUSHROOM_RED"],
      reveals: ["flammable"],
    },
    featherfall: {
      ingredients: ["FEATHER", "FEATHER", "FEATHER", "FEATHER"],
      reveals: ["flight"],
    },
    feed: {
      ingredients: ["MUSHROOM_RED"],
      reveals: ["hunger"],
    },
    growth: {
      ingredients: ["ACORN", "ACORN"],
      reveals: ["natural"],
    },
  });

  useEffect(() => {
    const pickEffectFromBag = createBag([
      "flammable",
      "flight",
      "hunger",
      "natural",
    ]);

    setLevels([
      {
        items: ["ACORN", "LEAF_GREEN", "FEATHER", "MUSHROOM_RED"],
        identificationTarget: {
          effects: constructArray(() => {
            return { type: pickEffectFromBag(), revealed: false };
          }, 3),
        },
      },
    ]);
  }, [setLevels, effects]);

  useEffect(() => {
    if (!levels[currentLevel]) {
      return;
    }

    if (currentLevel === prevCurrentLevel) {
      return;
    }

    const initialTiles = constructMatrix(
      () => {
        // const itemKeys = Object.keys(omit(["BOTTLE"], items));

        return pickRandomFromArray(levels[currentLevel].items);
      },
      {
        height: 6,
        width: 4,
      }
    );

    setPrevCurrentLevel(currentLevel);
    setTiles(initialTiles);
  }, [setTiles, levels, currentLevel]);

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

  const revealEffect = (targetType) => {
    const currentlySelectedLevel = levels[currentLevel];

    const revealedEffectIndex =
      currentlySelectedLevel.identificationTarget.effects.findIndex(
        (effect) => effect.type === targetType
      );

    if (revealedEffectIndex < 0) {
      return;
    }

    const newEffects = update(
      revealedEffectIndex,
      {
        ...currentlySelectedLevel.identificationTarget.effects[
          revealedEffectIndex
        ],
        revealed: true,
      },
      currentlySelectedLevel.identificationTarget.effects
    );

    const newLevels = update(currentLevel, {
      ...currentlySelectedLevel,
      identificationTarget: {
        ...currentlySelectedLevel.identificationTarget,
        effects: newEffects,
      },
      levels,
    });

    setLevels(newLevels);
  };

  const applyGravity = () => {
    const newTiles = mapMatrix((tile, location) => {
      const lowerLocation = {
        row: location.row + 1,
        col: location.col,
      };
      const upperLocation = {
        row: location.row - 1,
        col: location.col,
      };

      // This tile is empty, drop one above down
      if (tile === "") {
        if (isLocationInBounds(tiles, upperLocation)) {
          const upperTile = getLocation(tiles, upperLocation);

          return upperTile;
        }

        // if no upper tile, spawn a new one
        return "SKULL";
      }

      if (isLocationInBounds(tiles, lowerLocation)) {
        const lowerTile = getLocation(tiles, lowerLocation);

        // Lower tile is empty, drop down
        if (lowerTile === "") {
          return "";
        }
      }

      // gravity doesn't affect us
      return tile;
    }, tiles);

    setTiles(newTiles);
  };

  const startGravityTimeout = () => {
    const applyGravityTimeout = () => {
      if (areTilesSettled(tiles)) {
        return;
      }

      applyGravity();

      setTimeout(applyGravityTimeout, 500);
    };

    applyGravityTimeout();
  };

  useEffect(() => {
    if (!levels[currentLevel]) {
      return;
    }

    if (areTilesSettled(tiles)) {
      return;
    }

    setTimeout(() => applyGravity(), 100);
    // startGravityTimeout();
  }, [tiles]);

  if (!levels[currentLevel]) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <div className="score-bar">
        <p>0000</p>
        <p>0300</p>
      </div>
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
            onMouseDown={() => {
              setMouseDown(true);
              setMouseDownLocation(location);

              if (
                // isMouseDownLocationSame &&
                isLocationSelected({ location, selected })
              ) {
                // If we mouse up on the same location we mouse downed on
                // and that location was selected, clear all selection.
                setSelected([]);
              } else {
                setSelected([location]);
              }
            }}
            onMouseUp={() => {
              setMouseDown(false);
            }}
            onMouseEnter={() => {
              if (isMouseDown) {
                addSelection(location);
              }
            }}
            key={JSON.stringify(location)}
          />
        )}
        cellSize={`${spriteConfig.size * spriteConfig.scale}px`}
      />
      <div className="health-bar">
        <div>{createSprite(items.HEART_FULL.sprite)}</div>
        <div>{createSprite(items.HEART_FULL.sprite)}</div>
        <div>{createSprite(items.HEART_FULL.sprite)}</div>
        <div>{createSprite(items.HEART_FULL.sprite)}</div>
      </div>
      <div
        onClick={() => {
          console.log(selected.map(getLocation(tiles)));
          const selectedIngredients = selected.map(getLocation(tiles));

          Object.entries(recipes).some(([recipeKey, recipe]) => {
            if (
              compareArraysIgnoringOrder(
                selectedIngredients,
                recipe.ingredients
              )
            ) {
              console.log(`You cast the "${recipeKey}" spell.`);

              const newTiles = mapMatrix((tile, location) => {
                if (isLocationSelected({ location, selected })) {
                  return "";
                }

                return tile;
              });

              setTiles(newTiles);
              setSelected([]);
              revealEffect(recipe.reveals[0]);
            }
          });
        }}
      >
        {createSprite(items.BOTTLE.sprite)}
      </div>
      {/* <ul>
        {levels[currentLevel].identificationTarget.effects.map((effect) => (
          <li key={effect.type}>{effect.revealed ? effect.type : "???"}</li>
        ))}
      </ul> */}
      {/* <pre>{JSON.stringify({ isMouseDown })}</pre> */}
    </div>
  );
};

export default App;
