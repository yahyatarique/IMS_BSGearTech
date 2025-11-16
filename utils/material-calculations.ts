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
  const weightKg = ((outerDiameterMm * outerDiameterMm * lengthMm) / 162.02) / 1000;

  // Round to 3 decimal places
  return weightKg;
}

/**
 * Calculates the weight of a profile material in kg given its outer diameter in mm and thickness in mm.
 * The weight is calculated using the formula: (outerDiameterMm * outerDiameterMm * thicknessMm) / 162.28
 * and then rounded to 3 decimal places.
 * @param {number} outerDiameterMm - The outer diameter of the profile material in mm.
 * @param {number} thicknessMm - The thickness of the profile material in mm.
 * @returns {number} The weight of the profile material in kg, rounded to 3 decimal places.
 */
export function calculateProfileWeight(outerDiameterMm: number, thicknessMm: number): number {
  // Calculate weight in kg using the formula
  const weightKg = (outerDiameterMm * outerDiameterMm * thicknessMm) / 162.28;

  // Round to 3 decimal places
  return weightKg;
}
