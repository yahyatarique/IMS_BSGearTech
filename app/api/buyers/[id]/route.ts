import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/connection';
import Buyer from '@/db/models/Buyer';
import { UpdateBuyerSchema } from '@/schemas/buyer.schema';
import { successResponse, errorResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';

// GET /api/buyers/[id] - Get single buyer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await testConnection();

    const { id } = await params;

    const buyer = await Buyer.findByPk(id);

    if (!buyer) {
      return NextResponse.json(errorResponse('Buyer not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(buyer.toJSON()));
  } catch (error: any) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json(errorResponse(error.message || 'Failed to fetch buyer'), {
      status: 500,
    });
  }
}

// PUT /api/buyers/[id] - Update buyer
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
    const validatedData = UpdateBuyerSchema.parse(body);

    const buyer = await Buyer.findByPk(id, { transaction });

    if (!buyer) {
      await transaction.rollback();
      return NextResponse.json(errorResponse('Buyer not found'), { status: 404 });
    }

    // Update buyer
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.contact_details !== undefined)
      updateData.contact_details = validatedData.contact_details;
    if (validatedData.gst_number !== undefined)
      updateData.gst_number = validatedData.gst_number || null;
    if (validatedData.pan_number !== undefined)
      updateData.pan_number = validatedData.pan_number || null;
    if (validatedData.tin_number !== undefined)
      updateData.tin_number = validatedData.tin_number || null;
    if (validatedData.org_name !== undefined)
      updateData.org_name = validatedData.org_name || null;
    if (validatedData.org_address !== undefined)
      updateData.org_address = validatedData.org_address || null;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;

    await buyer.update(updateData, { transaction });

    await transaction.commit();

    return NextResponse.json(successResponse(buyer.toJSON()));
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error updating buyer:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('Validation failed', error.errors), {
        status: 400,
      });
    }

    return NextResponse.json(errorResponse(error.message || 'Failed to update buyer'), {
      status: 500,
    });
  }
}

// DELETE /api/buyers/[id] - Delete buyer (soft delete by setting status to inactive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const transaction = await sequelize.transaction();

  try {
    await testConnection();

    const { id } = await params;

    const buyer = await Buyer.findByPk(id, { transaction });

    if (!buyer) {
      await transaction.rollback();
      return NextResponse.json(errorResponse('Buyer not found'), { status: 404 });
    }

    // Soft delete by setting status to inactive
    await buyer.update({ status: 'inactive' }, { transaction });

    await transaction.commit();

    return NextResponse.json(successResponse({ message: 'Buyer deleted successfully' }));
  } catch (error: any) {
    await transaction.rollback();
    console.error('Error deleting buyer:', error);
    return NextResponse.json(errorResponse(error.message || 'Failed to delete buyer'), {
      status: 500,
    });
  }
}
