import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/connection';
import Buyer from '@/db/models/Buyer';
import { CreateBuyerSchema, BuyerListQuerySchema } from '@/schemas/buyer.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';
import { Op } from 'sequelize';

// GET /api/buyers - List buyers with meta (pagination) and filters
export async function GET(request: NextRequest) {
  try {
    await testConnection();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query params
    const validatedQuery = BuyerListQuerySchema.parse(queryParams);
    const { page, limit, status, search } = validatedQuery;

    // Build where clause
    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { org_name: { [Op.iLike]: `%${search}%` } },
        { gst_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Fetch buyers with meta pagination
    const offset = (page - 1) * limit;
    const { rows: buyers, count: total } = await Buyer.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      successResponse({
        buyers: buyers.map((buyer) => buyer.toJSON()),
        meta: {
          page,
          pageSize: limit,
          totalItems: total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      })
    );
  } catch (error: any) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json(errorResponse(error.message || 'Failed to fetch buyers'), {
      status: 500,
    });
  }
}

// POST /api/buyers - Create new buyer
export async function POST(request: NextRequest) {
  const transaction = await sequelize.transaction();

  try {
    await testConnection();

    const body = await request.json();

    // Validate request body
    const validatedData = CreateBuyerSchema.parse(body);

    // Create buyer with explicit type casting for optional fields
    const buyer = await Buyer.create({
      ...validatedData,
      contact_details: validatedData.contact_details || undefined,
      gst_number: validatedData.gst_number || null,
      pan_number: validatedData.pan_number || null,
      tin_number: validatedData.tin_number || null,
      org_name: validatedData.org_name || null,
      org_address: validatedData.org_address || null,
    } as any, { transaction });

    await transaction.commit();

    return NextResponse.json(successResponse(buyer.toJSON()), { status: 201 });
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error creating buyer:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('Validation failed', error.errors), {
        status: 400,
      });
    }

    return NextResponse.json(errorResponse(error.message || 'Failed to create buyer'), {
      status: 500,
    });
  }
}
