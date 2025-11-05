import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Orders, Buyer } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';
import { DashboardRecentOrdersQuerySchema } from '@/schemas/dashboard.schema';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = DashboardRecentOrdersQuerySchema.safeParse(rawQuery);

    if (!parsedQuery.success) {
      return errorResponse('Invalid query parameters', 400, parsedQuery.error.flatten());
    }

    const limit = parsedQuery.data.limit ?? 5;

    // Get last 5 recent orders with buyer information
    const recentOrders = await Orders.findAll({
      limit,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Buyer,
          as: 'buyer',
          attributes: ['id', 'name', 'org_name']
        }
      ]
    });

    // Transform the data
    const formattedOrders = recentOrders.map(order => {
      const orderData = order.get({ plain: true }) as any;
      
      return {
        id: order.id,
        orderNumber: order.order_number,
        buyer: orderData.buyer ? {
          id: orderData.buyer.id,
          name: orderData.buyer.name,
          company: orderData.buyer.org_name
        } : null,
        amount: parseFloat(order.total_order_value.toString()),
        status: order.status,
        date: order.created_at instanceof Date ? order.created_at.toISOString() : new Date(order.created_at).toISOString(),
        statusLabel: getStatusLabel(order.status)
      };
    });

    return sendResponse(formattedOrders, 'Recent orders retrieved successfully');
  } catch (error) {
    console.error('Recent orders error:', error);
    return errorResponse('Failed to retrieve recent orders', 500);
  }
}

function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    '0': 'Pending',
    '1': 'Processing',
    '2': 'Completed',
    '3': 'Cancelled',
    '4': 'On Hold'
  };
  return statusMap[status] || 'Unknown';
}

