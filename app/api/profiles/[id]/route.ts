import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import Profiles from '@/db/models/Profiles';
import { UpdateProfileSchema } from '@/schemas/profile.schema';
import {  errorResponse, sendResponse } from '@/utils/api-response';
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
      return errorResponse('Profile not found', 404);
    }

    return sendResponse(profile.toJSON(), 'Profile fetched successfully');
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return errorResponse(error.message || 'Failed to fetch profile', 500);
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
      return errorResponse('Profile not found', 404);
    }

    // Update profile with validated data
    await profile.update(validatedData, { transaction });

    await profile.reload({ transaction });

    await transaction.commit();

    return sendResponse(profile.toJSON(), 'Profile updated successfully');
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error updating profile:', error);

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, error.errors);
    }

    return errorResponse(error.message || 'Failed to update profile', 500);
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
      return errorResponse('Profile not found', 404);
    }

    // Delete profile
    await profile.destroy({ transaction });

    await transaction.commit();

    return sendResponse(null, 'Profile deleted successfully');
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error deleting profile:', error);
    return errorResponse(error.message || 'Failed to delete profile', 500);
  }
}
