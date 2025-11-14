import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

interface ProfilesAttributes {
  id: string;
  name: string;
  type:  '0' | '1';
  material: 'CR-5' | 'EN-9';
  material_rate: number;
  outer_diameter_mm: number;
  thickness_mm: number;
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
  declare outer_diameter_mm: number;
  declare thickness_mm: number;
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
    outer_diameter_mm: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    thickness_mm: {
      type: DataTypes.DECIMAL(10, 4),
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