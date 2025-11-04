import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

interface BuyerAttributes {
  id: string;
  name: string;
  contact_details: object;
  gst_number?: string;
  pan_number?: string;
  tin_number?: string;
  org_name: string;
  org_address: string;
  created_at: Date;
  updated_at: Date;
}

interface BuyerCreationAttributes extends Optional<BuyerAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Buyer extends Model<BuyerAttributes, BuyerCreationAttributes> implements BuyerAttributes {
  public id!: string;
  public name!: string;
  public contact_details!: object;
  public gst_number?: string;
  public pan_number?: string;
  public tin_number?: string;
  public org_name!: string;
  public org_address!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association method
  static associate(models: any) {
    Buyer.hasMany(models.Orders, { 
      foreignKey: 'buyer_id', 
      as: 'orders' 
    });
  }
}

Buyer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contact_details: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    gst_number: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pan_number: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tin_number: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    org_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    org_address: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'buyer',
    modelName: 'Buyer',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Buyer;