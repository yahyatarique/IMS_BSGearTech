'use client'

import { DashboardCard } from './dashboard-cards'
import { Users, Mail, Phone, MapPin } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Buyer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  location: string
  totalOrders: number
  addedDate: string
  status: 'active' | 'inactive'
}

const mockBuyers: Buyer[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    company: 'ABC Manufacturing',
    email: 'rajesh@abcmanufacturing.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    totalOrders: 24,
    addedDate: '2024-11-05',
    status: 'active'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    company: 'XYZ Industries',
    email: 'priya@xyzind.com',
    phone: '+91 98765 43211',
    location: 'Delhi, Delhi',
    totalOrders: 18,
    addedDate: '2024-11-04',
    status: 'active'
  },
  {
    id: '3',
    name: 'Amit Patel',
    company: 'Tech Solutions Ltd',
    email: 'amit@techsolutions.com',
    phone: '+91 98765 43212',
    location: 'Ahmedabad, Gujarat',
    totalOrders: 12,
    addedDate: '2024-11-03',
    status: 'active'
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    company: 'Mega Corp',
    email: 'sneha@megacorp.com',
    phone: '+91 98765 43213',
    location: 'Bangalore, Karnataka',
    totalOrders: 31,
    addedDate: '2024-11-02',
    status: 'active'
  },
  {
    id: '5',
    name: 'Vikram Singh',
    company: 'Prime Industries',
    email: 'vikram@primeindustries.com',
    phone: '+91 98765 43214',
    location: 'Pune, Maharashtra',
    totalOrders: 8,
    addedDate: '2024-11-01',
    status: 'inactive'
  }
]

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const gradients = [
  'from-blue-500 to-cyan-500',
  'from-sky-500 to-blue-600',
  'from-indigo-500 to-blue-500',
  'from-cyan-500 to-teal-500',
  'from-blue-600 to-indigo-600'
]

export function RecentBuyers() {
  return (
    <DashboardCard
      title="Recent Buyers"
      description="Recently added customers"
      icon={Users}
  gradient="from-blue-500 to-cyan-500"
      action={
        <Button variant="ghost" size="sm" className="text-sm">
          View All
        </Button>
      }
    >
      <div className="space-y-3">
        {mockBuyers.map((buyer, index) => (
          <div
            key={buyer.id}
            className="flex items-start gap-4 p-4 rounded-lg border bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-200"
          >
            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-md">
              <AvatarFallback className={`bg-gradient-to-br ${gradients[index % gradients.length]} text-white font-semibold`}>
                {getInitials(buyer.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">{buyer.name}</p>
                <Badge 
                  variant="outline" 
                  className={buyer.status === 'active' 
                    ? 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20' 
                    : 'bg-gray-500/10 text-gray-700 dark:text-gray-500 border-gray-500/20'
                  }
                >
                  {buyer.status}
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{buyer.company}</p>
              
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{buyer.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  <span>{buyer.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  <span>{buyer.location}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {buyer.totalOrders} Orders
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Added {buyer.addedDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
