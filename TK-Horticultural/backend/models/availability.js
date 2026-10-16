'use strict';
module.exports = (sequelize, DataTypes) => {
  const Availability = sequelize.define('Availability', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    kind: {
      type: DataTypes.ENUM('date', 'weekday'),
      allowNull: false
    },
    key: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    slots: {
      type: DataTypes.JSON, // store array of slot IDs that are overridden
      allowNull: true
    }
  }, {
    tableName: 'tk_availability',
    timestamps: true,
    indexes: [
      {
        fields: ['kind', 'key']
      }
    ]
  });

  return Availability;
};