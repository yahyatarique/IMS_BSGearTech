import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/connection';
import Inventory from '@/db/models/Inventory';
import { CreateInventorySchema, InventoryListQuerySchema } from '@/schemas/inventory.schema';
import { successResponse, errorResponse, sendResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';
import { Op, QueryTypes } from 'sequelize';
import { Profiles, OrderInventory, Orders } from '@/db/models';

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
    const result = (await sequelize.query(
      `
      SELECT COALESCE(SUM(oi.material_weight), 0) as total_weight
      FROM order_inventory oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE oi.material_type = :materialType 
      AND o.status IN ('0', '1')
    `,
      {
        replacements: { materialType },
        type: QueryTypes.SELECT
      }
    )) as { total_weight: string }[];

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

// GET /api/inventory - List inventory with meta (pagination) and filters, or get materials summary
export async function GET(request: NextRequest) {
  try {
    await testConnection();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Default behavior: List inventory with pagination
    // Validate query params
    const validatedQuery = InventoryListQuerySchema.parse(queryParams);
    const { page, limit, material_type, search } = validatedQuery;

    // First, get material summaries for all material types
    const materialTypesRaw = await Inventory.findAll({
      attributes: [
        'material_type',
        [sequelize.fn('SUM', sequelize.col('material_weight')), 'totalWeight']
      ],
      group: ['material_type'],
      raw: true
    });

    const materialTypes = materialTypesRaw as unknown as Array<{
      material_type: string;
      totalWeight: string;
    }>;

    // Create a map of material info
    const materialInfoMap = new Map<string, any>();
    
    await Promise.all(
      materialTypes.map(async (material) => {
        const materialType = material.material_type;
        const inStock = toFixedNumber(material.totalWeight);
        const pendingWeight = await calculatePendingWeight(materialType);

        // Get profile count for this material type
        const profileCountResult = await Profiles.count({
          where: { material: materialType }
        });

        const status = resolveMaterialStatus(inStock);

        materialInfoMap.set(materialType, {
          name: formatMaterialName(materialType),
          material: materialType,
          type: 'Raw Material',
          stock: inStock,
          pendingDelivery: toFixedNumber(pendingWeight),
          unit: DEFAULT_UNIT,
          status,
          profileCount: profileCountResult || 0
        });
      })
    );

    // Build where clause
    const whereClause: any = {};

    if (material_type && material_type !== 'all') {
      whereClause.material_type = material_type;
    }

    if (search) {
      whereClause[Op.or] = [{ po_number: { [Op.iLike]: `%${search}%` } }];
    }

    // Fetch inventory with meta pagination
    const offset = (page - 1) * limit;
    const { rows: inventory, count: total } = await Inventory.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    const totalPages = Math.ceil(total / limit);

    // Add material info to each inventory item
    const inventoryWithMaterialInfo = inventory.map((item) => {
      const itemJson = item.toJSON();
      const materialInfo = materialInfoMap.get(itemJson.material_type);
      
      return {
        ...itemJson,
        materialInfo: materialInfo || null
      };
    });

    return NextResponse.json(
      successResponse({
        inventory: inventoryWithMaterialInfo,
        meta: {
          page,
          pageSize: limit,
          totalItems: total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      })
    );
  } catch (error: any) {
    console.error('Error fetching inventory:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('Validation failed', 400, error.errors), {
        status: 400
      });
    }

    return NextResponse.json(errorResponse(error.message || 'Failed to fetch inventory'), {
      status: 500
    });
  }
}

// POST /api/inventory - Create new inventory item
export async function POST(request: NextRequest) {
  const transaction = await sequelize.transaction();

  try {
    await testConnection();

    const body = await request.json();

    // Validate request body
    const validatedData = CreateInventorySchema.parse(body);

    // Create inventory item
    const inventoryItem = await Inventory.create(
      {
        ...validatedData,
        po_number: validatedData.po_number || null
      } as any,
      { transaction }
    );

    await transaction.commit();

    return sendResponse(inventoryItem.toJSON(), 'Inventory item created successfully', 201);
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error creating inventory item:', error);

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, error.errors);
    }

    return errorResponse(error.message || 'Failed to create inventory item', 500);
  }
}
