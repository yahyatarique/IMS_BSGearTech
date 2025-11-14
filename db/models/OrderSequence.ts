import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

interface OrderSequenceAttributes {
  id: number;
  current_number: number;
  updated_at: Date;
}

class OrderSequence extends Model<OrderSequenceAttributes> implements OrderSequenceAttributes {
  declare id: number;
  declare current_number: number;
  declare updated_at: Date;

  static async getNextNumber(): Promise<string> {
    const sequence = await OrderSequence.findOne({ where: { id: 1 } });


    if(!sequence) {
      
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const paddedNumber = String(1).padStart(4, '0');

    return `BSGPL/${month}/${year}/${paddedNumber}`;
    }

    const nextNumber = (sequence?.current_number || 0) + 1;

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const paddedNumber = String(nextNumber).padStart(4, '0');

    return `BSGPL/${month}/${year}/${paddedNumber}`;
  }

  static async incrementNumber(): Promise<void> {
    const sequence = await OrderSequence.findOne({ where: { id: 1 } });
    if (sequence) {
      await sequence.update({ current_number: sequence.current_number + 1 });
    }
  }
}

OrderSequence.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1
    },
    current_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'order_sequence',
    modelName: 'OrderSequence',
    timestamps: false
  }
);

export default OrderSequence;
