import User from './User';
import Profiles from './Profiles';
import Buyer from './Buyer';
import Orders from './Orders';

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
 */

// Initialize all models
const models = {
  User,
  Profiles,
  Buyer,
  Orders,
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
};

export default models;