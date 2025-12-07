import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Buyer, Orders, OrderProfile } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';
import { Op } from 'sequelize';
import { DashboardStatsQuerySchema } from '@/schemas/dashboard.schema';
import sequelize from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = DashboardStatsQuerySchema.safeParse(query);

    if (!parsedQuery.   success) {
      return errorResponse('Invalid query parameters', 400, parsedQuery.error.flatten());
    }

    // Get current date and first day of current month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Total Orders (all time and current month)
    const [totalOrders, currentMonthOrders, previousMonthOrders] = await Promise.all([
      Orders.count(),
      Orders.count({
        where: {
          created_at: {
            [Op.gte]: currentMonthStart
          }
        }
      }),
      Orders.count({
        where: {
          created_at: {
            [Op.between]: [previousMonthStart, previousMonthEnd]
          }
        }
      })
    ]);

    // Calculate orders percentage change
    const ordersPercentageChange = previousMonthOrders === 0 
      ? (currentMonthOrders > 0 ? 100 : 0)
      : ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100;

    // Active Buyers (buyers with status 'active')
    const [totalActiveBuyers, currentMonthBuyers, previousMonthBuyers] = await Promise.all([
      Buyer.count({
        where: {
          status: 'active'
        }
      }),
      Buyer.count({
        where: {
          status: 'active',
          created_at: {
            [Op.gte]: currentMonthStart
          }
        }
      }),
      Buyer.count({
        where: {
          status: 'active',
          created_at: {
            [Op.between]: [previousMonthStart, previousMonthEnd]
          }
        }
      })
    ]);

    // Calculate buyers percentage change
    const buyersPercentageChange = previousMonthBuyers === 0 
      ? (currentMonthBuyers > 0 ? 100 : 0)
      : ((currentMonthBuyers - previousMonthBuyers) / previousMonthBuyers) * 100;

    // Total Burning Wastage (from completed orders only)
    // Calculate sum of burning_weight from all order profiles in completed orders
    const [totalBurningWastageResult, currentMonthBurningResult, previousMonthBurningResult] = await Promise.all([
      OrderProfile.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('burning_weight')), 'total']],
        include: [{
          model: Orders,
          as: 'order',
          where: { status: '2' }, // Only completed orders
          attributes: []
        }],
        raw: true
      }),
      OrderProfile.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('burning_weight')), 'total']],
        include: [{
          model: Orders,
          as: 'order',
          where: {
            status: '2',
            created_at: {
              [Op.gte]: currentMonthStart
            }
          },
          attributes: []
        }],
        raw: true
      }),
      OrderProfile.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('burning_weight')), 'total']],
        include: [{
          model: Orders,
          as: 'order',
          where: {
            status: '2',
            created_at: {
              [Op.between]: [previousMonthStart, previousMonthEnd]
            }
          },
          attributes: []
        }],
        raw: true
      })
    ]);

    const totalBurningWastage = Number((totalBurningWastageResult as any)?.total || 0);
    const currentMonthBurningWastage = Number((currentMonthBurningResult as any)?.total || 0);
    const previousMonthBurningWastage = Number((previousMonthBurningResult as any)?.total || 0);

    const burningWastagePercentageChange = previousMonthBurningWastage === 0
      ? (currentMonthBurningWastage > 0 ? 100 : 0)
      : ((currentMonthBurningWastage - previousMonthBurningWastage) / previousMonthBurningWastage) * 100;

    const stats = {
      orders: {
        total: totalOrders,
        percentageChange: parseFloat(ordersPercentageChange.toFixed(1)),
        isPositive: ordersPercentageChange >= 0,
        currentMonth: currentMonthOrders,
        previousMonth: previousMonthOrders
      },
      buyers: {
        total: totalActiveBuyers,
        percentageChange: parseFloat(buyersPercentageChange.toFixed(1)),
        isPositive: buyersPercentageChange >= 0,
        currentMonth: currentMonthBuyers,
        previousMonth: previousMonthBuyers
      },
      burningWastage: {
        total: parseFloat(totalBurningWastage.toFixed(2)),
        percentageChange: parseFloat(burningWastagePercentageChange.toFixed(1)),
        isPositive: burningWastagePercentageChange >= 0,
        currentMonth: parseFloat(currentMonthBurningWastage.toFixed(2)),
        previousMonth: parseFloat(previousMonthBurningWastage.toFixed(2))
      }
    };

    return sendResponse(stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse('Failed to retrieve dashboard stats', 500);
  }
}

