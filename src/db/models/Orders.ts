import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

interface OrdersAttributes {
  id: string;
  order_number: string;
  created_at: Date;
  buyer_id?: string;
  status: '0' | '1' | '2' | '3' | '4';
  grand_total: number;
  material_cost: number;
  process_costs: number;
  turning_rate: number;
  teeth_count?: number;
  module?: number;
  face?: number;
  weight?: number;
  ht_cost: number;
  total_order_value: number;
  profit_margin: number;
  user_id?: string;
}

interface OrdersCreationAttributes extends Optional<OrdersAttributes, 'id' | 'created_at' | 'status' | 'grand_total' | 'material_cost' | 'process_costs' | 'turning_rate' | 'ht_cost' | 'total_order_value' | 'profit_margin'> {}

class Orders extends Model<OrdersAttributes, OrdersCreationAttributes> implements OrdersAttributes {
  public id!: string;
  public order_number!: string;
  public readonly created_at!: Date;
  public buyer_id?: string;
  public status!: '0' | '1' | '2' | '3' | '4';
  public grand_total!: number;
  public material_cost!: number;
  public process_costs!: number;
  public turning_rate!: number;
  public teeth_count?: number;
  public module?: number;
  public face?: number;
  public weight?: number;
  public ht_cost!: number;
  public total_order_value!: number;
  public profit_margin!: number;
  public user_id?: string;

  // Association method
  static associate(models: any) {
    Orders.belongsTo(models.User, { 
      foreignKey: 'user_id', 
      as: 'user' 
    });
    
    Orders.belongsTo(models.Buyer, { 
      foreignKey: 'buyer_id', 
      as: 'buyer' 
    });
  }
}

Orders.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    buyer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'buyer',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('0', '1', '2', '3', '4'),
      allowNull: false,
      defaultValue: '0',
    },
    grand_total: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    material_cost: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    process_costs: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    turning_rate: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    teeth_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    module: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: true,
    },
    face: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: true,
    },
    weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
    },
    ht_cost: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_order_value: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0,
    },
    profit_margin: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Orders',
    timestamps: false,
  }
);

export default Orders;