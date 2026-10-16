'use strict';
module.exports = (sequelize, DataTypes) => {
  const Slot = sequelize.define('Slot', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    slot_id: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    booking_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('available', 'booked', 'blocked'),
      allowNull: false,
      defaultValue: 'available'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tk_slots',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['date', 'slot_id'], name: 'tk_slots_date_slot_unique' },
      { fields: ['date', 'status'] }
    ]
  });
  Slot.associate = function(models) {
    Slot.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Slot.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });
  };
  return Slot;
};