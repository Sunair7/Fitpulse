/** Atwater-style: protein & carbs 4 kcal/g, fat 9 kcal/g */
export function caloriesFromMacros(protein, carbs, fats) {
  const p = Number(protein) || 0;
  const c = Number(carbs) || 0;
  const f = Number(fats) || 0;
  return Math.round(p * 4 + c * 4 + f * 9);
}
