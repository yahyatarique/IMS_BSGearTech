import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Profiles } from '@/db/models';
import sequelize from '@/db/connection';
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

function calculateStock(totalArea: number, averageRate: number, profileCount: number): number {
  const stockFromArea = totalArea > 0 ? totalArea / 10 : 0;
  const stockFromRate = averageRate > 0 ? averageRate * profileCount : 0;
  const stock = Math.max(stockFromArea, stockFromRate);
  return Math.max(Math.round(stock), 0);
}

function calculateReorderLevel(stock: number): number {
  if (stock <= 0) {
    return 25;
  }

  const baseline = Math.max(Math.round(stock * 0.3), 25);
  const cap = Math.max(stock - Math.max(Math.round(stock * 0.2), 1), 1);

  return Math.min(baseline, cap);
}

function resolveMaterialStatus(stock: number, reorderLevel: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (stock <= 0) {
    return 'out-of-stock';
  }

  if (stock <= reorderLevel) {
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

    const materialsRaw = await Profiles.findAll({
      attributes: [
        'material',
        [sequelize.fn('COUNT', sequelize.col('id')), 'profileCount'],
        [sequelize.fn('AVG', sequelize.col('material_rate')), 'averageRate'],
        [sequelize.fn('MIN', sequelize.col('material_rate')), 'minRate'],
        [sequelize.fn('MAX', sequelize.col('material_rate')), 'maxRate'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('"cut_size_width_mm" * "cut_size_height_mm"')
          ),
          'totalArea',
        ],
      ],
      group: ['material'],
      order: [[sequelize.fn('AVG', sequelize.col('material_rate')), 'DESC']],
      limit,
      raw: true,
    });

    const materials = materialsRaw as Array<Record<string, any>>;

    const formattedMaterials = materials.map((material, index) => {
      const materialCode = typeof material.material === 'string' ? material.material : String(material.material ?? '');
  const profileCount = Number(material.profileCount) || 0;
  const rawAverageRate = Number(material.averageRate) || 0;
  const averageRate = toFixedNumber(rawAverageRate);
  const minRate = toFixedNumber(material.minRate);
  const maxRate = toFixedNumber(material.maxRate);
      const totalArea = Number(material.totalArea) || 0;

  const stock = calculateStock(totalArea, rawAverageRate, profileCount);
      const reorderLevel = calculateReorderLevel(stock);
      const status = resolveMaterialStatus(stock, reorderLevel);

      return {
        id: materialCode || `material-${index + 1}`,
        name: formatMaterialName(materialCode),
        material: materialCode,
        type: 'Raw Material',
        stock,
        unit: DEFAULT_UNIT,
        reorderLevel,
        status,
        profileCount,
        averageRate,
        minRate,
        maxRate,
      };
    });

    return sendResponse(formattedMaterials, 'Materials retrieved successfully');
  } catch (error) {
    console.error('Dashboard materials error:', error);
    return errorResponse('Failed to retrieve materials', 500);
  }
}
