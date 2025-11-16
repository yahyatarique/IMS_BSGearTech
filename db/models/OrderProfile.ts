import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

interface OrderProfileAttributes {
  id: string;
  order_id: string;
  profile_id: string;
  name: string;
  type: '0' | '1';
  material: 'CR-5' | 'EN-9';
  no_of_teeth: number;
  rate: number;
  face: number;
  module: number;
  finish_size?: string;
  burning_weight: number;
  total_weight: number;
  ht_cost: number;
  ht_rate: number;
  processes?: any;
  cyn_grinding: number;
  total: number;
  created_at: Date;
  updated_at: Date;
}

interface OrderProfileCreationAttributes extends Optional<OrderProfileAttributes, 'id' | 'created_at' | 'updated_at'> {}

class OrderProfile extends Model<OrderProfileAttributes, OrderProfileCreationAttributes> implements OrderProfileAttributes {
  declare id: string;
  declare order_id: string;
  declare profile_id: string;
  declare name: string;
  declare type: '0' | '1';
  declare material: 'CR-5' | 'EN-9';
  declare no_of_teeth: number;
  declare rate: number;
  declare face: number;
  declare module: number;
  declare finish_size?: string;
  declare burning_weight: number;
  declare total_weight: number;
  declare ht_cost: number;
  declare ht_rate: number;
  declare processes?: any;
  declare cyn_grinding: number;
  declare total: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

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
    OrderProfile.hasMany(models.OrderInventory, {
      foreignKey: 'order_profile_id',
      as: 'orderInventoryItems',
      onDelete: 'CASCADE',
      hooks: true
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
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false,
    },
    material: {
      type: DataTypes.ENUM('CR-5', 'EN-9'),
      allowNull: false,
    },
    no_of_teeth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rate: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    face: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
    },
    module: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
    },
    finish_size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    burning_weight: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_weight: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    ht_cost: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    ht_rate: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    processes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    cyn_grinding: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
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
