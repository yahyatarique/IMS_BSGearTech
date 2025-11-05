import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Profiles } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    // Get last 5 materials (profiles grouped by material type)
    const materialsData = await Profiles.findAll({
      limit: 5,
      order: [['material_rate', 'DESC']],
      attributes: ['id', 'name', 'material', 'material_rate', 'type']
    });

    // Get last 5 profile types
    const profilesData = await Profiles.findAll({
      limit: 5,
      order: [['name', 'ASC']],
    });

    // Transform materials data
    const formattedMaterials = materialsData.map(material => ({
      id: material.id,
      name: `${material.material.charAt(0).toUpperCase() + material.material.slice(1)} - ${material.name}`,
      type: material.type.charAt(0).toUpperCase() + material.type.slice(1),
      materialType: material.material,
      rate: parseFloat(material.material_rate.toString()),
      stock: 5000, // TODO: Add stock management when inventory system is implemented
      unit: 'kg',
      reorderLevel: 1000,
      status: 'in-stock' as const
    }));

    // Transform profiles data
    const formattedProfiles = profilesData.map(profile => ({
      id: profile.id,
      name: profile.name,
      specification: `${profile.cut_size_width_mm}mm × ${profile.cut_size_height_mm}mm`,
      material: profile.material.charAt(0).toUpperCase() + profile.material.slice(1),
      type: profile.type.charAt(0).toUpperCase() + profile.type.slice(1),
      materialRate: parseFloat(profile.material_rate.toString()),
      inStock: 1200, // TODO: Add actual stock data when inventory is implemented
      reserved: 300,
      available: 900
    }));

    return sendResponse({
      materials: formattedMaterials,
      profiles: formattedProfiles
    }, 'Materials and profiles retrieved successfully');
  } catch (error) {
    console.error('Materials and profiles error:', error);
    return errorResponse('Failed to retrieve materials and profiles', 500);
  }
}

