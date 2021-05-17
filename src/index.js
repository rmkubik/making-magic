import ReactDOM from "react-dom";
import React from "react";
import Grid from "./components/Grid";
import { constructMatrixFromTemplate } from "functional-game-utils";
import SpriteSheet from "./components/SpriteSheet";
import sprites from "../assets/sprites.png";

const tiles = constructMatrixFromTemplate(
  (char) => char,
  `
. . .
. . .
. . .
`
);

// create a Tile
// create a Spritesheet
// create some art assets
// - vial
// - water?
// - a few magical potion bits
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

ReactDOM.render(
  <Grid
    tiles={tiles}
    renderTile={(tile, location) => (
      <div key={JSON.stringify(location)}>
        {createSprite({ row: 0, col: 0 })}
      </div>
    )}
    cellSize={`${spriteConfig.size * spriteConfig.scale}px`}
  />,
  document.getElementById("root")
);
