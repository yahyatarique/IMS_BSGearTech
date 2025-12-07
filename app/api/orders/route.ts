import { NextRequest } from 'next/server';
import {
  Inventory,
  OrderInventory,
  OrderProfile,
  Orders,
  OrderSequence,
  Profiles,
  Buyer,
  User
} from '@/db/models';
import { CreateOrderFormSchema } from '@/schemas/create-order.schema';
import { ORDER_STATUS } from '@/enums/orders.enum';
import sequelize, { testConnection } from '@/db/connection';
import { Op } from 'sequelize';
import { sendResponse, errorResponse } from '@/utils/api-response';

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
      orderNumber = await OrderSequence.getNextNumber();
    }

    if (!orderNumber) {
      await transaction.rollback();
      throw new Error('Order number is required');
    }

    // Fetch all selected profiles with their inventory
    const profiles = await Profiles.findAll({
      where: { id: validatedData.profile_ids },
      include: [
        {
          model: Inventory,
          as: 'inventory',
          required: false
        }
      ],
      transaction
    });

    if (profiles.length !== validatedData.profile_ids.length) {
      await transaction.rollback();
      throw new Error('One or more selected profiles not found');
    }

    // Calculate order totals
    const totalOrderValue = profiles.reduce((total, profile) => {
      const profileTotal = Number(profile.total || 0);
      return total + profileTotal * validatedData.quantity;
    }, 0);

    const grandTotal = totalOrderValue + (totalOrderValue * validatedData.profit) / 100;

    // Create the order
    const order = await Orders.create(
      {
        order_number: orderNumber,
        order_name: validatedData.order_name,
        buyer_id: validatedData.buyer_id,
        quantity: validatedData.quantity,
        total_order_value: totalOrderValue,
        profit_margin: validatedData.profit,
        grand_total: grandTotal,
        status: ORDER_STATUS.PENDING,
        burning_wastage_percent: validatedData.burning_wastage_percent
      },
      { transaction }
    );

    // Prepare OrderProfile records for bulk creation
    const orderProfilesData = profiles.map((profile) => ({
      order_id: order.id,
      profile_id: profile.id,
      name: profile.name,
      type: profile.type,
      material: profile.material,
      no_of_teeth: profile.no_of_teeth,
      rate: Number(profile.rate),
      face: Number(profile.face),
      module: Number(profile.module),
      finish_size: profile.finish_size || '',
      burning_weight: Number(profile.burning_weight),
      total_weight: Number(profile.total_weight),
      ht_cost: Number(profile.ht_cost),
      ht_rate: Number(profile.ht_rate),
      processes: profile.processes,
      cyn_grinding: Number(profile.cyn_grinding),
      total: Number(profile.total),
      group_by: profile.group_by || undefined,
      burning_wastage_percentage: profile.burning_wastage_percentage || 0
    }));

    // BulkCreate OrderProfile records
    await OrderProfile.bulkCreate(orderProfilesData, { transaction });

    // Prepare OrderInventory records for profiles that have inventory
    const orderInventoryData = profiles
      .filter((profile) => profile.inventory_id)
      .map((profile) => {
        const inventory = (profile as any).inventory; // Type assertion for associated data
        return {
          order_id: order.id,
          inventory_id: profile.inventory_id!,
          material_type: inventory?.material_type || profile.material,
          material_weight: Number(inventory?.material_weight || 0),
          outer_diameter: Number(inventory?.outer_diameter || 0),
          length: Number(inventory?.length || 0),
          rate: Number(inventory?.rate || 0)
        };
      });

    // BulkCreate OrderInventory records if any
    if (orderInventoryData.length > 0) {
      await OrderInventory.bulkCreate(orderInventoryData, { transaction });
    }

    await transaction.commit();

    // Increment order sequence after successful order creation
    await OrderSequence.incrementNumber();

    // Fetch the created order with relations
    const orderWithRelations = await Orders.findByPk(order.id, {
      include: [
        { model: Buyer, as: 'buyer', attributes: ['id', 'name', 'org_name'] },
        { model: OrderProfile, as: 'orderProfiles' },
        { model: OrderInventory, as: 'orderInventoryItems' },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] }
      ]
    });

    return sendResponse(orderWithRelations, 'Order created successfully', 201);
  } catch (error: any) {
    if (transaction) {
      await transaction.rollback();
    }

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, error.errors);
    }

    return errorResponse(error.message || 'Failed to create order', 500);
  }
}

// Endpoint to get next order number and list orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'next-number') {
      await testConnection();

      try {
        const orderNumber = await OrderSequence.getNextNumber();
        return sendResponse(
          { order_number: orderNumber },
          'Next order number retrieved successfully'
        );
      } catch (error: any) {
        return errorResponse(error.message || 'Failed to get next order number', 500);
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
      include: [
        {
          model: Buyer,
          as: 'buyer',
          attributes: ['id', 'name', 'org_name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        },
        {
          model: OrderProfile,
          as: 'orderProfiles'
        }
      ],
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
