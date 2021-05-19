import ReactDOM from "react-dom";
import React from "react";
import { constructMatrixFromTemplate } from "functional-game-utils";
import App from "./components/App";
import "./styles.scss";

const initialTiles = constructMatrixFromTemplate(
  (char) => char,
  `
  . . . . . .
  . b . . . .
  . . . . . .
  . . . . . .
  . . . . . .
  . . . . . .
`
);

ReactDOM.render(
  <App initialTiles={initialTiles} />,
  document.getElementById("root")
);
