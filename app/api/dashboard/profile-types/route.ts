import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Profiles } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';
import { DashboardProfileTypesQuerySchema } from '@/schemas/dashboard.schema';

const TYPE_LABELS: Record<string, string> = {
  '0': 'Gear',
  '1': 'Pinion',
};

const MATERIAL_LABELS: Record<string, string> = {
  'CR-5': 'CR-5',
  'EN-9': 'EN-9',
};


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

      const noOfTeeth = toFixedNumber(plainProfile.no_of_teeth, 0);
      // const face = toFixedNumber(plainProfile.face);
      // const module = toFixedNumber(plainProfile.module);
      const rate = toFixedNumber(plainProfile.rate);
      const htRate = toFixedNumber(plainProfile.ht_rate);
      const total = toFixedNumber(plainProfile.total);

      return {
        id: plainProfile.id,
        name: plainProfile.name,
        specification: plainProfile.finish_size || `${noOfTeeth}T`,
        material: formatLabel(plainProfile.material, MATERIAL_LABELS, 'Unknown'),
        type: formatLabel(plainProfile.type, TYPE_LABELS, 'Custom'),
        materialRate: rate,
        heatTreatmentRate: htRate,
        total,
      };
    });

    return sendResponse(formattedProfiles, 'Profile types retrieved successfully');
  } catch (error) {
    console.error('Dashboard profile types error:', error);
    return errorResponse('Failed to retrieve profile types', 500);
  }
}
