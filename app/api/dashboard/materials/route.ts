import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Profiles, Inventory, OrderInventory, Orders } from '@/db/models';
import sequelize from '@/db/connection';
import { QueryTypes } from 'sequelize';
import { errorResponse, sendResponse } from '@/utils/api-response';
import { DashboardMaterialsQuerySchema } from '@/schemas/dashboard.schema';

const DEFAULT_UNIT = 'kg';

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

function toFixedNumber(value: unknown, fractionDigits = 2): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Number(parsed.toFixed(fractionDigits));
}

async function calculatePendingWeight(materialType: string): Promise<number> {
  try {
    // Get weight from OrderInventory for orders that are pending ('0') or accepted ('1')
    const result = await sequelize.query(`
      SELECT COALESCE(SUM(oi.material_weight), 0) as total_weight
      FROM order_inventory oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE oi.material_type = :materialType 
      AND o.status IN ('0', '1')
    `, {
      replacements: { materialType },
      type: QueryTypes.SELECT
    }) as { total_weight: string }[];
    
    return Number(result[0]?.total_weight) || 0;
  } catch (error) {
    console.error(`Error calculating pending weight for ${materialType}:`, error);
    return 0;
  }
}

function resolveMaterialStatus(stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (stock <= 0) {
    return 'out-of-stock';
  }

  // Simple low stock threshold of 50kg
  if (stock <= 50) {
    return 'low-stock';
  }

  return 'in-stock';
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

    // Get distinct material types from inventory
    const materialTypesRaw = await Inventory.findAll({
      attributes: [
        'material_type',
        [sequelize.fn('SUM', sequelize.col('material_weight')), 'totalWeight']
      ],
      group: ['material_type'],
      order: [[sequelize.fn('SUM', sequelize.col('material_weight')), 'DESC']],
      limit,
      raw: true,
    });

    const materialTypes = materialTypesRaw as unknown as Array<{
      material_type: string;
      totalWeight: string;
    }>;

    const formattedMaterials = await Promise.all(
      materialTypes.map(async (material, index) => {
        const materialType = material.material_type;
        const inStock = toFixedNumber(material.totalWeight);
        const pendingWeight = await calculatePendingWeight(materialType);
        
        // Get profile count for this material type
        const profileCountResult = await Profiles.count({
          where: { material: materialType }
        });
        
        const status = resolveMaterialStatus(inStock);

        return {
          id: materialType || `material-${index + 1}`,
          name: formatMaterialName(materialType),
          material: materialType,
          type: 'Raw Material',
          stock: inStock,
          pendingDelivery: toFixedNumber(pendingWeight),
          unit: DEFAULT_UNIT,
          status,
          profileCount: profileCountResult || 0,
        };
      })
    );

    return sendResponse(formattedMaterials, 'Materials retrieved successfully');
  } catch (error) {
    console.error('Dashboard materials error:', error);
    return errorResponse('Failed to retrieve materials', 500);
  }
}
