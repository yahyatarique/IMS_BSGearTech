## Purpose
Short, focused instructions to help an AI code agent be productive in this repository.

## High-level architecture (what to know first)
- This is a Next.js (App Router) TypeScript frontend and API in one repo (see `app/` and `api/`).
- Server-side data layer uses Sequelize + Postgres. DB connection helper: `db/connection.ts`.
- Models live under `db/models/` (e.g. `db/models/User.ts`) and use Sequelize model hooks (password hashing) and `associate()` for relationships.
- Validation uses Zod (`schemas/*.ts`). JWTs are generated with `jose` in `api/auth/login/route.ts` and stored as httpOnly cookies.
- Client-side API wrapper is `axios/index.ts` (centralized interceptors and token refresh queue). Front-end endpoints are defined in `services/auth.ts`.

## Key files to reference (quick links)
- App entry and layout: `app/page.tsx`, `app/layout.tsx`.
- API routes (examples): `api/auth/login/route.ts`, `api/users/route.ts`, `api/refresh-token/route.ts`.
- DB: `db/connection.ts`, `db/models/*` (e.g. `db/models/User.ts`), `db/migrations/`, `db/seeders/`.
- Validation schemas: `schemas/user.schema.ts` (CreateUserSchema, LoginSchema).
- TypeScript types: `services/types/*.api.type.ts` (API response/request types).
- Role enums: `enums/users.enum.ts` (roles are string values: `'0'|'1'|'2'`).
- Front-end HTTP client: `axios/index.ts` (with token refresh behavior).

## Project-specific conventions and patterns
- **API Response Handling**:
  - ALWAYS use `sendResponse` and `errorResponse` functions from `utils/api-response.ts` in API routes for consistent error handling and response format.
  - Initial limit for pagination APIs is 10 items per page.
  - Example API route pattern:
    ```typescript
    // ✅ Good - using sendResponse and errorResponse
    export async function GET(request: NextRequest) {
      try {
        await testConnection();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        
        const data = await YourModel.findAndCountAll({ limit, offset: (page - 1) * limit });
        
        return sendResponse(data, 'Data retrieved successfully');
      } catch (error: any) {
        return errorResponse(error.message || 'Failed to fetch data', 500);
      }
    }

    // ❌ Bad - directly returning response or not using standard format
    return new Response(JSON.stringify({ data }));
    ```

- **Service Layer Type Safety**:
  - ALWAYS use `BaseResponse<T>` from `services/types/base.api.type.ts` when creating API response types.
  - Define response types in `services/types/*.api.type.ts`.
  - Example:
    ```typescript
    // types/users.api.type.ts
    import { BaseResponse } from './base.api.type';
    
    export interface User {
      id: string;
      name: string;
    }

    export type UsersResponse = BaseResponse<{
      users: User[];
      meta: {
        page: number;
        totalItems: number;
      };
    }>;

    // services/users.ts
    export async function fetchUsers(): Promise<UsersResponse> {
      const response = await axiosInstance.get('/users');
      return response.data;
    }
    ```

- Role values are string enums: `'0'` = super/admin, `'1'` = admin/manager, `'2'` = user. See `enums/users.enum.ts`.
- Passwords are hashed inside the Sequelize model via `beforeCreate` / `beforeUpdate` hooks (see `db/models/User.ts`). Password validation uses an alphanumeric regex in `schemas/user.schema.ts`. Note: Model-level password validation was removed to allow bcrypt hashed passwords (which contain special characters).
- DB calls commonly call `testConnection()` (in `db/connection.ts`) at the start of API handlers to ensure DB reachable.
- **Database transactions**: When mutating the database (INSERT, UPDATE, DELETE operations), ALWAYS use Sequelize transactions to ensure data consistency and enable rollback on errors. Wrap all mutation operations in a transaction block.
- Authorization checks are sometimes implemented using request headers (example: `x-user-role` checked in `api/users/route.ts`). When editing auth, update all routes that rely on that header.
- **Tokens are stored ONLY in httpOnly cookies**: API routes (e.g., `api/auth/login/route.ts`) set `accessToken` and `refreshToken` as httpOnly cookies. Client-side code does NOT store tokens in localStorage. The axios instance (`axios/index.ts`) uses `withCredentials: true` to automatically send cookies with requests and implements a refresh queue for concurrent 401s.
- **Remember Me functionality**: Login supports "Remember Me" checkbox. When checked, refresh token expiry extends from 7 days to 30 days. Access token remains 15 minutes regardless.
- **Styling conventions**:
  - ALWAYS use the `cn()` utility from `lib/utils.ts` for conditional or merged className strings.
  - Never concatenate className strings with template literals or `+` operator.
  - Use Tailwind CSS utility classes; avoid inline styles unless absolutely necessary.
  - Primary color theme: Blue (`primary-*` scale or `blue-*` + `cyan-*` for gradients).
  - Example: `className={cn('base-class', condition && 'conditional-class', props.className)}`
- **Component reusability**:
  - Before creating duplicate UI patterns, check `components/` for reusable components.
  - **Auth wrappers**: Use `AdminWrapper`, `UserWrapper`, or `AuthWrapper` from `components/auth/` for role-based rendering.
  - **UI components**: Use `GradientText`, `GradientBox`, `PageHeader`, `GradientCard`, `GradientBorderCard` from `components/ui/` for consistent gradient styling.
  - **PageWrapper**: ALWAYS use `PageWrapper` from `components/ui/page-wrapper` for all new pages. It provides consistent padding, spacing, and optional header (title, subtitle, icon, actions).
  - **Card-based layouts with event delegation**: Use card grids for list views instead of tables for better mobile responsiveness:
    - Create a card grid component (e.g., `UsersCardGrid`, `BuyersCardGrid`) that displays items as cards
    - Implement **event delegation** by attaching a single click handler to the grid container using `onClick` on the parent div
    - Use `data-*` attributes (e.g., `data-user-id`, `data-buyer-id`) on each card to identify clicked items
    - In the click handler, use `event.target.closest('[data-user-id]')` to find the clicked card
    - Create a details dialog (e.g., `UserDetailsDialog`, `BuyerDetailsDialog`) to show full information when a card is clicked
    - Pattern example:
      ```typescript
      // Card Grid Component with Event Delegation
      const handleGridClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const cardElement = (event.target as HTMLElement).closest('[data-user-id]');
        if (!cardElement) return;
        const userId = cardElement.getAttribute('data-user-id');
        const user = users.find((u) => u.id === userId);
        if (user) onCardClick(user);
      };
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onClick={handleGridClick}>
          {users.map(user => (
            <GradientBorderCard key={user.id} data-user-id={user.id} className="cursor-pointer">
              {/* Card content */}
            </GradientBorderCard>
          ))}
        </div>
      );
      ```
    - Benefits: Single event listener (better performance), cleaner code, easier to maintain
  - **When to create reusable components**: If a pattern (styling, logic, or layout) appears 3+ times, extract it into a reusable component.
  - See `components/README.md` for full documentation on available reusable components.
- **Schema and Type definitions**:
  - **Validation schemas** are defined in the `schemas/` folder using Zod (e.g., `schemas/user.schema.ts`, `schemas/dashboard.schema.ts`).
  - **TypeScript types** for API requests/responses are defined in `services/types/*.api.type.ts` (e.g., `auth.api.type.ts`, `users.api.type.ts`).
  - When creating new schemas, follow the existing pattern: export Zod schemas and infer TypeScript types from them.
  - When creating new API types, follow the `BaseResponse<T>` pattern from `services/types/base.api.type.ts`.
  - NEVER define schemas or types inline in components or API routes—always create them in the appropriate folder.
- **Form patterns**:
  - ALWAYS use React Hook Form with `FormField`, `FormItem`, `FormLabel`, `FormControl`, and `FormMessage` components from `components/ui/form.tsx`.
  - NEVER use plain `form.register()` with manual error display.
  - Follow the pattern from `components/pages/auth/login-form.tsx`:
    ```typescript
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
    
    // ✅ Good - use FormField with render prop
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="Enter username" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    // ❌ Bad - don't use form.register() directly
    <div>
      <Label htmlFor="username">Username</Label>
      <Input id="username" {...form.register('username')} />
      {form.formState.errors.username && (
        <p className="text-red-500">{form.formState.errors.username.message}</p>
      )}
    </div>
    ```
  - Benefits: Automatic error handling, better accessibility, consistent styling, easier validation display.

## Build / dev / DB workflows (concrete commands)
- Start dev: `npm run dev` (Next dev server). `package.json` contains `dev`, `build`, `start`, and `lint` scripts.
- Sequelize (local/migration) helper scripts (run from project root):
  - `npm run db:migrate` — run migrations
  - `npm run db:seed` — seed all
  - `npm run db:reset` — undo all migrations then migrate + seed
  - `npm run db:setup` — migrate then seed
- Environment variables you must set locally for auth and DB to work:
  - `DATABASE_URL` (Postgres connection string)
  - `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
  - `NEXT_PUBLIC_BASE_URL` (used by client axios and CORS; defaults to http://localhost:3000, set to https://bsgeartech.yahyatarique.dev in production)

## Editing guidance (concrete examples)
- To add a new API route that uses the DB, follow the pattern in `api/auth/login/route.ts`:
  1. Call `await testConnection()` at the top.
  2. Validate request body using Zod schemas from `schemas/`.
  3. For any database mutations (create, update, delete), wrap operations in a Sequelize transaction:
     ```typescript
     const transaction = await sequelize.transaction();
     try {
       // perform database operations
       await transaction.commit();
     } catch (error) {
       await transaction.rollback();
       throw error;
     }
     ```
  4. Use models from `db/models` (e.g. `User`) and return `NextResponse.json(...)`.
  5. When issuing tokens, follow the `jose` pattern in `api/auth/login/route.ts` and set cookies with `response.cookies.set(...)`.
- To modify role logic: update `enums/users.enum.ts` and adjust checks in routes that read `x-user-role` header (search for `x-user-role` to find all places).
- When changing a model shape, update corresponding migration in `db/migrations/` and run `npm run db:migrate` (or create a new migration).
- **For UI components with conditional classes**:
  ```typescript
  import { cn } from '@/lib/utils'
  
  // ✅ Good - use cn() for conditional classes
  <div className={cn(
    'base-class',
    isActive && 'active-class',
    error && 'error-class',
    props.className
  )}>
  
  // ❌ Bad - don't use template literals
  <div className={`base-class ${isActive ? 'active-class' : ''} ${props.className}`}>
  ```
- **For role-based rendering**:
  ```typescript
  import { AdminWrapper } from '@/components/auth'
  
  // ✅ Good - use wrappers
  <AdminWrapper>
    <AdminOnlyContent />
  </AdminWrapper>
  
  // ❌ Bad - manual checks
  {isAdmin && <AdminOnlyContent />}
  ```
- **For page layout**:
  ```typescript
  import { PageWrapper } from '@/components/ui/page-wrapper'
  import { Users } from 'lucide-react'
  
  // ✅ Good - use PageWrapper for all pages
  <PageWrapper
    title="Buyers Management"
    subtitle="Manage your buyer information and contacts"
    icon={Users}
    gradient="blue-cyan"
    headerActions={<Button>Add Buyer</Button>}
  >
    <YourPageContent />
  </PageWrapper>
  
  // ❌ Bad - manual container/padding
  <div className="container mx-auto px-4 py-6">
    <h1>Buyers Management</h1>
    <YourPageContent />
  </div>
  ```
- **For card-based list views with event delegation**:
  ```typescript
  import { GradientBorderCard } from '@/components/ui/gradient-border-card'
  
  // ✅ Good - use card grid with event delegation
  const handleGridClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const cardElement = (event.target as HTMLElement).closest('[data-buyer-id]');
    if (!cardElement) return;
    const buyerId = cardElement.getAttribute('data-buyer-id');
    const buyer = buyers.find(b => b.id === buyerId);
    if (buyer) onCardClick(buyer);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onClick={handleGridClick}>
      {buyers.map(buyer => (
        <GradientBorderCard 
          key={buyer.id} 
          data-buyer-id={buyer.id}
          className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <h3>{buyer.name}</h3>
          <p>{buyer.org_name}</p>
        </GradientBorderCard>
      ))}
    </div>
  );
  
  // ❌ Bad - individual click handlers on each card
  {buyers.map(buyer => (
    <Card key={buyer.id} onClick={() => handleClick(buyer)}>
      ...
    </Card>
  ))}
  ```
- **For consistent gradient styling**:
  ```typescript
  import { GradientText, PageHeader } from '@/components/ui/...'
  
  // ✅ Good - use reusable components
  <PageHeader title="Dashboard" gradient="primary" icon={Home} />
  <GradientText gradient="blue-cyan">Title</GradientText>
  
  // ❌ Bad - repeated gradient classes
  <h1 className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
  ```

## Integration points & external dependencies
- Postgres accessed through `Sequelize` (`sequelize` package). Migrations use `sequelize-cli`.
- `jose` is used for JWT signing.
- `@supabase/supabase-js` is present in deps (check `db/supabase.ts`) — may be used for secondary services/storage.
- Axios client (`axios/index.ts`) centralizes token handling and is the place to update refresh-handling logic.

## Gotchas & quick checks
- The project uses Next.js App Router (Next 13+/app directory) — use server components and route handlers (route.ts) appropriately.
- Cookies are set as httpOnly in server routes; client code also duplicates tokens in localStorage/cookies — keep these consistent when changing token format.
- `db/connection.ts` enables SSL in dialectOptions; local Postgres setups must support the configured `DATABASE_URL` and SSL flags.
- No test runner configured in `package.json` — add tests carefully and wire a script if you add unit/integration tests.

## Where to look for more context
- Migrations: `db/migrations/` — look at timestamped migration files to understand table schema evolution.
- Seeders: `db/seeders/` — default data and admin user creation.
- Example API handlers: `api/auth/*`, `api/users/route.ts` for patterns on authorization and error handling.

If anything specific feels missing or you want examples adapted for a new task (e.g., adding a specific API, changing auth lifetime, or wiring a new model), tell me which area and I will expand or adjust these instructions.
