import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/db/connection';
import Inventory from '@/db/models/Inventory';
import { successResponse, errorResponse, sendResponse } from '@/utils/api-response';
import { Op } from 'sequelize';

// GET /api/inventory/material-dimensions?material_type=CR-5
// Fetch available cut size dimensions for a specific material type
export async function GET(request: NextRequest) {
  try {
    await testConnection();

    const { searchParams } = new URL(request.url);
    const materialType = searchParams.get('material_type');

    if (!materialType) {
      return errorResponse('material_type query parameter is required', 400);
    }

    if (!['CR-5', 'EN-9'].includes(materialType)) {
      return errorResponse('Invalid material_type. Must be CR-5 or EN-9', 400);
    }

    // Fetch unique cut size dimensions for the specified material
    const dimensions = await Inventory.findAll({
      where: {
        material_type: materialType,
      },
      attributes: [
        'cut_size_width',
        'cut_size_height',
        [Inventory.sequelize!.fn('COUNT', Inventory.sequelize!.col('id')), 'available_count']
      ],
      group: ['cut_size_width', 'cut_size_height'],
      order: [
        ['cut_size_width', 'ASC'],
        ['cut_size_height', 'ASC']
      ],
      raw: true,
    });

    // Transform the results
    const formattedDimensions = dimensions.map((dim: any) => ({
      width: Number(dim.cut_size_width),
      height: Number(dim.cut_size_height),
      available_count: parseInt(dim.available_count, 10),
    }));

    return sendResponse({
      material_type: materialType,
      dimensions: formattedDimensions,
      total_options: formattedDimensions.length,
    }, 'Successfully fetched material dimensions', 200);
  } catch (error: any) {
    console.error('Error fetching material dimensions:', error);
    return errorResponse(error.message || 'Failed to fetch material dimensions', 500);
  }
}
