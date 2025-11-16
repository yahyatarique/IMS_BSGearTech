import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Profiles, Inventory } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';
import { DashboardMaterialsQuerySchema } from '@/schemas/dashboard.schema';

function formatMaterialName(value: string | null): string {
  if (!value) {
    return 'Unknown Material';
  }

  const normalized = value.replace(/_/g, ' ').trim();

  if (/^[A-Z0-9-]+$/.test(value)) {
    return normalized.toUpperCase();
  }

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export async function GET(request: NextRequest) {
  try {
    await testConnection();

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = DashboardMaterialsQuerySchema.safeParse(rawQuery);

    if (!parsedQuery.success) {
      return errorResponse('Invalid query parameters', 400, parsedQuery.error.flatten());
    }

    const limit = parsedQuery.data.limit ?? 5;

    // Get distinct materials grouped by type, dimensions, rate, and weight
    const materialsRaw = await Inventory.findAll({
      attributes: ['id', 'material_type', 'outer_diameter', 'length', 'rate', 'material_weight'],
      group: ['id', 'material_type', 'outer_diameter', 'length', 'rate', 'material_weight'],
      order: [['material_type', 'ASC']],
      limit,
      raw: true
    });

    const materials = materialsRaw as unknown as Array<{
      id: string;
      material_type: string;
      outer_diameter: string;
      length: string;
      rate: string;
      material_weight: string;
    }>;

    const formattedMaterials = await Promise.all(
      materials.map(async (material) => {
        const materialType = material.material_type;
        const dimensions = `${Number(material.outer_diameter).toFixed(2)}mm × ${Number(
          material.length
        ).toFixed(2)}mm`;

        // Get profile count for this specific inventory item
        const profileCount = await Profiles.count({
          where: { inventory_id: material.id }
        });

        return {
          id: material.id,
          name: formatMaterialName(materialType),
          material: materialType,
          type: 'Raw Material',
          dimensions,
          rate: Number(material.rate),
          weight: Number(material.material_weight),
          unit: 'kg',
          status: 'in-stock' as const,
          profileCount
        };
      })
    );

    return sendResponse(formattedMaterials, 'Materials retrieved successfully');
  } catch (error) {
    console.error('Dashboard materials error:', error);
    return errorResponse('Failed to retrieve materials', 500);
  }
}
