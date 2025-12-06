import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

interface BurningWastageAttributes {
  id: string;
  wastage_kg: number;
  date: Date;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

interface BurningWastageCreationAttributes
  extends Optional<BurningWastageAttributes, 'id' | 'created_at' | 'updated_at' | 'notes'> {}

class BurningWastage
  extends Model<BurningWastageAttributes, BurningWastageCreationAttributes>
  implements BurningWastageAttributes
{
  public id!: string;
  public wastage_kg!: number;
  public date!: Date;
  public notes!: string | null;
  public created_at!: Date;
  public updated_at!: Date;

  static associate(models: any) {
    // No associations currently
  }
}

BurningWastage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    wastage_kg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('wastage_kg');
        return value ? parseFloat(value.toString()) : 0;
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'burning_wastage',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default BurningWastage;
