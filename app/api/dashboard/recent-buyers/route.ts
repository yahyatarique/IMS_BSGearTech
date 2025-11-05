import { NextRequest } from 'next/server';
import { testConnection } from '@/db/connection';
import { Buyer, Orders } from '@/db/models';
import { errorResponse, sendResponse } from '@/utils/api-response';
import sequelize from '@/db/connection';
import { DashboardRecentBuyersQuerySchema } from '@/schemas/dashboard.schema';

export async function GET(request: NextRequest) {
  try {
    // Ensure database connection
    await testConnection();

    const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = DashboardRecentBuyersQuerySchema.safeParse(rawQuery);

    if (!parsedQuery.success) {
      return errorResponse('Invalid query parameters', 400, parsedQuery.error.flatten());
    }

    const limit = parsedQuery.data.limit ?? 5;

    // Get last 5 recent buyers with their total orders
    const recentBuyers = await Buyer.findAll({
      limit,
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
      const contactDetails = (buyer.contact_details ?? {}) as Record<string, any>;

      return {
        id: buyer.id,
        name: buyer.name,
        company: buyer.org_name,
        email: typeof contactDetails.email === 'string' ? contactDetails.email : '',
        phone: typeof contactDetails.phone === 'string' ? contactDetails.phone : '',
        location: buyer.org_address,
        totalOrders: parseInt(buyerData.totalOrders) || 0,
        status: buyer.status,
        addedDate:
          buyer.created_at instanceof Date
            ? buyer.created_at.toISOString()
            : new Date(buyer.created_at).toISOString()
      };
    });

    return sendResponse(formattedBuyers, 'Recent buyers retrieved successfully');
  } catch (error) {
    console.error('Recent buyers error:', error);
    return errorResponse('Failed to retrieve recent buyers', 500);
  }
}
