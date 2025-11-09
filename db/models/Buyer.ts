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
  status: 'active' | 'inactive' | 'blocked';
  created_at: Date;
  updated_at: Date;
}

interface BuyerCreationAttributes
  extends Optional<BuyerAttributes, 'id' | 'created_at' | 'updated_at' | 'status'> {}

class Buyer extends Model<BuyerAttributes, BuyerCreationAttributes> implements BuyerAttributes {
  declare id: string;
  declare name: string;
  declare contact_details: object;
  declare gst_number?: string;
  declare pan_number?: string;
  declare tin_number?: string;
  declare org_name: string;
  declare org_address: string;
  declare status: 'active' | 'inactive';
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Association method
  static associate(models: any) {
    // Define Orders relationship
    Buyer.hasMany(models.Orders, {
      foreignKey: {
        name: 'buyer_id',
        allowNull: true
      },
      sourceKey: 'id',
      as: 'orders',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
}

Buyer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    contact_details: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    gst_number: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pan_number: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tin_number: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    org_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    org_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'blocked'),
      allowNull: false,
      defaultValue: 'active'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'buyer',
    modelName: 'Buyer',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Buyer;
