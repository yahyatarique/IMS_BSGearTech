import { NextRequest } from 'next/server';
import Orders from '@/db/models/Orders';
import { OrderInventory } from '@/db/models/OrderInventory';
import OrderProfile from '@/db/models/OrderProfile';
import Buyer from '@/db/models/Buyer';
import Profiles from '@/db/models/Profiles';
import Inventory from '@/db/models/Inventory';
import User from '@/db/models/User';
import { CreateOrderFormSchema } from '@/schemas/create-order.schema';
import { ORDER_STATUS } from '@/enums/orders.enum';
import sequelize, { testConnection } from '@/db/connection';
import { Op } from 'sequelize';
import { sendResponse, errorResponse } from '@/utils/api-response';
import z from 'zod';

export async function POST(request: NextRequest) {
  let transaction;

  try {
    await testConnection();

    const body = await request.json();
    const validatedData = CreateOrderFormSchema.parse(body);

    // Start transaction
    transaction = await sequelize.transaction();

    // Use the order_number provided by frontend, or generate as fallback
    let orderNumber = validatedData.order_number;
    if (!orderNumber) {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const prefix = `BSGPL/${month}/${year}/`;

      try {
        const [{ get_next_order_number: nextOrderNumber }] = (await sequelize.query(
          'SELECT get_next_order_number() as get_next_order_number',
          { transaction }
        )) as any;

        // If no order number returned (empty DB), use 0001
        orderNumber = nextOrderNumber || `${prefix}0001`;
      } catch (error) {
        orderNumber = `${prefix}0001`;
      }
    }

    if (!orderNumber) {
      await transaction.rollback();
      throw new Error('Order number is required');
    }

    // Get the profile to fetch its details
    const profile = await Profiles.findByPk(validatedData.profile_id);
    if (!profile) {
      await transaction.rollback();
      throw new Error('Selected profile not found');
    }

    // Create the order
    const order = await Orders.create(
      {
        order_number: orderNumber,
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
        grand_total: validatedData.grand_total,
        status: ORDER_STATUS.PENDING
      },
      { transaction }
    );

    // Create OrderProfile record with profile details
    await OrderProfile.create(
      {
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
      },
      { transaction }
    );

    // Fetch inventory item if profile has inventory_id
    let inventoryDetails = null;
    if (profile.inventory_id) {
      inventoryDetails = await Inventory.findByPk(profile.inventory_id, { transaction });
    }

    // Create OrderInventory record with inventory details
    await OrderInventory.create(
      {
        order_id: order.id,
        inventory_id: profile.inventory_id || '',
        material_type: inventoryDetails?.material_type || profile.material,
        material_weight: validatedData.weight,
        width: inventoryDetails?.width || validatedData.finish_size.width,
        height: inventoryDetails?.height || validatedData.finish_size.height,
        quantity: 1
      },
      { transaction }
    );

    await transaction.commit();

    // Fetch the created order with relations
   order.reload()

    return sendResponse(order, 'Order created successfully', 201);
  } catch (error: any) {
    if (transaction) {
      await transaction.rollback();
    }

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, z.treeifyError(error));
    }

    return errorResponse(error.message || 'Failed to create order', 500, error);
  }
}

// Endpoint to get next order number and list orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'next-number') {
      await testConnection();

      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const prefix = `BSGPL/${month}/${year}/`;

      try {
        const [{ get_next_order_number: nextNumber }] = (await sequelize.query(
          'SELECT get_next_order_number() as get_next_order_number'
        )) as any;

        // If no order number returned (empty DB), use 0001
        const orderNumber = nextNumber || `${prefix}0001`;
        return sendResponse(
          { order_number: orderNumber },
          'Next order number retrieved successfully'
        );
      } catch (error) {
        return sendResponse(
          { order_number: `${prefix}0001` },
          'Next order number retrieved successfully'
        );
      }
    }

    // Original GET logic for listing orders
    await testConnection();

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const buyer_id = searchParams.get('buyer_id');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (buyer_id) where.buyer_id = buyer_id;
    if (search) {
      where.order_number = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Orders.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    return sendResponse(
      {
        orders: rows,
        meta: {
          page,
          pageSize: limit,
          totalItems: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      'Orders retrieved successfully'
    );
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch orders', 500);
  }
}
