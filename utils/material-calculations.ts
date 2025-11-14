
/**
 * Calculates the weight of a cylindrical material in kg given its outer diameter in mm and length in mm.
 * The weight is calculated using the formula: (outerDiameterMm * outerDiameterMm * lengthMm) / (162.02 * 1000)
 * and then rounded to 3 decimal places.
 * @param {number} outerDiameterMm - The outer diameter of the cylindrical material in mm.
 * @param {number} lengthMm - The length of the cylindrical material in mm.
 * @returns {number} The weight of the cylindrical material in kg, rounded to 3 decimal places.
 */
export function calculateCylindricalWeight(outerDiameterMm: number, lengthMm: number): number {
  // Calculate weight in kg using the formula
  const weightKg = (outerDiameterMm * outerDiameterMm * lengthMm) / (162.02 * 1000);

  // Round to 3 decimal places
  return Math.round(weightKg * 1000) / 1000;
}
