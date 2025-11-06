import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

export interface InventoryAttributes {
  id: string;
  material_type: 'CR-5' | 'EN-9';
  material_weight: number;
  cut_size_width: number;
  cut_size_height: number;
  po_number?: string;
  quantity: number;
  status: 'available' | 'reserved' | 'used' | 'damaged';
  location?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryCreationAttributes
  extends Optional<InventoryAttributes, 'id' | 'po_number' | 'quantity' | 'status' | 'location' | 'notes' | 'created_at' | 'updated_at'> {}

class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
  public id!: string;
  public material_type!: 'CR-5' | 'EN-9';
  public material_weight!: number;
  public cut_size_width!: number;
  public cut_size_height!: number;
  public po_number?: string;
  public quantity!: number;
  public status!: 'available' | 'reserved' | 'used' | 'damaged';
  public location?: string;
  public notes?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static associate(models: any): void {
    // Define associations here if needed
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
      comment: 'Type of material - must match enum_profiles_material'
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Quantity of items in inventory'
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'used', 'damaged'),
      allowNull: false,
      defaultValue: 'available',
      comment: 'Current status of inventory item'
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Storage location or bin number'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes or remarks'
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
