import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import Orders from '@/db/models/Orders';
import Buyer from '@/db/models/Buyer';
import User from '@/db/models/User';
import { UpdateOrderSchema } from '@/schemas/order.schema';
import sequelize from '@/db/connection';
import { sendResponse, errorResponse } from '@/utils/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await testConnection();

    const paramsPromise = await params;
    const order = await Orders.findByPk(paramsPromise.id, {
      include: [
        { model: Buyer, as: 'buyer', attributes: ['id', 'name', 'org_name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] }
      ]
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    return sendResponse(order, 'Order retrieved successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch order', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const transaction = await sequelize.transaction();
  const paramsPromise = await params;
  
  try {
    await testConnection();

    const order = await Orders.findByPk(paramsPromise.id);

    if (!order) {
      await transaction.rollback();
      return errorResponse('Order not found', 404);
    }

    const body = await request.json();
    const validatedData = UpdateOrderSchema.parse(body);

    await order.update(validatedData, { transaction });
    await transaction.commit();

    const updatedOrder = await Orders.findByPk(paramsPromise.id, {
      include: [
        { model: Buyer, as: 'buyer', attributes: ['id', 'name', 'org_name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] }
      ]
    });

    return sendResponse(updatedOrder, 'Order updated successfully');
  } catch (error: any) {
    await transaction.rollback();
    
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, error.errors);
    }

    return errorResponse(error.message || 'Failed to update order', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const transaction = await sequelize.transaction();
  const paramsPromise = await params;
  
  try {
    await testConnection();

    const order = await Orders.findByPk(paramsPromise.id);

    if (!order) {
      await transaction.rollback();
      return errorResponse('Order not found', 404);
    }

    await order.destroy({ transaction });
    await transaction.commit();

    return sendResponse(null, 'Order deleted successfully');
  } catch (error: any) {
    await transaction.rollback();
    return errorResponse(error.message || 'Failed to delete order', 500);
  }
}
