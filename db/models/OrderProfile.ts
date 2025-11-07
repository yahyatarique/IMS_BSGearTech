import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';
import type Profiles from './Profiles';

interface OrderProfileAttributes {
  id: string;
  order_id: string;
  profile_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  profile_snapshot: object;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface OrderProfileCreationAttributes extends Optional<OrderProfileAttributes, 'id' | 'created_at' | 'updated_at' | 'notes' | 'profile_snapshot'> {}

class OrderProfile extends Model<OrderProfileAttributes, OrderProfileCreationAttributes> implements OrderProfileAttributes {
  public id!: string;
  public order_id!: string;
  public profile_id!: string;
  public quantity!: number;
  public unit_price!: number;
  public total_price!: number;
  public profile_snapshot!: object;
  public notes?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association method
  static associate(models: any) {
    OrderProfile.belongsTo(models.Orders, { 
      foreignKey: 'order_id', 
      as: 'order' 
    });
    OrderProfile.belongsTo(models.Profiles, {
      foreignKey: 'profile_id',
      as: 'profile',
    });
  }
}

OrderProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    unit_price: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
    },
    profile_snapshot: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'order_profile',
    modelName: 'OrderProfile',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrderProfile;
