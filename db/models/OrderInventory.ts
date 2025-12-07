import {
  DataTypes,
  Model,
  Optional,
  Association,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from 'sequelize';
import sequelize from '../connection';
import type Orders from './Orders';
import type Inventory from './Inventory';

// Define attributes interface
export interface OrderInventoryAttributes {
  id: string;
  order_id: string;
  order_profile_id?: string;
  inventory_id: string;
  material_type: 'CR-5' | 'EN-9';
  material_weight: number;
  outer_diameter: number;
  length: number;
  rate: number;
  po_number?: string | null;
  created_at: Date;
  updated_at: Date;
}

// Define creation attributes (optional fields for creation)
interface OrderInventoryCreationAttributes
  extends Optional<
    OrderInventoryAttributes,
    'id' | 'order_profile_id' | 'po_number' | 'created_at' | 'updated_at'
  > {}

// Define the model class
export class OrderInventory extends Model<
  InferAttributes<OrderInventory>,
  InferCreationAttributes<OrderInventory>
> {
  declare id: CreationOptional<string>;
  declare order_id: ForeignKey<Orders['id']>;
  declare order_profile_id?: string;
  declare inventory_id: ForeignKey<Inventory['id']>;
  declare material_type: 'CR-5' | 'EN-9';
  declare material_weight: number;
  declare outer_diameter: number;
  declare length: number;
  declare rate: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare order?: NonAttribute<Orders>;
  declare inventory?: NonAttribute<Inventory>;

  declare static associations: {
    order: Association<OrderInventory, Orders>;
    inventory: Association<OrderInventory, Inventory>;
  };

  static associate(models: any): void {
    OrderInventory.belongsTo(models.Orders, {
      foreignKey: 'order_id',
      as: 'order',
    });
    OrderInventory.belongsTo(models.OrderProfile, {
      foreignKey: 'order_profile_id',
      as: 'orderProfile',
    });
    OrderInventory.belongsTo(models.Inventory, {
      foreignKey: 'inventory_id',
      as: 'inventory',
    });
  }
}

// Initialize the model
OrderInventory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
    order_profile_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'order_profile',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    inventory_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'inventory',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    material_type: {
      type: DataTypes.ENUM('CR-5', 'EN-9'),
      allowNull: false,
      comment: 'Type of material - CR-5 or EN-9'
    },
    material_weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      comment: 'Weight of material in kg'
    },
    outer_diameter: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Outer diameter in mm'
    },
    length: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Length in mm'
    },
    rate: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Rate per unit'
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
    modelName: 'OrderInventory',
    tableName: 'order_inventory',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrderInventory;
