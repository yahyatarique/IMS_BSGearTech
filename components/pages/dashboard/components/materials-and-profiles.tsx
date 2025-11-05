 'use client'

import { DashboardCard } from './dashboard-cards'
import { Package, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Material {
  id: string
  name: string
  type: string
  stock: number
  unit: string
  reorderLevel: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

interface ProfileType {
  id: string
  name: string
  specification: string
  material: string
  inStock: number
  reserved: number
}

const mockMaterials: Material[] = [
  {
    id: '1',
    name: 'Steel Grade 304',
    type: 'Raw Material',
    stock: 5000,
    unit: 'kg',
    reorderLevel: 1000,
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Aluminum 6061',
    type: 'Raw Material',
    stock: 850,
    unit: 'kg',
    reorderLevel: 1000,
    status: 'low-stock'
  },
  {
    id: '3',
    name: 'Brass C360',
    type: 'Raw Material',
    stock: 2500,
    unit: 'kg',
    reorderLevel: 500,
    status: 'in-stock'
  },
  {
    id: '4',
    name: 'Titanium Grade 5',
    type: 'Raw Material',
    stock: 0,
    unit: 'kg',
    reorderLevel: 200,
    status: 'out-of-stock'
  }
]

const mockProfiles: ProfileType[] = [
  {
    id: '1',
    name: 'Gear Type-A',
    specification: '20mm diameter, 10 teeth',
    material: 'Steel Grade 304',
    inStock: 1200,
    reserved: 300
  },
  {
    id: '2',
    name: 'Profile Type-B',
    specification: '25mm × 50mm rectangular',
    material: 'Aluminum 6061',
    inStock: 800,
    reserved: 150
  },
  {
    id: '3',
    name: 'Gear Type-C',
    specification: '15mm diameter, 8 teeth',
    material: 'Brass C360',
    inStock: 950,
    reserved: 200
  },
  {
    id: '4',
    name: 'Custom Profile X',
    specification: '30mm circular, custom cut',
    material: 'Titanium Grade 5',
    inStock: 450,
    reserved: 100
  }
]

const statusConfig = {
  'in-stock': { label: 'In Stock', className: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20' },
  'low-stock': { label: 'Low Stock', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20' },
  'out-of-stock': { label: 'Out of Stock', className: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20' }
}

export function MaterialsAndProfiles() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Materials */}
      <DashboardCard
        title="Materials"
        description="Raw material inventory"
        icon={Package}
        gradient="from-green-500 to-emerald-500"
        action={
          <Button variant="ghost" size="sm" className="text-sm">
            Manage
          </Button>
        }
      >
        <div className="space-y-2">
          {mockMaterials.map((material) => {
            const statusInfo = statusConfig[material.status]
            const stockPercentage = (material.stock / (material.reorderLevel * 5)) * 100
            
            return (
              <div
                key={material.id}
                className="p-3 rounded-lg border bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{material.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{material.type}</p>
                  </div>
                  <Badge className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Stock: <span className="font-semibold text-slate-900 dark:text-white">{material.stock} {material.unit}</span>
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Reorder: {material.reorderLevel} {material.unit}
                  </span>
                </div>
                
                {/* Stock level bar */}
                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      material.status === 'in-stock' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : material.status === 'low-stock'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </DashboardCard>

      {/* Profile Types */}
      <DashboardCard
        title="Profile Types"
        description="Product profiles & gears"
        icon={Layers}
        gradient="from-orange-500 to-red-500"
        action={
          <Button variant="ghost" size="sm" className="text-sm">
            Manage
          </Button>
        }
      >
        <div className="space-y-2">
          {mockProfiles.map((profile) => {
            const available = profile.inStock - profile.reserved
            const availabilityPercentage = (available / profile.inStock) * 100
            
            return (
              <div
                key={profile.id}
                className="p-3 rounded-lg border bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{profile.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{profile.specification}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-500 border-blue-500/20">
                    {profile.material.split(' ')[0]}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">In Stock</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{profile.inStock}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Reserved</p>
                    <p className="font-semibold text-sm text-orange-600 dark:text-orange-500">{profile.reserved}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Available</p>
                    <p className="font-semibold text-sm text-green-600 dark:text-green-500">{available}</p>
                  </div>
                </div>
                
                {/* Availability bar */}
                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${availabilityPercentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </DashboardCard>
    </div>
  )
}
