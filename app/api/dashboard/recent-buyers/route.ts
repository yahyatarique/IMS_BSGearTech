import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Buyer, Orders } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    // Get last 5 recent buyers with their total orders
    const recentBuyers = await Buyer.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Orders,
          as: 'orders',
          attributes: []
        }
      ],
      attributes: {
        include: [
          [
            sequelize.fn('COUNT', sequelize.col('orders.id')),
            'totalOrders'
          ]
        ]
      },
      group: ['Buyer.id'],
      subQuery: false
    });

    // Transform the data
    const formattedBuyers = recentBuyers.map(buyer => {
      const buyerData = buyer.get({ plain: true }) as any;
      
      return {
        id: buyer.id,
        name: buyer.name,
        company: buyer.org_name,
        email: (buyer.contact_details as any)?.email || '',
        phone: (buyer.contact_details as any)?.phone || '',
        location: buyer.org_address,
        totalOrders: parseInt(buyerData.totalOrders) || 0,
        status: buyer.status,
        addedDate: buyer.created_at
      };
    });

    return sendResponse(formattedBuyers, 'Recent buyers retrieved successfully');
  } catch (error) {
    console.error('Recent buyers error:', error);
    return errorResponse('Failed to retrieve recent buyers', 500);
  }
}
