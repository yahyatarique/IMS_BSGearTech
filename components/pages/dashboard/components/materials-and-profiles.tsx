import Link from 'next/link'
import { Package, Layers } from 'lucide-react'
import { DashboardCard } from '@/components/pages/dashboard/components/dashboard-card'
import { Badge } from '@/components/ui/badge'
import { fetchDashboardMaterials, fetchDashboardProfileTypes } from '@/services/dashboard'
import { cn } from '@/lib/utils'

const MATERIAL_STATUS: Record<string, { label: string; className: string }> = {
  'in-stock': {
    label: 'In Stock',
    className: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20',
  },
  'low-stock': {
    label: 'Low Stock',
    className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    className: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20',
  },
}

const PROFILE_BADGE_CLASS = 'bg-blue-500/10 text-blue-700 dark:text-blue-500 border-blue-500/20'

const quantityFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
})

const rateFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function resolveMaterialStatus(status: string) {
  return MATERIAL_STATUS[status] ?? MATERIAL_STATUS['low-stock']
}

function calculateStockFill(stock: number, reorderLevel: number) {
  if (stock <= 0) {
    return 0
  }

  const target = reorderLevel > 0 ? reorderLevel * 1.4 : stock
  const ratio = stock / target
  return Math.min(Math.round(ratio * 100), 100)
}

function calculateAvailabilityFill(inStock: number, reserved: number) {
  if (inStock <= 0) {
    return 0
  }

  const available = Math.max(inStock - reserved, 0)
  const ratio = available / inStock
  return Math.min(Math.round(ratio * 100), 100)
}

export async function MaterialsAndProfiles() {
  const [materialsResponse, profileTypesResponse] = await Promise.all([
    fetchDashboardMaterials({ limit: 4 }),
    fetchDashboardProfileTypes({ limit: 4 }),
  ])

  const materials = materialsResponse.data?.data ?? []
  const profiles = profileTypesResponse.data?.data ?? []

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DashboardCard
        title="Materials"
        description="Raw material inventory overview"
        icon={Package}
        gradient="from-green-500 to-emerald-500"
        action={
          <Link
            href="#"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Manage
          </Link>
        }
      >
        <div className="space-y-2">
          {materials.length === 0 && (
            <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              No materials recorded yet.
            </div>
          )}

          {materials.map((material) => {
            const status = resolveMaterialStatus(material.status)
            const stockFill = calculateStockFill(material.stock, material.reorderLevel)

            return (
              <div
                key={material.id}
                className="rounded-lg border bg-white p-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {material.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {material.type}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Avg rate {rateFormatter.format(material.averageRate)} · {material.profileCount}{' '}
                      profiles
                    </p>
                  </div>
                  <Badge className={status.className}>{status.label}</Badge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Stock:{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {quantityFormatter.format(material.stock)} {material.unit}
                    </span>
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Reorder: {quantityFormatter.format(material.reorderLevel)} {material.unit}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      material.status === 'in-stock' && 'bg-gradient-to-r from-green-500 to-emerald-500',
                      material.status === 'low-stock' && 'bg-gradient-to-r from-yellow-500 to-orange-500',
                      material.status === 'out-of-stock' && 'bg-gradient-to-r from-red-500 to-red-600',
                    )}
                    style={{ width: `${stockFill}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Min ₹{quantityFormatter.format(Math.round(material.minRate))}</span>
                  <span>Max ₹{quantityFormatter.format(Math.round(material.maxRate))}</span>
                </div>
              </div>
            )
          })}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Profile Types"
        description="Product profiles and gears"
        icon={Layers}
        gradient="from-orange-500 to-red-500"
        action={
          <Link
            href="#"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Manage
          </Link>
        }
      >
        <div className="space-y-2">
          {profiles.length === 0 && (
            <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              No profile types configured yet.
            </div>
          )}

          {profiles.map((profile) => {
            const availabilityFill = calculateAvailabilityFill(profile.inStock, profile.reserved)
            const available = Math.max(profile.inStock - profile.reserved, 0)

            return (
              <div
                key={profile.id}
                className="rounded-lg border bg-white p-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {profile.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {profile.specification}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      HT Rate {rateFormatter.format(profile.heatTreatmentRate)} · Wastage{' '}
                      {profile.burningWastagePercent}%
                    </p>
                  </div>
                  <Badge variant="outline" className={PROFILE_BADGE_CLASS}>
                    {profile.material}
                  </Badge>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">In Stock</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {quantityFormatter.format(profile.inStock)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Reserved</p>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-500">
                      {quantityFormatter.format(profile.reserved)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Available</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-500">
                      {quantityFormatter.format(available)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${availabilityFill}%` }}
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
