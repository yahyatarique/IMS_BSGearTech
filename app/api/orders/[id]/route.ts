import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import Buyer from '@/db/models/Buyer';
import Profiles from '@/db/models/Profiles';
import OrderProfile from '@/db/models/OrderProfile';
import { OrderInventory } from '@/db/models/OrderInventory';
import User from '@/db/models/User';
import { Inventory, Orders } from '@/db/models';
import { UpdateOrderFormSchema } from '@/schemas/create-order.schema';
import sequelize from '@/db/connection';
import { sendResponse, errorResponse } from '@/utils/api-response';
import { z } from 'zod';

const UpdateOrderStatusSchema = z.object({
  status: z.enum(['0', '1', '2'])
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await testConnection();

    const paramsPromise = await params;
    const order = await Orders.findByPk(paramsPromise.id, {
      include: [
        { model: Buyer, as: 'buyer', attributes: ['id', 'name', 'org_name'] },
        { model: OrderProfile, as: 'orderProfiles' },
        { model: OrderInventory, as: 'orderInventoryItems' },
        { model: User, as: 'user', attributes: ['id', 'username', 'first_name', 'last_name'] }
      ]
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Calculate burning wastage in kg from profiles
    const orderData = order.toJSON();
    let burningWastageKg = 0;

    if (orderData.orderProfiles && orderData.orderProfiles.length > 0) {
      burningWastageKg = orderData.orderProfiles.reduce((sum, profile) => {
        return sum + (Number(profile.burning_weight) || 0);
      }, 0);
    }

    // Add calculated burning wastage to response
    const responseData = {
      ...orderData,
      burning_wastage_kg: burningWastageKg
    };

    return sendResponse(responseData, 'Order retrieved successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch order', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let transaction;
  const paramsPromise = await params;

  try {
    await testConnection();

    const order = await Orders.findOne({
      where: { id: paramsPromise.id },
      include: [{ model: OrderProfile, as: 'orderProfiles' }]
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    const body = await request.json();
    const validatedData = UpdateOrderFormSchema.parse(body);

    // Start transaction
    transaction = await sequelize.transaction();

    // Prepare order update object (only include provided fields)
    const orderUpdateData: any = {};

    if (validatedData.order_name !== undefined)
      orderUpdateData.order_name = validatedData.order_name;
    if (validatedData.buyer_id !== undefined) orderUpdateData.buyer_id = validatedData.buyer_id;
    if (validatedData.quantity !== undefined) orderUpdateData.quantity = validatedData.quantity;
    if (validatedData.burning_wastage_percent !== undefined) {
      orderUpdateData.burning_wastage_percent = validatedData.burning_wastage_percent;
    }

    const oldProfiles = order.get({ plain: true }).orderProfiles || [];

    //use row ids to track deletions and updates
    const oldProfileIds = oldProfiles.map((p) => p.id);
    const orderProfileIds =
      validatedData.profiles?.filter((p) => !p.isNew && p.id).map((p) => p.id) || [];

    // Handle profile updates if provided
    if (validatedData.profiles && validatedData.profiles.length > 0) {
      // Separate profiles into delete, update, and new categories
      const profilesToDeleteIds = oldProfileIds.filter((id) => !orderProfileIds.includes(id));

      // const profilesToUpdate = validatedData.profiles.filter((p) => !p.isNew && p.id);
      const profilesToCreateIds =
        validatedData.profiles.filter((p) => !p.profile_id && p.id && p.isNew).map((p) => p.id) ||
        [];

      // Delete marked profiles and their inventory items (cascade will handle inventory)
      if (profilesToDeleteIds.length > 0) {
        await OrderProfile.destroy({
          where: { id: profilesToDeleteIds, order_id: order.id },
          transaction
        });
      }

      //Updating profile with new data concept does not exist for now.
      // Update existing profiles
      // for (const profileUpdate of profilesToUpdate) {
      //   if (!profileUpdate.id) continue;

      //   const existingProfile = await OrderProfile.findOne({
      //     where: { id: profileUpdate.id, order_id: order.id },
      //     transaction
      //   });

      //   if (existingProfile) {
      //     // Fetch the profile details from Profiles table
      //     const profile = await Profiles.findByPk(profileUpdate.profile_id, {
      //       include: [{ model: Inventory, as: 'inventory', required: false }],
      //       transaction
      //     });

      //     if (!profile) {
      //       throw new Error(`Profile ${profileUpdate.profile_id} not found`);
      //     }

      //     // Update OrderProfile with latest data from Profiles
      //     await existingProfile.update(
      //       {
      //         profile_id: profile.id,
      //         name: profile.name,
      //         type: profile.type,
      //         material: profile.material,
      //         no_of_teeth: profile.no_of_teeth,
      //         rate: Number(profile.rate),
      //         face: Number(profile.face),
      //         module: Number(profile.module),
      //         finish_size: profile.finish_size || '',
      //         burning_weight: Number(profile.burning_weight),
      //         total_weight: Number(profile.total_weight),
      //         ht_cost: Number(profile.ht_cost),
      //         ht_rate: Number(profile.ht_rate),
      //         processes: profile.processes,
      //         cyn_grinding: Number(profile.cyn_grinding),
      //         total: Number(profile.total)
      //       },
      //       { transaction }
      //     );

      //     // Update or create associated inventory if profile has inventory
      //     if (profile.inventory_id) {
      //       const inventory = (profile as any).inventory;
      //       const existingInventory = await OrderInventory.findOne({
      //         where: { order_profile_id: existingProfile.id },
      //         transaction
      //       });

      //       const inventoryData = {
      //         order_id: order.id,
      //         order_profile_id: existingProfile.id,
      //         inventory_id: profile.inventory_id,
      //         material_type: inventory?.material_type || profile.material,
      //         material_weight: Number(inventory?.material_weight || 0),
      //         outer_diameter: Number(inventory?.outer_diameter || 0),
      //         length: Number(inventory?.length || 0),
      //         rate: Number(inventory?.rate || 0)
      //       };

      //       if (existingInventory) {
      //         await existingInventory.update(inventoryData, { transaction });
      //       } else {
      //         await OrderInventory.create(inventoryData, { transaction });
      //       }
      //     }
      //   }
      // }

      // Create new profiles
      if (profilesToCreateIds.length > 0) {
        const profiles = await Profiles.findAll({
          where: { id: profilesToCreateIds as string[] },
          include: [{ model: Inventory, as: 'inventory', required: false }],
          transaction
        });

        if (profiles.length !== profilesToCreateIds.length) {
          throw new Error('One or more new profiles not found');
        }

        // Create OrderProfile records
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

        const createdProfiles = await OrderProfile.bulkCreate(orderProfilesData, {
          transaction,
          returning: true
        });

        // Create OrderInventory records for new profiles with inventory
        const orderInventoryData = [];
        for (let i = 0; i < profiles.length; i++) {
          const profile = profiles[i];
          const createdProfile = createdProfiles[i];

          if (profile.inventory_id) {
            const inventory = (profile as any).inventory;
            orderInventoryData.push({
              order_id: order.id,
              order_profile_id: createdProfile.id,
              inventory_id: profile.inventory_id,
              material_type: inventory?.material_type || profile.material,
              material_weight: Number(inventory?.material_weight || 0),
              outer_diameter: Number(inventory?.outer_diameter || 0),
              length: Number(inventory?.length || 0),
              rate: Number(inventory?.rate || 0)
            });
          }
        }

        if (orderInventoryData.length > 0) {
          await OrderInventory.bulkCreate(orderInventoryData, { transaction });
        }
      }

      // Recalculate totals based on remaining profiles
      const remainingProfiles = await OrderProfile.findAll({
        where: { order_id: order.id },
        transaction
      });

      const quantity = validatedData.quantity ?? order.quantity;
      const profit = validatedData.profit ?? order.profit_margin;

      const totalOrderValue = remainingProfiles.reduce((total, profile) => {
        const profileTotal = Number(profile.total || 0);
        return total + profileTotal * quantity;
      }, 0);

      const grandTotal = totalOrderValue + (totalOrderValue * profit) / 100;

      orderUpdateData.total_order_value = totalOrderValue;
      orderUpdateData.grand_total = grandTotal;

      if (validatedData.profit !== undefined) {
        orderUpdateData.profit_margin = validatedData.profit;
      }
    } else if (validatedData.quantity !== undefined || validatedData.profit !== undefined) {
      // If only quantity or profit changed (no profile updates), recalculate totals
      const existingProfiles = await OrderProfile.findAll({
        where: { order_id: order.id },
        transaction
      });

      const quantity = validatedData.quantity ?? order.quantity;
      const profit = validatedData.profit ?? order.profit_margin;

      const totalOrderValue = existingProfiles.reduce((total, profile) => {
        const profileTotal = Number(profile.total || 0);
        return total + profileTotal * quantity;
      }, 0);

      const grandTotal = totalOrderValue + (totalOrderValue * profit) / 100;

      orderUpdateData.total_order_value = totalOrderValue;
      orderUpdateData.grand_total = grandTotal;

      if (validatedData.profit !== undefined) {
        orderUpdateData.profit_margin = validatedData.profit;
      }
    }

    // Update the order with all changes
    if (Object.keys(orderUpdateData).length > 0) {
      await order.update(orderUpdateData, { transaction });
    }

    await transaction.commit();

    // Fetch updated order with relations
    const updatedOrder = await Orders.findByPk(paramsPromise.id, {
      include: [
        {
          model: Buyer,
          as: 'buyer'
        },
        {
          model: OrderProfile,
          as: 'orderProfiles'
        },
        { model: OrderInventory, as: 'orderInventoryItems' },
        { model: User, as: 'user' }
      ]
    });

    return sendResponse(JSON.stringify(updatedOrder), 'Order updated successfully');
  } catch (error: any) {
    if (transaction) {
      await transaction.rollback();
    }

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 400, z.treeifyError(error));
    }

    return errorResponse(error.message || 'Failed to update order', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const transaction = await sequelize.transaction();
  const paramsPromise = await params;

  try {
    await testConnection();

    const order = await Orders.findByPk(paramsPromise.id);

    if (!order) {
      await transaction.rollback();
      return errorResponse('Order not found', 404);
    }

    await order.destroy({ transaction });
    await transaction.commit();

    return sendResponse(null, 'Order deleted successfully');
  } catch (error: any) {
    await transaction.rollback();
    return errorResponse(error.message || 'Failed to delete order', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const paramsPromise = await params;

  try {
    await testConnection();

    const body = await request.json();

    // Validate request body
    const validatedData = UpdateOrderStatusSchema.parse(body);

    // Find the order
    const order = await Orders.findByPk(paramsPromise.id);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Update the status
    await order.update({ status: validatedData.status });

    // Fetch updated order with relations
    const updatedOrder = await Orders.findByPk(paramsPromise.id, {
      include: [
        {
          model: Buyer,
          as: 'buyer'
        },
        {
          model: User,
          as: 'user'
        },
        {
          model: OrderProfile,
          as: 'orderProfiles'
        }
      ]
    });

    return sendResponse(updatedOrder, 'Order status updated successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(
        'Invalid status value. Must be 0 (Pending), 1 (Processing), or 2 (Completed)',
        400
      );
    }
    return errorResponse(error.message || 'Failed to update order status', 500);
  }
}
