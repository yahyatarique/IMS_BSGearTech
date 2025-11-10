import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

export interface InventoryAttributes {
  id: string;
  material_type: 'CR-5' | 'EN-9';
  material_weight: number;
  width: number;
  height: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryCreationAttributes
  extends Optional<InventoryAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
  declare id: string;
  declare material_type: 'CR-5' | 'EN-9';
  declare material_weight: number;
  declare width: number;
  declare height: number;
  declare quantity: number;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  static associate(models: any): void {
    Inventory.hasMany(models.OrderInventory, {
      foreignKey: 'inventory_id',
      as: 'orderInventories',
    });
  }

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Inventory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    material_type: {
      type: DataTypes.ENUM('CR-5', 'EN-9'),
      allowNull: false,
      comment: 'Type of material - CR-5 or EN-9'
    },
    material_weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      comment: 'For BE wastage calculation only'
    },
    width: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Width dimension in mm'
    },
    height: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Height dimension in mm'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Current inventory quantity'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'inventory',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Inventory;
