import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/connection';
import Inventory from '@/db/models/Inventory';
import { errorResponse, successResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';
import { Op, QueryTypes } from 'sequelize';
import { Orders, OrderInventory } from '@/db/models';

const DEFAULT_UNIT = 'kg';

interface StockSummary {
  material_type: string;
  width: number;
  height: number;
  total_weight: number;
  total_quantity: number;
  pending_weight: number;
  pending_quantity: number;
}

async function calculatePendingStats(
  material_type: string,
  width: number,
  height: number
): Promise<{ pendingWeight: number; pendingQuantity: number }> {
  try {
    const result = await sequelize.query(
      `
      SELECT 
        COALESCE(SUM(oi.material_weight), 0) as pending_weight,
        COALESCE(SUM(oi.quantity), 0) as pending_quantity
      FROM order_inventory oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE oi.material_type = :material_type 
        AND oi.width = :width
        AND oi.height = :height
        AND o.status IN ('0', '1')
      `,
      {
        replacements: { material_type, width, height },
        type: QueryTypes.SELECT
      }
    ) as { pending_weight: string; pending_quantity: string }[];

    return {
      pendingWeight: Number(result[0]?.pending_weight) || 0,
      pendingQuantity: Number(result[0]?.pending_quantity) || 0
    };
  } catch (error) {
    console.error('Error calculating pending stats:', error);
    return { pendingWeight: 0, pendingQuantity: 0 };
  }
}

// GET /api/inventory/stats - Get inventory statistics by material type and dimensions
export async function GET(request: NextRequest) {
  try {
    await testConnection();

    // Get unique combinations of material_type and dimensions with their totals
    const results = await sequelize.query(
      `
      SELECT 
        material_type,
        width,
        height,
        SUM(material_weight) as total_weight,
        SUM(quantity) as total_quantity
      FROM inventory
      GROUP BY material_type, width, height
      ORDER BY material_type, width, height
      `,
      {
        type: QueryTypes.SELECT
      }
    ) as StockSummary[];

    // Calculate pending stats for each unique combination
    const statsWithPending = await Promise.all(
      results.map(async (item) => {
        const { pendingWeight, pendingQuantity } = await calculatePendingStats(
          item.material_type,
          Number(item.width),
          Number(item.height)
        );

        const available = {
          weight: Math.max(0, Number(item.total_weight) - pendingWeight),
          quantity: Math.max(0, Number(item.total_quantity) - pendingQuantity)
        };

        return {
          material_type: item.material_type,
          dimensions: {
            outer_diameter: Number(item.width),
            length: Number(item.height)
          },
          total: {
            weight: Number(item.total_weight),
            quantity: Number(item.total_quantity)
          },
          pending: {
            weight: pendingWeight,
            quantity: pendingQuantity
          },
          available,
          unit: DEFAULT_UNIT,
          status: available.quantity <= 0 ? 'out-of-stock' : 
                 available.quantity <= 5 ? 'low-stock' : 
                 'in-stock'
        };
      })
    );

    // Group by material type
    const groupedStats = statsWithPending.reduce((acc, curr) => {
      const { material_type, ...stats } = curr;
      if (!acc[material_type]) {
        acc[material_type] = [];
      }
      acc[material_type].push(stats);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json(
      successResponse({
        stats: groupedStats
      })
    );
  } catch (error: any) {
    console.error('Error fetching inventory stats:', error);
    return NextResponse.json(errorResponse(error.message || 'Failed to fetch inventory stats'), {
      status: 500
    });
  }
}