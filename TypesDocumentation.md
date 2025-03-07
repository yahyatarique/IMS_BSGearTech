# Types Documentation

This document describes the TypeScript types and interfaces used for the project.

---

## General Types

### `UserRole`

Represents the role of a user in the system.

```tsx
type UserRole = 'SuperAdmin' | 'Admin';

```

### `OrderStatus`

Represents the various statuses an order can have.

```tsx
type OrderStatus = 'Draft' | 'Accepted' | 'RawMaterialFinalized' | 'In Process' | 'Pending Fulfillment' | 'Pending Payment' | 'Dispatched';

```

### `ProcessType`

Represents the types of processes involved in manufacturing.

```tsx
type ProcessType = 'Milling' | 'Fitting' | 'Keyway' | 'Cylindrical Grinding' | 'Internal Grinding';

```

### `ProfileType`

Represents the type of order profile (e.g., Pinion or Gear).

```tsx
type ProfileType = 'Pinion' | 'Gear';

```

### `MaterialType`

Represents the type of materials used in manufacturing.

```tsx
type MaterialType = 'CR-5' | 'EN-9';

```

### `Dimensions`

Represents the dimensions of a material or profile.

```tsx
interface Dimensions {
  width: number; // in mm
  height: number; // in mm
}

```

### `ContactDetails`

Represents contact information for a buyer or organization.

```tsx
interface ContactDetails {
  contactName: string;
  mobile: string;
}

```

---

## Buyer Types

### `Buyer`

Represents a buyer in the system.

```tsx
interface Buyer {
  id: string;
  name: string;
  contactDetails: ContactDetails;
  gstNumber?: string;
  panNumber?: string;
  tinNumber?: string;
  orgName: string;
  orgAddress: string;
}

```

---

## Order Profile Types

### `OrderProfile`

Represents an order profile with its specifications.

```tsx
interface OrderProfile {
  id: string;
  name: string;
  type: ProfileType;
  material: MaterialType;
  materialRate: number; // in INR/mm
  cutSize: Dimensions;
  burningWastage: number; // as percentage
  heatTreatmentRate: number; // in INR/kg
  heatTreatmentInefficacy: number; // as percentage
  availableInventory: number; // in units
}

```

---

## Order Types

### `Order`

Represents an order in the system with its associated details.

```tsx
interface Order {
  id: string;
  orderNumber: string;
  createdAt: Date;
  buyerId: string;
  profiles: OrderProfile[];
  status: OrderStatus;
  grandTotal: number; // in INR
  materialCost: number; // in INR
  processCosts: number; // in INR
  turningRate: number; // in INR
  teethCount: number;
  module: number;
  face: number;
  weight: number; // in kg
  htCost: number; // in INR
  totalOrderValue: number; // in INR
  profitMargin: number; // as percentage
}

```

---

## Inventory Types

### `Inventory`

Represents the inventory details in the system.

```tsx
interface Inventory {
  materialType: MaterialType;
  materialWeight: number; // in kg
  cutSize: Dimensions;
  relatedPOs: string[]; // Purchase Order Numbers
}

```

---

## Quotation Types

### `Quotation`

Represents a quotation created for a purchaser.

```tsx
interface Quotation {
  purchaserId: string;
  poNumber: string;
  dateCreated: Date;
  profileId: string;
  finishSize: Dimensions;
  turningRate: number; // in INR
  teethCount: number;
  module: number;
  face: number;
  weight: number; // in kg
  materialCost: number; // in INR
  tcTgPrice: number; // in INR
  htCost: number; // in INR
  processCosts: { type: ProcessType; cost: number }[];
  grandTotal: number; // in INR
  profitMargin: number; // as percentage
  totalOrderValue: number; // in INR
}

```

---

## Dashboard Types

### `DashboardCard`

Represents the dashboard view data.

```tsx
interface DashboardCard {
  activeOrders: Order[];
  draftOrders: Order[];
  profiles: OrderProfile[];
  buyers: Buyer[];
}

```

---

## User Settings

### `User`

Represents a user in the system.

```tsx
interface User {
  username: string;
  password: string;
  role: UserRole;
}

```

---

## Settings

### `Settings`

Represents the application settings.

```tsx
interface Settings {
  users: User[];
  purchasers: Buyer[];
}

```

---

## API Routes

### `GET /api/users`

Fetches all users.

### `POST /api/users`

Creates a new user.

### `PUT /api/users/:id`

Updates an existing user.

### `GET /api/buyers`

Fetches all buyers.

### `POST /api/buyers`

Creates a new buyer.

### `PUT /api/buyers/:id`

Updates an existing buyer.

### `GET /api/orders`

Fetches all orders.

### `POST /api/orders`

Creates a new order.

### `PUT /api/orders/:id`

Updates an existing order.

### `GET /api/inventory`

Fetches all inventory items.

### `POST /api/inventory`

Creates a new inventory item.

### `PUT /api/inventory/:id`

Updates an existing inventory item.

### `GET /api/quotations`

Fetches all quotations.

### `POST /api/quotations`

Creates a new quotation.

### `PUT /api/quotations/:id`

Updates an existing quotation.

### `GET /api/users/:id`

Fetches a user by ID.

### `DELETE /api/users/:id`

Deletes a user by ID.

### `GET /api/buyers/:id`

Fetches a buyer by ID.

### `DELETE /api/buyers/:id`

Deletes a buyer by ID.

### `GET /api/orders/:id`

Fetches an order by ID.

### `DELETE /api/orders/:id`

Deletes an order by ID.

### `GET /api/inventory/:id`

Fetches an inventory item by ID.

### `DELETE /api/inventory/:id`

Deletes an inventory item by ID.

### `GET /api/quotations/:id`

Fetches a quotation by ID.

### `DELETE /api/quotations/:id`

Deletes a quotation by ID.