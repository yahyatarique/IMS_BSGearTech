import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import Orders from '@/db/models/Orders';
import Buyer from '@/db/models/Buyer';
import Profiles from '@/db/models/Profiles';
import OrderProfile from '@/db/models/OrderProfile';
import { OrderInventory } from '@/db/models/OrderInventory';
import User from '@/db/models/User';
import { CreateOrderFormSchema } from '@/schemas/create-order.schema';
import { ORDER_STATUS } from '@/enums/orders.enum';
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
        { model: OrderProfile, as: 'orderProfiles' },
        { model: OrderInventory, as: 'orderInventoryItems' },
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
  let transaction;
  const paramsPromise = await params;
  
  try {
    await testConnection();

    const order = await Orders.findByPk(paramsPromise.id);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    const body = await request.json();
    const validatedData = CreateOrderFormSchema.parse(body);

    // Start transaction
    transaction = await sequelize.transaction();

    // Get the profile for OrderProfile update
    const profile = await Profiles.findByPk(validatedData.profile_id);
    if (!profile) {
      await transaction.rollback();
      throw new Error('Selected profile not found');
    }

    // Update order
    await order.update({
      buyer_id: validatedData.buyer_id,
      turning_rate: validatedData.turning_rate,
      module: validatedData.module || 0,
      face: validatedData.face || 0,
      teeth_count: validatedData.teeth_count || 0,
      weight: validatedData.weight,
      material_cost: validatedData.material_cost,
      ht_cost: validatedData.ht_cost,
      total_order_value: validatedData.total_order_value,
      profit_margin: validatedData.profit_margin,
      grand_total: validatedData.grand_total
    }, { transaction });

    // Update or create OrderProfile record
    const orderProfile = await OrderProfile.findOne({
      where: { order_id: order.id },
      transaction
    });

    if (orderProfile) {
      await orderProfile.update({
        profile_id: profile.id,
        name: profile.name,
        type: profile.type,
        material: profile.material,
        material_rate: profile.material_rate,
        cut_size_width_mm: validatedData.finish_size.width,
        cut_size_height_mm: validatedData.finish_size.height,
        burning_wastage_percent: profile.burning_wastage_percent,
        heat_treatment_rate: profile.heat_treatment_rate,
        heat_treatment_inefficacy_percent: profile.heat_treatment_inefficacy_percent
      }, { transaction });
    } else {
      await OrderProfile.create({
        order_id: order.id,
        profile_id: profile.id,
        name: profile.name,
        type: profile.type,
        material: profile.material,
        material_rate: profile.material_rate,
        cut_size_width_mm: validatedData.finish_size.width,
        cut_size_height_mm: validatedData.finish_size.height,
        burning_wastage_percent: profile.burning_wastage_percent,
        heat_treatment_rate: profile.heat_treatment_rate,
        heat_treatment_inefficacy_percent: profile.heat_treatment_inefficacy_percent
      }, { transaction });
    }

    // Update OrderInventory record
    const orderInventory = await OrderInventory.findOne({
      where: { order_id: order.id },
      transaction
    });

    if (orderInventory) {
      await orderInventory.update({
        material_type: profile.material,
        material_weight: validatedData.weight,
        width: validatedData.finish_size.width,
        height: validatedData.finish_size.height,
        quantity: 1
      }, { transaction });
    } else {
      await OrderInventory.create({
        order_id: order.id,
        inventory_id: '',
        material_type: profile.material,
        material_weight: validatedData.weight,
        width: validatedData.finish_size.width,
        height: validatedData.finish_size.height,
        quantity: 1
      }, { transaction });
    }

    await transaction.commit();

    // Fetch updated order with relations
    const updatedOrder = await Orders.findByPk(paramsPromise.id, {
      include: [
        { model: Buyer, as: 'buyer', attributes: ['id', 'name', 'org_name'] },
        { model: OrderProfile, as: 'orderProfiles' },
        { model: OrderInventory, as: 'orderInventoryItems' },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] }
      ]
    });

    return sendResponse(updatedOrder, 'Order updated successfully');
  } catch (error: any) {
    if (transaction) {
      await transaction.rollback();
    }
    
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
