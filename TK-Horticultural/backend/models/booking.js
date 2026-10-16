'use strict';
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    ref: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    client_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    client_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    client_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    division: {
      type: DataTypes.ENUM('horticulture', 'cleaning', 'waste'),
      allowNull: false
    },
    service: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    sub_services: {
      type: DataTypes.JSON,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    slot_id: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    slot: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    postcode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    media: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Pending Quote'
    },
    price: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tk_bookings',
    timestamps: true,
    underscored: true,
  });
  Booking.associate = function(models) {
    Booking.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };
  return Booking;
};