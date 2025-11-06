import User from './User';
import Profiles from './Profiles';
import Buyer from './Buyer';
import Orders from './Orders';
import OrderProfile from './OrderProfile';
import Inventory from './Inventory';
import OrderInventory from './OrderInventory';

/**
 * Database Models Index
 * 
 * IMPORTANT NOTES:
 * - User roles are now managed using TypeScript enums from src/enums/userRoles.ts
 * - Role values: ADMIN=0, MANAGER=1, USER=2,
 * - Permissions are handled at the application level using the enum helper functions
 * 
 * Available Models:
 * - User: User accounts with authentication
 * - Profiles: Gear profiles and specifications
 * - Buyer: Customer/buyer information
 * - Orders: Order management with status tracking
 * - OrderProfile: Junction table linking orders with profiles
 * - Inventory: Material inventory tracking
 * - OrderInventory: Junction table linking orders with inventory items
 */

// Initialize all models
const models = {
  User,
  Profiles,
  Buyer,
  Orders,
  OrderProfile,
  Inventory,
  OrderInventory,
};

// Set up associations
Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

export {
  User,
  Profiles,
  Buyer,
  Orders,
  OrderProfile,
  Inventory,
  OrderInventory,
};

export default models;