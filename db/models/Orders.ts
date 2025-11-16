import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

interface OrdersAttributes {
  id: string;
  order_number: string;
  created_at: Date;
  buyer_id?: string;
  status: '0' | '1' | '2';
  grand_total: number;
  total_order_value: number;
  profit_margin: number;
  burning_wastage_percent: number;
  user_id?: string;
}

interface OrdersCreationAttributes
  extends Optional<
    OrdersAttributes,
    | 'id'
    | 'created_at'
    | 'status'
    | 'grand_total'
    | 'total_order_value'
    | 'profit_margin'
    | 'burning_wastage_percent'
  > {}

class Orders extends Model<OrdersAttributes, OrdersCreationAttributes> implements OrdersAttributes {
  declare id: string;
  declare order_number: string;
  declare readonly created_at: Date;
  declare buyer_id?: string;
  declare status: '0' | '1' | '2';
  declare grand_total: number;
  declare total_order_value: number;
  declare profit_margin: number;
  declare burning_wastage_percent: number;
  declare user_id?: string;

  // Association method
  static associate(models: any) {
    Orders.belongsTo(models.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'user'
    });

    // Define Buyer relationship
    Orders.belongsTo(models.Buyer, {
      foreignKey: {
        name: 'buyer_id',
        allowNull: true
      },
      targetKey: 'id',
      as: 'buyer',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    Orders.hasMany(models.OrderInventory, {
      foreignKey: 'order_id',
      as: 'orderInventoryItems'
    });
  }
}

Orders.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_number: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    buyer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'buyer',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('0', '1', '2'),
      allowNull: false,
      defaultValue: '0'
    },
    grand_total: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    },
    total_order_value: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0
    },
    profit_margin: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    burning_wastage_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Orders',
    timestamps: false
  }
);

export default Orders;
