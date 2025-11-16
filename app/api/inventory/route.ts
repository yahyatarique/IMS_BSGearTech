import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/connection';
import Inventory from '@/db/models/Inventory';
import { CreateInventorySchema, InventoryListQuerySchema } from '@/schemas/inventory.schema';
import { successResponse, errorResponse, sendResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';
import { calculateCylindricalWeight } from '@/utils/material-calculations';
import { Op } from 'sequelize';

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

    // Build where clause
    const whereClause: any = {};

    if (material_type && material_type !== 'all') {
      whereClause.material_type = material_type;
    }

    if (search) {
      const dimensionMatch = search.match(/^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)$/i);

      if (dimensionMatch) {
        // Search by dimensions (e.g., "100 x 100")
        const [, outerDiameter, length] = dimensionMatch;
        whereClause.outer_diameter = parseFloat(outerDiameter);
        whereClause.length = parseFloat(length);
      } else if (!isNaN(Number(search))) {
        // Search by weight or total cost
        const numericValue = parseFloat(search);
        whereClause.rate = {
          [Op.gte]: numericValue
        };
      }
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

    return NextResponse.json(
      successResponse({
        inventory: inventory.map((item) => item.toJSON()),
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

    // Calculate material weight based on dimensions
    const calculatedWeight = calculateCylindricalWeight(
      validatedData.outer_diameter, // Outer Diameter
      validatedData.length // Length
    );

    if (calculatedWeight !== validatedData.material_weight) {
      throw new Error('Provided material weight does not match calculated weight');
    }

    // Create inventory item with calculated weight
    const inventoryItem = await Inventory.create(
      {
        ...validatedData,
        material_weight: calculatedWeight
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
