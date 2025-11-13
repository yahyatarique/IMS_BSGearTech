/**
 * Order Calculation Helper Functions
 * Contains all calculation logic for order creation and management
 */

import { CALCULATE_WEIGHT_CONST } from './constants';

/**
 * Calculate weight based on finish size dimensions
 * Formula: (width² × height) / CALCULATE_WEIGHT_CONST / 1000000 (convert mm³ to kg)
 * @param width - Width in mm
 * @param height - Height in mm
 * @returns Weight in kg
 */
export const calculateWeight = (width: number, height: number): number => {
  return (Math.pow(width, 2) * height) / CALCULATE_WEIGHT_CONST / 1000000;
};

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
export const calculateTotalOrderValue = (
  materialCost: number,
  turningRate: number,
  teethCost: number,
  htCost: number,
  processes: Array<{ rate?: number }>
): number => {
  return (
    materialCost +
    turningRate +
    teethCost +
    htCost +
    processes.reduce((sum, process) => sum + (process.rate || 0), 0)
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
