'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { InlineErrorMessage } from '@/components/ui/error-message';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { User, Calendar, Edit2, Save, X } from 'lucide-react';
import { z } from 'zod';
import { updateProfile, updatePassword } from '@/services/auth';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { useAuth } from '@/contexts/AuthContext';
import { UpdateUserSchema } from '@/schemas/user.schema';
import { UpdatePasswordSchema } from '@/schemas/password.schema';

type ProfileData = z.infer<typeof UpdateUserSchema>;

const roleLabels: Record<string, string> = {
  '0': 'Super Admin',
  '1': 'Admin/Manager',
  '2': 'User'
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isLoading, updateUser: updateAuthUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name,
        lastName: user.last_name
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle password fields separately
    if (['currentPassword', 'newPassword', 'confirmPassword'].includes(name)) {
      setPasswordData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrors({});

    try {
      // Validate profile data
      const validatedData = UpdateUserSchema.parse({
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Call API to update profile
      const response = await updateProfile(validatedData);

      // Update auth context with response
      if (response.data.user) {
        updateAuthUser(response.data.user);
      }

      toast({
        title: 'Success!',
        description: 'Profile updated successfully',
        variant: 'success'
      });

      setIsEditing(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update profile. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setIsUpdatingPassword(true);
    setErrors({});

    try {
      // Validate password data
      const validatedData = UpdatePasswordSchema.parse(passwordData);

      // Call API to update password
      await updatePassword(validatedData);

      toast({
        title: 'Success!',
        description: 'Password updated successfully',
        variant: 'success'
      });

      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else if (err instanceof Error) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to update password',
          variant: 'destructive'
        });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelProfile = () => {
    if (user) {
      setFormData({
        firstName: user.first_name,
        lastName: user.last_name
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleCancelPassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setIsEditingPassword(false);
  };

  const getInitials = () => {
    return `${formData?.firstName?.[0] || ''}${formData?.lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Summary Card */}
          <GradientBorderCard className="border shadow-lg bg-white dark:bg-slate-900">
            <Card className="!border-0 h-full !shadow-none">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg mb-4">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-1">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">@{user.username}</p>
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                    {roleLabels[user.role]}
                  </Badge>

                  <div className="w-full mt-6 pt-6 border-t space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Username: {user.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GradientBorderCard>

          {/* Profile Details Card */}
          <GradientBorderCard className="md:col-span-2 border shadow-lg bg-white dark:bg-slate-900">
            <Card className="!border-0 !shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Personal Information
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && <InlineErrorMessage error={errors.firstName} />}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && <InlineErrorMessage error={errors.lastName} />}
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  {/* <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Address Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="City"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="State"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Zip Code"
                      />
                    </div>
                  </div>
                </div> */}

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-4 pt-4 border-t">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={handleCancelProfile}
                        disabled={isSaving}
                        variant="outline"
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Password Update Section */}
                  <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Change Password
                      </h3>
                      {!isEditingPassword && (
                        <Button
                          onClick={() => setIsEditingPassword(true)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Update Password
                        </Button>
                      )}
                    </div>

                    {isEditingPassword && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handleChange}
                            className={errors.currentPassword ? 'border-red-500' : ''}
                            disabled={isUpdatingPassword}
                          />
                          {errors.currentPassword && (
                            <InlineErrorMessage error={errors.currentPassword} />
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handleChange}
                            className={errors.newPassword ? 'border-red-500' : ''}
                            disabled={isUpdatingPassword}
                          />
                          {errors.newPassword && <InlineErrorMessage error={errors.newPassword} />}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'border-red-500' : ''}
                            disabled={isUpdatingPassword}
                          />
                          {errors.confirmPassword && (
                            <InlineErrorMessage error={errors.confirmPassword} />
                          )}
                        </div>

                        <div className="flex gap-4">
                          <Button
                            onClick={handleUpdatePassword}
                            disabled={isUpdatingPassword}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 gap-2"
                          >
                            <Save className="h-4 w-4" />
                            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                          </Button>
                          <Button
                            onClick={handleCancelPassword}
                            disabled={isUpdatingPassword}
                            variant="outline"
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Info */}
                  <div className="pt-4 border-t space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Account Activity
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Account Created</span>
                      <span className="font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Account Status</span>
                      <span className="font-medium capitalize">{user.status}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GradientBorderCard>
        </div>
      </main>
    </div>
  );
}
