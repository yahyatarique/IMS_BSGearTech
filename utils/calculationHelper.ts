import { Process } from "../schemas/profile.schema";

/**
 * Calculate material cost
 * Formula: weight × material_rate
 * @param weight - Weight in kg
 * @param materialRate - Material rate per kg in INR
 * @returns Material cost in INR
 */
export const calculateMaterialCost = (weight: number, materialRate: number): number => {
  return weight * materialRate;
};

/**
 * Calculate teeth cutting and grinding cost
 * Formula: teeth_count × module × face × rate
 * @param teethCount - Number of teeth
 * @param module - Module value
 * @param face - Face value
 * @param rate - Rate per unit (default: 100)
 * @returns Teeth cost in INR
 */
export const calculateTeethCost = (
  teethCount: number,
  module: number,
  face: number,
  rate?: number
): number => {
  if (!rate) {
    return teethCount * module * face;
  }
  return teethCount * module * face * rate;
};

/**
 * Calculate heat treatment cost
 * Formula: weight × 0.75 × ht_rate (0.75 accounts for 25% inefficacy)
 * @param weight - Weight in kg
 * @param htRate - Heat treatment rate per kg in INR
 * @returns Heat treatment cost in INR
 */
export const calculateHTCost = (weight: number, htRate: number): number => {
  return weight * 0.75 * htRate; // 75% of weight (100% - 25% inefficacy)
};

/**
 * Calculate total order value before profit margin
 * Formula: materialCost + turningRate + teethCost + htCost + sum(process rates)
 * @param materialCost - Material cost in INR
 * @param turningRate - Turning rate in INR
 * @param teethCost - Teeth cutting and grinding cost in INR
 * @param htCost - Heat treatment cost in INR
 * @param processes - Array of process objects with rate property
 * @returns Total order value in INR
 */
export const calculateProfileTotal = (
  materialCost: number,
  teethCost: number | undefined,
  htCost: number,
  cyn_grinding: number,
  processes: Process[] | undefined
): number => {
  return (
    materialCost +
    (teethCost || 0) +
    htCost +
    cyn_grinding +
    (processes ? processes.reduce((sum, process) => sum + (process.cost || 0), 0) : 0)
  );
};

/**
 * Calculate grand total with profit margin
 * Formula: totalOrderValue × (1 + (profitMargin / 100))
 * @param totalOrderValue - Total order value in INR
 * @param profitMargin - Profit margin percentage
 * @returns Grand total in INR
 */
export const calculateGrandTotal = (totalOrderValue: number, profitMargin: number): number => {
  return totalOrderValue * (profitMargin / 100);
};


/**
 * Calculate burning weight (5% of total weight)
 * Formula: weight × 0.05
 * @param weight - Total weight in kg
 * - For Pinion burning weight is considered as 0% of total weight
 * - For Gear burning weight is considered as 5% of total weight
 * @returns Burning weight in kg
 */
export const calculateBurningWeight = (weight: number): number => {
  return weight * 0.05;
};