# Reusable Components Documentation

## Auth Wrappers

### AdminWrapper
Conditionally renders content based on admin role.

```tsx
import { AdminWrapper } from '@/components/auth'

// Only admins (Super Admin or Admin) can see this
<AdminWrapper>
  <button>Admin Only Button</button>
</AdminWrapper>

// Only Super Admin can see this
<AdminWrapper allowSuperAdminOnly>
  <button>Super Admin Only</button>
</AdminWrapper>

// With fallback content for non-admins
<AdminWrapper fallback={<p>Access Denied</p>}>
  <AdminPanel />
</AdminWrapper>
```

### UserWrapper
Conditionally renders content based on user role.

```tsx
import { UserWrapper } from '@/components/auth'

// Only regular users can see this
<UserWrapper>
  <UserDashboard />
</UserWrapper>

// Allow admins to see too
<UserWrapper allowAdmins>
  <SharedContent />
</UserWrapper>
```

### AuthWrapper
Handles authentication state and redirects.

```tsx
import { AuthWrapper } from '@/components/auth'

// Requires authentication, redirects to login if not authenticated
<AuthWrapper>
  <ProtectedContent />
</AuthWrapper>

// Optional authentication
<AuthWrapper requireAuth={false}>
  <PublicContent />
</AuthWrapper>
```

## UI Components

### GradientText
Reusable gradient text component.

```tsx
import { GradientText } from '@/components/ui/gradient-text'

<GradientText gradient="primary">
  Welcome Back, Admin
</GradientText>

<GradientText gradient="blue-cyan" className="text-2xl">
  Dashboard
</GradientText>
```

Available gradients:
- `primary` - Primary blue to cyan
- `blue-cyan` - Blue to cyan
- `green` - Green to emerald
- `orange` - Orange to red
- `custom` - Use with `customGradient` prop

### GradientBox
Reusable gradient background/border component.

```tsx
import { GradientBox } from '@/components/ui/gradient-box'

// Icon background
<GradientBox gradient="primary" variant="icon" className="p-2 rounded-lg">
  <Icon className="h-5 w-5 text-white" />
</GradientBox>

// Top border
<GradientBox gradient="blue-cyan" variant="border" className="h-1" />

// Background
<GradientBox gradient="green" variant="background" className="p-4">
  Content
</GradientBox>
```

### PageHeader
Reusable page header with gradient title.

```tsx
import { PageHeader } from '@/components/ui/page-layout'
import { Users } from 'lucide-react'

<PageHeader
  title="User Management"
  description="Manage users and permissions"
  icon={Users}
  gradient="primary"
  action={<Button>Add User</Button>}
/>
```

### GradientCard
Reusable card with gradient border and icon.

```tsx
import { GradientCard } from '@/components/ui/page-layout'
import { Package } from 'lucide-react'

<GradientCard
  title="Inventory"
  description="Current stock levels"
  icon={Package}
  gradient="green"
  action={<Button>View All</Button>}
>
  <InventoryList />
</GradientCard>
```

## Usage Examples

### Protected Admin Page
```tsx
import { AdminWrapper } from '@/components/auth'
import { PageHeader } from '@/components/ui/page-layout'
import { Users } from 'lucide-react'

export default function UsersPage() {
  return (
    <AdminWrapper fallback={<AccessDenied />}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <main className="container mx-auto px-4 py-8">
          <PageHeader
            title="User Management"
            description="Manage system users"
            icon={Users}
            gradient="primary"
          />
          <UsersList />
        </main>
      </div>
    </AdminWrapper>
  )
}
```

### Consistent Gradient Styling
Instead of:
```tsx
<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
  Title
</h1>
```

Use:
```tsx
<GradientText gradient="blue-cyan" className="text-3xl">
  Title
</GradientText>
```

## Benefits

1. **Consistency**: Centralized styling means consistent look across the app
2. **Maintainability**: Change gradient colors in one place
3. **Type Safety**: TypeScript ensures correct prop usage
4. **DRY Principle**: Don't repeat gradient classes everywhere
5. **Easier Refactoring**: Update component logic without touching every page
6. **Role-Based Access**: Easy to control what users see based on permissions
