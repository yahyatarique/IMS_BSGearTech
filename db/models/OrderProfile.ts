import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';
import type Profiles from './Profiles';

interface OrderProfileAttributes {
  id: string;
  order_id: string;
  profile_id: string;
  name: string;
  type: '0' | '1';
  material: 'CR-5' | 'EN-9';
  material_rate: number;
  cut_size_width_mm: number;
  cut_size_height_mm: number;
  burning_wastage_percent: number;
  heat_treatment_rate: number;
  heat_treatment_inefficacy_percent: number;
  created_at: Date;
  updated_at: Date;
}

interface OrderProfileCreationAttributes extends Optional<OrderProfileAttributes, 'id' | 'created_at' | 'updated_at'> {}

class OrderProfile extends Model<OrderProfileAttributes, OrderProfileCreationAttributes> implements OrderProfileAttributes {
  public id!: string;
  public order_id!: string;
  public profile_id!: string;
  public name!: string;
  public type!: '0' | '1';
  public material!: 'CR-5' | 'EN-9';
  public material_rate!: number;
  public cut_size_width_mm!: number;
  public cut_size_height_mm!: number;
  public burning_wastage_percent!: number;
  public heat_treatment_rate!: number;
  public heat_treatment_inefficacy_percent!: number;
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
    material_rate: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
    },
    cut_size_width_mm: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    cut_size_height_mm: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    burning_wastage_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    heat_treatment_rate: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false,
    },
    heat_treatment_inefficacy_percent: {
      type: DataTypes.DECIMAL(5, 2),
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
    tableName: 'order_profile',
    modelName: 'OrderProfile',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrderProfile;
