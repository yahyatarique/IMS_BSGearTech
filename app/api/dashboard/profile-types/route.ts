import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Profiles, Inventory } from '@/db/models';
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
      include: [{
        model: Inventory,
        as: 'inventory',
        attributes: ['material_type', 'outer_diameter', 'length']
      }]
    });

    const formattedProfiles = profiles.map((profile) => {
      const plainProfile = profile.get({ plain: true }) as any;

      const total = toFixedNumber(plainProfile.total);
      const inventory = plainProfile.inventory;

      return {
        id: plainProfile.id,
        name: plainProfile.name,
        specification: plainProfile.finish_size || 'N/A',
        material: formatLabel(plainProfile.material, MATERIAL_LABELS, 'Unknown'),
        type: formatLabel(plainProfile.type, TYPE_LABELS, 'Custom'),
        materialType: inventory?.material_type || 'N/A',
        materialDimensions: inventory ? `${toFixedNumber(inventory.outer_diameter)}mm × ${toFixedNumber(inventory.length)}mm` : 'N/A',
        total,
      };
    });

    return sendResponse(formattedProfiles, 'Profile types retrieved successfully');
  } catch (error) {
    console.error('Dashboard profile types error:', error);
    return errorResponse('Failed to retrieve profile types', 500);
  }
}
