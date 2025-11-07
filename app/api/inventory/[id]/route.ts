import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/connection';
import Inventory from '@/db/models/Inventory';
import { UpdateInventorySchema } from '@/schemas/inventory.schema';
import { successResponse, errorResponse, sendResponse } from '@/utils/api-response';
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
      return errorResponse('Inventory item not found', 404);
    }

    return successResponse(inventoryItem.toJSON());
  } catch (error: any) {
    console.error('Error fetching inventory item:', error);
    return errorResponse(error.message || 'Failed to fetch inventory item', 500);
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
      return errorResponse('Inventory item not found', 404);
    }

    // Update inventory item with validated data
    await inventoryItem.update(validatedData, { transaction });

    await inventoryItem.reload({ transaction });

    await transaction.commit();

    return sendResponse(inventoryItem.toJSON(), 'Inventory item updated successfully');
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error updating inventory item:', error);

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, error.errors);
    }

    return errorResponse(error.message || 'Failed to update inventory item', 500);
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
      return errorResponse('Inventory item not found', 404);
    }

    // Delete inventory item
    await inventoryItem.destroy({ transaction });

    await transaction.commit();

    return sendResponse(null, 'Inventory item deleted successfully');
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error deleting inventory item:', error);
    return errorResponse(error.message || 'Failed to delete inventory item', 500);
  }
}
