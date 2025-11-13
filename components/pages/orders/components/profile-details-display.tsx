import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { ProfileRecord } from '@/services/types/profile.api.type';
import { PROFILE_TYPES } from '../../../../enums/material.enum';

interface ProfileDetailsDisplayProps {
  profile: ProfileRecord;
}

export const ProfileDetailsDisplay = memo(({ profile }: ProfileDetailsDisplayProps) => (
  <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
    <h3 className="text-lg font-semibold mb-4">Profile Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
      <div>
        <p className="text-muted-foreground">Name</p>
        <p className="font-semibold">{profile.name}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Type</p>
        <p className="font-semibold">{profile.type === PROFILE_TYPES.GEAR ? 'Gear' : 'Pinion'}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Material</p>
        <p className="font-semibold">{profile.material}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Material Rate</p>
        <p className="font-semibold">₹{Number(profile.material_rate)?.toFixed(2)}/kg</p>
      </div>
      <div>
        <p className="text-muted-foreground">Cut Size (W × H)</p>
        <p className="font-semibold">
          {Number(profile.cut_size_width_mm)?.toFixed(2)} × {Number(profile.cut_size_height_mm)?.toFixed(2)} mm
        </p>
      </div>
      <div>
        <p className="text-muted-foreground">Burning Wastage</p>
        <p className="font-semibold">{Number(profile.burning_wastage_percent)?.toFixed(2)}%</p>
      </div>
      <div>
        <p className="text-muted-foreground">HT Rate</p>
        <p className="font-semibold">₹{Number(profile.heat_treatment_rate)?.toFixed(2)}/kg</p>
      </div>
      <div>
        <p className="text-muted-foreground">HT Inefficacy</p>
        <p className="font-semibold">{Number(profile.heat_treatment_inefficacy_percent)?.toFixed(2)}%</p>
      </div>
    </div>
  </Card>
));

ProfileDetailsDisplay.displayName = 'ProfileDetailsDisplay';
