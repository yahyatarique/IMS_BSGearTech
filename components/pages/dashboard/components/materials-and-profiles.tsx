import Link from 'next/link';
import { Package, Layers, IndianRupee, Ruler } from 'lucide-react';
import { DashboardCard } from '@/components/pages/dashboard/components/dashboard-card';
import { Badge } from '@/components/ui/badge';
import { fetchDashboardMaterials, fetchDashboardProfileTypes } from '@/services/dashboard';

const PROFILE_BADGE_CLASS = 'bg-blue-500/10 text-blue-700 dark:text-blue-500 border-blue-500/20';

const rateFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

export async function MaterialsAndProfiles() {
  const [materialsResponse, profileTypesResponse] = await Promise.all([
    fetchDashboardMaterials({ limit: 4 }),
    fetchDashboardProfileTypes({ limit: 4 })
  ]);

  const materials = materialsResponse.data?.data ?? [];
  const profiles = profileTypesResponse.data?.data ?? [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DashboardCard
        title="Materials"
        description="Raw material inventory overview"
        icon={Package}
        gradient="from-green-500 to-emerald-500"
        action={
          <Link
            href="/inventory?tab=materials"
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

          {materials.map((material) => (
            <div
              key={material.id}
              className="rounded-lg border bg-white p-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {material.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{material.type}</p>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  Dimensions: {material.dimensions}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    Rate: {rateFormatter.format(material.rate)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Weight: {material.weight} {material.unit}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  {material.profileCount} {material.profileCount === 1 ? 'profile' : 'profiles'} using this material
                </p>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Profile Types"
        description="Product profiles and gears"
        icon={Layers}
        gradient="from-orange-500 to-red-500"
        action={
          <Link
            href="/inventory?tab=profiles"
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

          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-lg border bg-white p-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {profile.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    Finish Size: {profile.specification}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    Material:{profile.materialDimensions}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    Total: {rateFormatter.format(profile.total)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={PROFILE_BADGE_CLASS}>
                    {profile.material}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {profile.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
