import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import Orders from '@/db/models/Orders';
import Buyer from '@/db/models/Buyer';
import User from '@/db/models/User';
import { CreateOrderSchema } from '@/schemas/order.schema';
import sequelize from '@/db/connection';
import { Op } from 'sequelize';
import { sendResponse, errorResponse } from '@/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    await testConnection();

    const { searchParams } = new URL(request.url);
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
      // include: [
      //   {
      //     model: Buyer,
      //     as: 'buyer',
      //     attributes: ['id', 'name', 'org_name'],
      //     required: true
      //   },
      //   {
      //     model: User,
      //     as: 'user',
      //     attributes: ['id', 'username', 'first_name', 'last_name'],
      //     required: false
      //   }
      // ],
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

export async function POST(request: NextRequest) {
  const transaction = await sequelize.transaction();

  try {
    await testConnection();

    const body = await request.json();
    const validatedData = CreateOrderSchema.parse(body);

    const order = await Orders.create(validatedData, { transaction });

    await transaction.commit();

    const orderWithRelations = await Orders.findByPk(order.id, {
      include: [
        { model: Buyer, as: 'buyer', attributes: ['id', 'name', 'org_name'] },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] }
      ]
    });

    return sendResponse(orderWithRelations, 'Order created successfully', 201);
  } catch (error: any) {
    await transaction.rollback();

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, error.errors);
    }

    return errorResponse(error.message || 'Failed to create order', 500);
  }
}
