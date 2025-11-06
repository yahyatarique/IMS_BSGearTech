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

// Define attributes interface
export interface OrderInventoryAttributes {
  id: string;
  order_id: string;
  material_type: 'CR-5' | 'EN-9';
  material_weight: number;
  cut_size_width: number;
  cut_size_height: number;
  po_number?: string | null;
  quantity: number;
  weight_used?: number | null;
  location?: string | null;
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
    'id' | 'po_number' | 'weight_used' | 'location' | 'notes' | 'reserved_at' | 'used_at' | 'created_at' | 'updated_at'
  > {}

// Define the model class
export class OrderInventory extends Model<
  InferAttributes<OrderInventory>,
  InferCreationAttributes<OrderInventory>
> {
  declare id: CreationOptional<string>;
  declare order_id: ForeignKey<Orders['id']>;
  declare material_type: 'CR-5' | 'EN-9';
  declare material_weight: number;
  declare cut_size_width: number;
  declare cut_size_height: number;
  declare po_number: string | null;
  declare quantity: number;
  declare weight_used: number | null;
  declare location: string | null;
  declare notes: string | null;
  declare reserved_at: Date | null;
  declare used_at: Date | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare order?: NonAttribute<Orders>;

  declare static associations: {
    order: Association<OrderInventory, Orders>;
  };

  static associate(models: any): void {
    OrderInventory.belongsTo(models.Orders, {
      foreignKey: 'order_id',
      as: 'order',
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
    material_type: {
      type: DataTypes.ENUM('CR-5', 'EN-9'),
      allowNull: false,
    },
    material_weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    cut_size_width: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    cut_size_height: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    po_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quantity: {
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
    location: {
      type: DataTypes.STRING(255),
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
