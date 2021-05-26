import React from "react";

const Heart = ({ value, createSprite, items }) => {
  switch (value) {
    case 2:
      return createSprite(items.HEART_FULL.sprite);
    case 1:
      return createSprite(items.HEART_HALF.sprite);
    case 0:
    default:
      return createSprite(items.HEART_EMPTY.sprite);
  }
};

export default Heart;
