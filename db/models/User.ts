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
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'role' | 'status'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public password!: string;
  public role!: '0' | '1' | '2';
  public first_name!: string;
  public last_name!: string;
  public status!: 'active' | 'inactive' | 'suspended';
  public readonly created_at!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string, userPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, userPassword);
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
      type: DataTypes.ENUM('0', '1', '2'),
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
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: false,
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
