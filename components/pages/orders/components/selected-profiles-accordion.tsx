'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { calculateTeethCost } from '@/utils/calculationHelper';
import { OrderProfilesRecord } from '@/schemas/create-order.schema';

interface SelectedProfilesAccordionProps {
  selectedProfiles: OrderProfilesRecord[];
  profiles: OrderProfilesRecord[];
}

export function SelectedProfilesAccordion({
  selectedProfiles,
  profiles
}: SelectedProfilesAccordionProps) {

  if (selectedProfiles.length === 0 && profiles.length === 0) return null;

  const mergedProfiles = [...selectedProfiles, ...profiles];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Selected Profiles</h3>
      <Accordion type="multiple" className="space-y-2">
        {mergedProfiles.map((profile) => (
          <AccordionItem key={profile.id} value={profile?.id || ''}>
            <AccordionTrigger className="text-sm font-medium">{profile.name} {profile.group_by ? `(${profile.group_by})` : ''}</AccordionTrigger>
            <AccordionContent>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Material
                    </p>
                    <p className="text-sm font-medium">{profile.material}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Teeth
                    </p>
                    <p className="text-sm font-medium">{profile.no_of_teeth}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Rate
                    </p>
                    <p className="text-sm font-medium">₹{profile.rate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Face
                    </p>
                    <p className="text-sm font-medium">{Number(profile.face)?.toFixed(1)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Module
                    </p>
                    <p className="text-sm font-medium">{Number(profile.module)?.toFixed(1)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Burning Weight
                    </p>
                    <p className="text-sm font-medium">{profile.burning_weight} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Weight (B.W + M.W)
                    </p>
                    <p className="text-sm font-medium">{profile.total_weight} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      HT Cost
                    </p>
                    <p className="text-sm font-medium">₹{profile.ht_cost}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      HT Rate
                    </p>
                    <p className="text-sm font-medium">₹{profile.ht_rate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      TC+TG Cost
                    </p>
                    <p className="text-sm font-medium">
                      ₹
                      {calculateTeethCost(
                        profile.no_of_teeth,
                        profile.module,
                        profile.face,
                        profile.rate
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Cyn Grinding
                    </p>
                    <p className="text-sm font-medium">₹{profile.cyn_grinding}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Total
                    </p>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ₹{profile.total}
                    </p>
                  </div>
                </div>

                {/* Inventory Details Section */}
                {profile.inventory && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Inventory Details
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Material Type
                        </p>
                        <p className="text-sm font-medium">{profile.inventory.material_type}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Material Weight
                        </p>
                        <p className="text-sm font-medium">{profile.inventory.material_weight} kg</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Dimensions
                        </p>
                        <p className="text-sm font-medium">{profile.inventory.outer_diameter} mm x {profile.inventory.length} mm</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Rate
                        </p>
                        <p className="text-sm font-medium">₹{profile.inventory.rate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Total Cost
                        </p>
                        <p className="text-sm font-medium">₹{(profile.inventory.material_weight * profile.inventory.rate).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {profile.finish_size && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Finish Size
                    </p>
                    <p className="text-sm font-medium">{profile.finish_size}</p>
                  </div>
                )}

                {/* Additional Processes inline with grid */}
                {profile.processes && profile.processes.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-3 gap-4">
                      {profile.processes.map((p, i) => (
                        <div key={i} className="space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {p.name}
                          </p>
                          <p className="text-sm font-medium">₹{p.cost}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}
