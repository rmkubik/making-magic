import ReactDOM from "react-dom";
import React from "react";
import { constructMatrixFromTemplate } from "functional-game-utils";
import App from "./components/App";
import "./styles.scss";

const initialTiles = constructMatrixFromTemplate(
  (char) => char,
  `
  t h 8 3 a f
  w e e a e f
  b t s l s L
  t h b a l E
  8 A S h 4 w
  F f l m M l
`
);

ReactDOM.render(
  <App initialTiles={initialTiles} />,
  document.getElementById("root")
);
