import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import BurningWastage from '@/db/models/BurningWastage';
import { OrderProfile, Orders } from '@/db/models';
import { CreateBurningWastageSchema } from '@/schemas/burning-wastage.schema';
import { sendResponse, errorResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';

// GET - Fetch all burning wastage entries with pagination
export async function GET(request: NextRequest) {
  try {
    await testConnection();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const { rows: wastageEntries, count: totalItems } = await BurningWastage.findAndCountAll({
      order: [['date', 'DESC']],
      limit,
      offset,
    });

    // Calculate total burning wastage from completed orders
    const orderBurningWastageResult = await OrderProfile.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('burning_weight')), 'total']],
      include: [{
        model: Orders,
        as: 'order',
        where: { status: '2' }, // Only completed orders
        attributes: []
      }],
      raw: true
    });

    const orderBurningWastage = Number((orderBurningWastageResult as any)?.total || 0);

    // Calculate manual adjustments (positive = added, negative = disposed/sold)
    const manualAdjustments = await BurningWastage.sum('wastage_kg') || 0;
    
    // Total = wastage from orders + manual adjustments (can be negative if disposed)
    const totalWastage = orderBurningWastage - Number(manualAdjustments);

    return sendResponse(
      {
        wastageEntries,
        meta: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          totalWastage: Number(totalWastage.toFixed(2)),
          orderBurningWastage: Number(orderBurningWastage.toFixed(2)),
          manualAdjustments: Number(manualAdjustments.toFixed(2)),
        },
      },
      'Burning wastage entries retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching burning wastage:', error);
    return errorResponse(error.message || 'Failed to fetch burning wastage entries', 500);
  }
}

// POST - Create a new burning wastage entry
export async function POST(request: NextRequest) {
  const transaction = await sequelize.transaction();
  
  try {
    await testConnection();

    const body = await request.json();
    const validatedData = CreateBurningWastageSchema.parse(body);

    const wastageEntry = await BurningWastage.create(
      {
        wastage_kg: validatedData.wastage_kg,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        notes: validatedData.notes,
      },
      { transaction }
    );

    await transaction.commit();

    return sendResponse(wastageEntry, 'Burning wastage entry created successfully', 201);
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error creating burning wastage entry:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    
    return errorResponse(error.message || 'Failed to create burning wastage entry', 500);
  }
}

// DELETE - Delete a burning wastage entry
export async function DELETE(request: NextRequest) {
  const transaction = await sequelize.transaction();
  
  try {
    await testConnection();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Wastage entry ID is required', 400);
    }

    const wastageEntry = await BurningWastage.findByPk(id);

    if (!wastageEntry) {
      return errorResponse('Wastage entry not found', 404);
    }

    await wastageEntry.destroy({ transaction });
    await transaction.commit();

    return sendResponse(null, 'Burning wastage entry deleted successfully');
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error deleting burning wastage entry:', error);
    return errorResponse(error.message || 'Failed to delete burning wastage entry', 500);
  }
}
