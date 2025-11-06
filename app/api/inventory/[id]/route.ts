import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/connection';
import Inventory from '@/db/models/Inventory';
import { UpdateInventorySchema } from '@/schemas/inventory.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';

// GET /api/inventory/[id] - Get single inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await testConnection();

    const { id } = await params;

    const inventoryItem = await Inventory.findByPk(id);

    if (!inventoryItem) {
      return NextResponse.json(errorResponse('Inventory item not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(inventoryItem.toJSON()));
  } catch (error: any) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(errorResponse(error.message || 'Failed to fetch inventory item'), {
      status: 500,
    });
  }
}

// PUT /api/inventory/[id] - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const transaction = await sequelize.transaction();

  try {
    await testConnection();

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = UpdateInventorySchema.parse(body);

    const inventoryItem = await Inventory.findByPk(id, { transaction });

    if (!inventoryItem) {
      await transaction.rollback();
      return NextResponse.json(errorResponse('Inventory item not found'), { status: 404 });
    }

    // Update inventory item with validated data
    await inventoryItem.update(validatedData, { transaction });

    await transaction.commit();

    return NextResponse.json(successResponse(inventoryItem.toJSON()));
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error updating inventory item:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('Validation failed', 400, error.errors), {
        status: 400,
      });
    }

    return NextResponse.json(errorResponse(error.message || 'Failed to update inventory item'), {
      status: 500,
    });
  }
}

// DELETE /api/inventory/[id] - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const transaction = await sequelize.transaction();

  try {
    await testConnection();

    const { id } = await params;

    const inventoryItem = await Inventory.findByPk(id, { transaction });

    if (!inventoryItem) {
      await transaction.rollback();
      return NextResponse.json(errorResponse('Inventory item not found'), { status: 404 });
    }

    // Delete inventory item
    await inventoryItem.destroy({ transaction });

    await transaction.commit();

    return NextResponse.json(successResponse({ message: 'Inventory item deleted successfully' }));
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(errorResponse(error.message || 'Failed to delete inventory item'), {
      status: 500,
    });
  }
}
