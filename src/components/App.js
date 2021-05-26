import React, { Fragment, useEffect, useState } from "react";
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

const areAllItemsEqual = (items) => {
  return items.every((item) => item === items[0]);
};

const App = () => {
  const [tiles, setTiles] = useState([[""]]);
  const [selected, setSelected] = useState([]);
  const [isMouseDown, setMouseDown] = useState(false);
  const [mouseDownLocation, setMouseDownLocation] = useState();
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [prevCurrentLevel, setPrevCurrentLevel] = useState();
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
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState([2, 2, 2, 2]);

  useEffect(() => {
    setLevels([
      {
        items: ["ACORN", "LEAF_GREEN", "FEATHER", "MUSHROOM_RED"],
        recipes: [
          {
            ingredients: {
              type: "MATCHING",
              min: 1,
              max: 1,
            },
            effects: [
              {
                type: "DAMAGE_COLUMN",
                value: 1,
              },
            ],
          },
          {
            ingredients: {
              type: "MATCHING",
              min: 2,
              max: 2,
            },
            effects: [],
          },
          {
            ingredients: {
              type: "MATCHING",
              min: 3,
              max: 3,
            },
            effects: [
              {
                type: "SCORE",
              },
            ],
          },
          {
            ingredients: {
              type: "MATCHING",
              item: "ACORN",
              min: 4,
            },
            effects: [
              {
                type: "SCORE",
              },
              {
                type: "BONUS_POINTS",
              },
            ],
          },
          {
            ingredients: {
              type: "MATCHING",
              item: "LEAF_GREEN",
              min: 4,
            },
            effects: [
              {
                type: "SCORE",
              },
              {
                type: "BONUS_POINTS",
              },
            ],
          },
          {
            ingredients: {
              type: "MATCHING",
              item: "FEATHER",
              min: 4,
            },
            effects: [
              {
                type: "SCORE",
              },
              {
                type: "FEATHER_FILL",
              },
            ],
          },
          {
            ingredients: {
              type: "MATCHING",
              item: "MUSHROOM_RED",
              min: 4,
            },
            effects: [
              {
                type: "SCORE",
              },
              {
                type: "SHIELD_COLUMNS",
              },
            ],
          },
        ],
      },
    ]);
  }, [setLevels]);

  useEffect(() => {
    if (!levels[currentLevel]) {
      return;
    }

    if (currentLevel === prevCurrentLevel) {
      return;
    }

    const initialTiles = constructMatrix(
      () => pickRandomFromArray(levels[currentLevel].items),
      {
        height: 6,
        width: 4,
      }
    );

    setPrevCurrentLevel(currentLevel);
    setTiles(initialTiles);
  }, [setTiles, levels, currentLevel]);

  const addSelection = (location) => {
    if (
      !selected.some((selectedLocation) =>
        compareLocations(selectedLocation, location)
      )
    ) {
      setSelected([...selected, location]);
    }
  };

  const removeSelection = (location) => {
    const removedSelectionIndex = selected.findIndex((selectedLocation) =>
      compareLocations(selectedLocation, location)
    );

    const newSelected = remove(removedSelectionIndex, 1, selected);

    setSelected(newSelected);
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
        return pickRandomFromArray([...levels[currentLevel].items, "SKULL"]);
      }

      if (isLocationInBounds(tiles, lowerLocation)) {
        const lowerTile = getLocation(tiles, lowerLocation);

        // Lower tile is empty, drop down
        if (lowerTile === "") {
          return "";
        }
      } else {
        // this means we're at the bottom of the grid
        if (tile === "SKULL") {
          // damage the heart below you
          setHearts(update(location.col, hearts[location.col] - 1), hearts);

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

  const selectedIngredients = selected.map(getLocation(tiles));

  let selectedRecipe;
  const selectedRecipeEntry = Object.entries(recipes).find(
    ([recipeKey, recipe]) => {
      return compareArraysIgnoringOrder(
        selectedIngredients,
        recipe.ingredients
      );
    }
  );

  if (selectedRecipeEntry) {
    [selectedRecipe] = selectedRecipeEntry;
  }

  // TODO: Look for wildcard recipes
  // 1 of a kind, remove it, damage a heart in that column, no points
  // 2 of a kind, remove them, no points
  // 3 of a kind, remove them, points
  // 4+ of a kind, remove them, points, cast a spell

  const castSelectedSpell = () => {
    console.log(selected.map(getLocation(tiles)));

    if (selectedRecipe) {
      const recipe = recipes[selectedRecipe];

      console.log(`You cast the "${selectedRecipe}" spell.`);

      const newTiles = mapMatrix((tile, location) => {
        if (isLocationSelected({ location, selected })) {
          return "";
        }

        return tile;
      });

      // lose a half heart with a single match
      // get zero points with a 2 match
      // get normal pts with 3 length and up
      setScore(score + recipe.ingredients.length * 10);
      setTiles(newTiles);
      setSelected([]);
    }
  };

  return (
    <div className="container" onMouseUp={() => setSelected([])}>
      <div className="score-bar">
        <p>{String(score).padStart(4, "0")}</p>
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
            onMouseDown={(e) => {
              setMouseDown(true);
              setMouseDownLocation(location);

              if (
                // isMouseDownLocationSame &&
                isLocationSelected({ location, selected })
              ) {
                // If we mouse up on the same location we mouse downed on
                // and that location was selected, clear all selection.
                // setSelected([]);

                // If we mouse up on same location we have already selected, case the ability
                // if (isLocationSelected({ location, selected })) {
                castSelectedSpell();
                // }
              } else {
                setSelected([location]);
              }

              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              setMouseDown(false);

              e.stopPropagation();
            }}
            onMouseEnter={() => {
              if (isMouseDown) {
                addSelection(location);
              }
            }}
            highlighted={
              isLocationSelected({ location, selected }) &&
              Boolean(selectedRecipeEntry)
            }
            spriteConfig={spriteConfig}
            key={JSON.stringify(location)}
          />
        )}
        cellSize={`${spriteConfig.size * spriteConfig.scale}px`}
      />
      <div className="health-bar">
        {hearts.map((value, index) => {
          switch (value) {
            case 2:
              return (
                <Fragment key={index}>
                  {createSprite(items.HEART_FULL.sprite)}
                </Fragment>
              );
            case 1:
              return (
                <Fragment key={index}>
                  {createSprite(items.HEART_HALF.sprite)}
                </Fragment>
              );
            case 0:
            default:
              return (
                <Fragment key={index}>
                  {createSprite(items.HEART_EMPTY.sprite)}
                </Fragment>
              );
          }
        })}
      </div>
      {/* <pre>{JSON.stringify({ isMouseDown })}</pre> */}
    </div>
  );
};

export default App;
