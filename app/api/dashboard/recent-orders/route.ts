import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Orders, Buyer } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    // Get last 5 recent orders with buyer information
    const recentOrders = await Orders.findAll({
      limit: 5,
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
        date: order.created_at,
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

