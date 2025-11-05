import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Buyer, OrderProfile, Orders } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';
import { Op } from 'sequelize';
import { DashboardStatsQuerySchema } from '@/schemas/dashboard.schema';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = DashboardStatsQuerySchema.safeParse(query);

    if (!parsedQuery.success) {
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

    // Total Products (calculated from order profiles activity)
    const [totalProducts, currentMonthProducts, previousMonthProducts] = await Promise.all([
      OrderProfile.count(),
      OrderProfile.count({
        where: {
          created_at: {
            [Op.gte]: currentMonthStart
          }
        }
      }),
      OrderProfile.count({
        where: {
          created_at: {
            [Op.between]: [previousMonthStart, previousMonthEnd]
          }
        }
      })
    ]);

    const productsPercentageChange = previousMonthProducts === 0
      ? (currentMonthProducts > 0 ? 100 : 0)
      : ((currentMonthProducts - previousMonthProducts) / previousMonthProducts) * 100;

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
      products: {
        total: totalProducts,
        percentageChange: parseFloat(productsPercentageChange.toFixed(1)),
        isPositive: productsPercentageChange >= 0,
        currentMonth: currentMonthProducts,
        previousMonth: previousMonthProducts
      }
    };

    return sendResponse(stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse('Failed to retrieve dashboard stats', 500);
  }
}

