export const MATERIAL_DENSITIES = {
  'CR-5': 7.85, // Density in g/cm³ for CR-5 steel
  'EN-9': 7.85, // Density in g/cm³ for EN-9 steel
} as const;

// Calculate weight for cylindrical shape
export function calculateCylindricalWeight(
  materialType: keyof typeof MATERIAL_DENSITIES,
  outerDiameterMm: number,
  lengthMm: number
): number {
  const density = MATERIAL_DENSITIES[materialType]; // g/cm³
  
  // Convert dimensions from mm to cm
  const radius = (outerDiameterMm / 2) / 10;
  const length = lengthMm / 10;
  
  // Calculate volume (π * r² * h) in cm³
  const volume = Math.PI * Math.pow(radius, 2) * length;
  
  // Calculate weight (volume * density) in grams, then convert to kg
  const weightKg = (volume * density) / 1000;
  
  // Round to 3 decimal places
  return Math.round(weightKg * 1000) / 1000;
}