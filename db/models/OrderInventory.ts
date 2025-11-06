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
  inventory_id: string;
  quantity_used: number;
  weight_used?: number | null;
  notes?: string | null;
  reserved_at?: Date | null;
  used_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Define creation attributes (optional fields for creation)
interface OrderInventoryCreationAttributes
  extends Optional<
    OrderInventoryAttributes,
    'id' | 'weight_used' | 'notes' | 'reserved_at' | 'used_at' | 'created_at' | 'updated_at'
  > {}

// Define the model class
export class OrderInventory extends Model<
  InferAttributes<OrderInventory>,
  InferCreationAttributes<OrderInventory>
> {
  declare id: CreationOptional<string>;
  declare order_id: ForeignKey<Orders['id']>;
  declare inventory_id: ForeignKey<Inventory['id']>;
  declare quantity_used: number;
  declare weight_used: number | null;
  declare notes: string | null;
  declare reserved_at: Date | null;
  declare used_at: Date | null;
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
    quantity_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    weight_used: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reserved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    used_at: {
      type: DataTypes.DATE,
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
    modelName: 'OrderInventory',
    tableName: 'order_inventory',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrderInventory;
