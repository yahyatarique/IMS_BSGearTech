'use client'

import { DashboardCard } from './dashboard-cards'
import { ShoppingCart, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  orderNumber: string
  buyer: string
  material: string
  quantity: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  date: string
  amount: number
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    buyer: 'ABC Manufacturing',
    material: 'Steel Gear 20mm',
    quantity: 500,
    status: 'completed',
    date: '2024-11-05',
    amount: 45000
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    buyer: 'XYZ Industries',
    material: 'Aluminum Profile Type-A',
    quantity: 1000,
    status: 'processing',
    date: '2024-11-04',
    amount: 78000
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    buyer: 'Tech Solutions Ltd',
    material: 'Brass Gear 15mm',
    quantity: 250,
    status: 'pending',
    date: '2024-11-03',
    amount: 32000
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    buyer: 'Mega Corp',
    material: 'Steel Profile Type-B',
    quantity: 750,
    status: 'completed',
    date: '2024-11-02',
    amount: 95000
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    buyer: 'Prime Industries',
    material: 'Titanium Gear 25mm',
    quantity: 300,
    status: 'processing',
    date: '2024-11-01',
    amount: 125000
  }
]

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20', icon: Clock },
  processing: { label: 'Processing', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-500 border-blue-500/20', icon: ShoppingCart },
  completed: { label: 'Completed', className: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20', icon: XCircle }
}

export function RecentOrders() {
  return (
    <DashboardCard
      title="Recent Orders"
      description="Last 5 orders placed"
      icon={ShoppingCart}
      gradient="from-blue-500 to-cyan-500"
      action={
        <Button variant="ghost" size="sm" className="text-sm">
          View All
        </Button>
      }
    >
      <div className="space-y-3">
        {mockOrders.map((order) => {
          const statusInfo = statusConfig[order.status]
          const StatusIcon = statusInfo.icon
          
          return (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{order.orderNumber}</p>
                  <Badge className={statusInfo.className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{order.buyer}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {order.material} • Qty: {order.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  ₹{order.amount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{order.date}</p>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}
