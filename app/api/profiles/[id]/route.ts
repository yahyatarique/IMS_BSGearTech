import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/connection';
import Profiles from '@/db/models/Profiles';
import { UpdateProfileSchema } from '@/schemas/profile.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';

// GET /api/profiles/[id] - Get single profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await testConnection();

    const { id } = await params;

    const profile = await Profiles.findByPk(id);

    if (!profile) {
      return NextResponse.json(errorResponse('Profile not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(profile.toJSON()));
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(errorResponse(error.message || 'Failed to fetch profile'), {
      status: 500,
    });
  }
}

// PUT /api/profiles/[id] - Update profile
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
    const validatedData = UpdateProfileSchema.parse(body);

    const profile = await Profiles.findByPk(id, { transaction });

    if (!profile) {
      await transaction.rollback();
      return NextResponse.json(errorResponse('Profile not found'), { status: 404 });
    }

    // Update profile with validated data
    await profile.update(validatedData, { transaction });

    await transaction.commit();

    return NextResponse.json(successResponse(profile.toJSON()));
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error updating profile:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('Validation failed', 400, error.errors), {
        status: 400,
      });
    }

    return NextResponse.json(errorResponse(error.message || 'Failed to update profile'), {
      status: 500,
    });
  }
}

// DELETE /api/profiles/[id] - Delete profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const transaction = await sequelize.transaction();

  try {
    await testConnection();

    const { id } = await params;

    const profile = await Profiles.findByPk(id, { transaction });

    if (!profile) {
      await transaction.rollback();
      return NextResponse.json(errorResponse('Profile not found'), { status: 404 });
    }

    // Delete profile
    await profile.destroy({ transaction });

    await transaction.commit();

    return NextResponse.json(successResponse({ message: 'Profile deleted successfully' }));
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error deleting profile:', error);
    return NextResponse.json(errorResponse(error.message || 'Failed to delete profile'), {
      status: 500,
    });
  }
}
