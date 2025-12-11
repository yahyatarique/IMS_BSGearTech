import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';
import bcrypt from 'bcryptjs';

/**
 * User Model
 *
 * ROLE MANAGEMENT:
 * - Roles are stored as enum values: '0' | '1' | '2'
 * - Role definitions are in src/enums/userRoles.ts
 * - ADMIN = 0, MANAGER = 1, USER = 2
 * - No separate role_permissions table exists
 * - Use UserRole enum from src/enums for type-safe role handling
 * - Use helper functions like getRoleLabel(), isAdmin(), hasManagementAccess()
 */

interface UserAttributes {
  id: string;
  username: string;
  password: string;
  role: '0' | '1' | '2';
  first_name: string;
  last_name: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'role' | 'status'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare username: string;
  declare password: string;
  declare role: '0' | '1' | '2' | '3';
  declare first_name: string;
  declare last_name: string;
  declare status: 'active' | 'inactive' | 'suspended';
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Instance methods
  public static async comparePassword(candidatePassword: string, userPassword: string): Promise<boolean> {
    const isValid = await bcrypt.compare(candidatePassword, userPassword);
    return isValid;
  }


  // Static methods
  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Association method
  static associate(models: any) {
    User.hasMany(models.Orders, {
      foreignKey: 'user_id',
      as: 'orders',
    });

  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('0', '1', '2', '3'),
      allowNull: false,
      defaultValue: '2',
    },
    first_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await User.hashPassword(user.password);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await User.hashPassword(user.password);
        }
      },
    },
  }
);

export default User;
