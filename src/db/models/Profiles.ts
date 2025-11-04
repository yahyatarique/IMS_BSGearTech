import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

interface ProfilesAttributes {
  id: string;
  name: string;
  type: 'gear' | 'pinion' | 'shaft' | 'other';
  material: 'steel' | 'aluminum' | 'brass' | 'bronze' | 'plastic' | 'other';
  material_rate: number;
  cut_size_width_mm: number;
  cut_size_height_mm: number;
  burning_wastage_percent: number;
  heat_treatment_rate: number;
  heat_treatment_inefficacy_percent: number;
}

interface ProfilesCreationAttributes extends Optional<ProfilesAttributes, 'id'> {}

class Profiles extends Model<ProfilesAttributes, ProfilesCreationAttributes> implements ProfilesAttributes {
  public id!: string;
  public name!: string;
  public type!: 'gear' | 'pinion' | 'shaft' | 'other';
  public material!: 'steel' | 'aluminum' | 'brass' | 'bronze' | 'plastic' | 'other';
  public material_rate!: number;
  public cut_size_width_mm!: number;
  public cut_size_height_mm!: number;
  public burning_wastage_percent!: number;
  public heat_treatment_rate!: number;
  public heat_treatment_inefficacy_percent!: number;
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
      type: DataTypes.ENUM('gear', 'pinion', 'shaft', 'other'),
      allowNull: false,
    },
    material: {
      type: DataTypes.ENUM('steel', 'aluminum', 'brass', 'bronze', 'plastic', 'other'),
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
  },
  {
    sequelize,
    tableName: 'profiles',
    modelName: 'Profiles',
    timestamps: false,
  }
);

export default Profiles;