export function kgToLbs(kg) {
  return kg * 2.2046226218;
}

export function lbsToKg(lbs) {
  return lbs / 2.2046226218;
}

export function formatWeightKg(kg, units) {
  const v = units === 'lbs' ? kgToLbs(kg) : kg;
  return `${v.toFixed(1)} ${units}`;
}

export function inputWeightToKg(value, units) {
  return units === 'lbs' ? lbsToKg(value) : value;
}

export function weightKgToDisplay(kg, units) {
  return units === 'lbs' ? kgToLbs(kg) : kg;
}
