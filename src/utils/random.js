function randIntBetween(low, high) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function pickRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export { pickRandomFromArray, randIntBetween };
