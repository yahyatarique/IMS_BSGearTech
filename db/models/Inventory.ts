import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

export interface InventoryAttributes {
  id: string;
  material_type: 'CR-5' | 'EN-9';
  material_weight: number;
  cut_size_width: number;
  cut_size_height: number;
  po_number?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryCreationAttributes
  extends Optional<InventoryAttributes, 'id' | 'po_number' | 'created_at' | 'updated_at'> {}

class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
  public id!: string;
  public material_type!: 'CR-5' | 'EN-9';
  public material_weight!: number;
  public cut_size_width!: number;
  public cut_size_height!: number;
  public po_number?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static associate(models: any): void {
    Inventory.hasMany(models.OrderInventory, {
      foreignKey: 'inventory_id',
      as: 'orderInventories',
    });
  }

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      comment: 'Weight of material in kg'
    },
    cut_size_width: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Width dimension in mm'
    },
    cut_size_height: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Height dimension in mm'
    },
    po_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Related Purchase Order number'
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
