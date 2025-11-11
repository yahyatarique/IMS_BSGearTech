import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

interface ProfilesAttributes {
  id: string;
  name: string;
  type:  '0' | '1';
  material: 'CR-5' | 'EN-9';
  material_rate: number;
  cut_size_width_mm: number;
  cut_size_height_mm: number;
  burning_wastage_percent: number;
  heat_treatment_rate: number;
  heat_treatment_inefficacy_percent: number;
  inventory_id?: string;
}

interface ProfilesCreationAttributes extends Optional<ProfilesAttributes, 'id'> {}

class Profiles extends Model<ProfilesAttributes, ProfilesCreationAttributes> implements ProfilesAttributes {
  declare id: string;
  declare name: string;
  declare type: '0' | '1';
  declare material: 'CR-5' | 'EN-9';
  declare material_rate: number;
  declare cut_size_width_mm: number;
  declare cut_size_height_mm: number;
  declare burning_wastage_percent: number;
  declare heat_treatment_rate: number;
  declare heat_treatment_inefficacy_percent: number;
  declare inventory_id?: string;

  static associate(models: any) {
    Profiles.belongsTo(models.Inventory, {
      foreignKey: 'inventory_id',
      as: 'inventory',
    });
  }
}

Profiles.init(
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
    inventory_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'inventory',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    tableName: 'profiles',
    modelName: 'Profiles',
    timestamps: false,
  }
);

export default Profiles;