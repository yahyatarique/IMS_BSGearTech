import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import Profiles from '@/db/models/Profiles';
import {Inventory} from '@/db/models';
import { CreateProfileSchema, ProfileListQuerySchema } from '@/schemas/profile.schema';
import { errorResponse, sendResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';
import { Op } from 'sequelize';
import z from 'zod';

// GET /api/profiles - List profiles with meta (pagination) and filters
export async function GET(request: NextRequest) {
  try {
    await testConnection();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query params
    const validatedQuery = ProfileListQuerySchema.parse(queryParams);
    const { page, limit, type, material, search } = validatedQuery;

    // Build where clause
    const whereClause: any = {};

    // Check if fetching by IDs
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      whereClause.id = { [Op.in]: ids };
    } else {
      if (type && type !== 'all') {
        whereClause.type = type;
      }

      if (material && material !== 'all') {
        whereClause.material = material;
      }

      if (search) {
        whereClause[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];
      }
    }

    // Fetch profiles with meta pagination
    const offset = (page - 1) * limit;
    const { rows: profiles, count: total } = await Profiles.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
      include: [{
        model: Inventory,
        as : 'inventory',
        attributes: ['id', 'material_type', 'rate', 'material_weight', 'outer_diameter', 'length']
      }]
    });

    const totalPages = Math.ceil(total / limit);

    return sendResponse(
      {
        profiles: profiles.map((profile) => profile.toJSON()),
        meta: {
          page,
          pageSize: limit,
          totalItems: total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      'Profiles fetched successfully'
    );
  } catch (error: any) {
    console.error('Error fetching profiles:', error);

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, error.errors);
    }

    return errorResponse(error.message || 'Failed to fetch profiles', 500);
  }
}

// POST /api/profiles - Create new profile
export async function POST(request: NextRequest) {
  const transaction = await sequelize.transaction();

  try {
    await testConnection();

    const body = await request.json();

    // Validate request body
    const validatedData = CreateProfileSchema.parse(body);

    // Create profile
    const profile = await Profiles.create(
      {
        ...validatedData
      } as any,
      { transaction }
    );

    await profile.reload({ transaction });

    const profileData = profile.get({ plain: true });

    await transaction.commit();

    return sendResponse(profileData, 'Profile created successfully', 201);
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error creating profile:', error);

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, z.treeifyError(error));
    }

    return errorResponse('Validation failed', 400, error.errors);
  }
}
