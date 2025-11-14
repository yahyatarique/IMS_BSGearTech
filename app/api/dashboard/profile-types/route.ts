import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Profiles } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';
import { DashboardProfileTypesQuerySchema } from '@/schemas/dashboard.schema';

const TYPE_LABELS: Record<string, string> = {
  '0': 'Pinion',
  '1': 'Gear',

};

const MATERIAL_LABELS: Record<string, string> = {
  'CR-5': 'CR-5',
  'EN-9': 'EN-9',
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

function formatSpecification(outerDiameter: number, thickness: number): string {
  const formattedWidth = dimensionFormatter.format(outerDiameter);
  const formattedHeight = dimensionFormatter.format(thickness);
  return `${formattedWidth}mm × ${formattedHeight}mm`;
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
      const plainProfile = profile.get({ plain: true })

      const width = toFixedNumber(plainProfile.outer_diameter_mm);
      const height = toFixedNumber(plainProfile.thickness_mm);
      const materialRate = toFixedNumber(plainProfile.material_rate);
      const heatTreatmentRate = toFixedNumber(plainProfile.heat_treatment_rate);
      const heatTreatmentInefficacyPercent = toFixedNumber(
        plainProfile.heat_treatment_inefficacy_percent,
      );

      return {
        id: plainProfile.id,
        name: plainProfile.name,
        specification: formatSpecification(width, height),
        material: formatLabel(plainProfile.material, MATERIAL_LABELS, 'Unknown'),
        type: formatLabel(plainProfile.type, TYPE_LABELS, 'Custom'),
        materialRate,
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
