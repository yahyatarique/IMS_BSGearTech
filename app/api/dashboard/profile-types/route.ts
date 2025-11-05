import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Profiles } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';
import { DashboardProfileTypesQuerySchema } from '@/schemas/dashboard.schema';

const TYPE_LABELS: Record<string, string> = {
  '0': 'Pinion',
  '1': 'Gear',
  gear: 'Gear',
  pinion: 'Pinion',
  shaft: 'Shaft',
  other: 'Other',
};

const MATERIAL_LABELS: Record<string, string> = {
  'CR-5': 'CR-5',
  'EN-9': 'EN-9',
  steel: 'Steel',
  aluminum: 'Aluminum',
  brass: 'Brass',
  bronze: 'Bronze',
  plastic: 'Plastic',
  other: 'Other',
};

const dimensionFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

function toFixedNumber(value: unknown, fractionDigits = 2): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Number(parsed.toFixed(fractionDigits));
}

function formatLabel(value: string | null, dictionary: Record<string, string>, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const normalized = value.toLowerCase();
  return dictionary[value] ?? dictionary[normalized] ?? fallback;
}

function formatSpecification(width: number, height: number): string {
  const formattedWidth = dimensionFormatter.format(width);
  const formattedHeight = dimensionFormatter.format(height);
  return `${formattedWidth}mm × ${formattedHeight}mm`;
}

function calculateInStock(width: number, height: number, materialRate: number): number {
  const areaUnits = width > 0 && height > 0 ? (width * height) / 5 : 0;
  const rateUnits = materialRate > 0 ? materialRate / 2 : 0;
  const stock = Math.max(areaUnits, rateUnits);
  return Math.max(Math.round(stock), 0);
}

function calculateReserved(stock: number, wastagePercent: number): number {
  if (stock <= 0 || wastagePercent <= 0) {
    return 0;
  }

  const reserved = stock * (wastagePercent / 100);
  return Math.max(Math.round(reserved), 0);
}

export async function GET(request: NextRequest) {
  try {
    await testConnection();

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = DashboardProfileTypesQuerySchema.safeParse(rawQuery);

    if (!parsedQuery.success) {
      return errorResponse('Invalid query parameters', 400, parsedQuery.error.flatten());
    }

    const limit = parsedQuery.data.limit ?? 5;

    const profiles = await Profiles.findAll({
      limit,
      order: [['name', 'ASC']],
    });

    const formattedProfiles = profiles.map((profile) => {
      const plainProfile = profile.get({ plain: true }) as Record<string, any>;

      const width = toFixedNumber(plainProfile.cut_size_width_mm);
      const height = toFixedNumber(plainProfile.cut_size_height_mm);
      const materialRate = toFixedNumber(plainProfile.material_rate);
      const burningWastagePercent = toFixedNumber(plainProfile.burning_wastage_percent);
      const heatTreatmentRate = toFixedNumber(plainProfile.heat_treatment_rate);
      const heatTreatmentInefficacyPercent = toFixedNumber(
        plainProfile.heat_treatment_inefficacy_percent,
      );

      const inStock = calculateInStock(width, height, materialRate);
      const reserved = calculateReserved(inStock, burningWastagePercent);
      const available = Math.max(inStock - reserved, 0);

      return {
        id: plainProfile.id,
        name: plainProfile.name,
        specification: formatSpecification(width, height),
        material: formatLabel(plainProfile.material, MATERIAL_LABELS, 'Unknown'),
        type: formatLabel(plainProfile.type, TYPE_LABELS, 'Custom'),
        materialRate,
        inStock,
        reserved,
        available,
        burningWastagePercent,
        heatTreatmentRate,
        heatTreatmentInefficacyPercent,
      };
    });

    return sendResponse(formattedProfiles, 'Profile types retrieved successfully');
  } catch (error) {
    console.error('Dashboard profile types error:', error);
    return errorResponse('Failed to retrieve profile types', 500);
  }
}
