'use strict';
module.exports = (sequelize, DataTypes) => {
  const Enquiry = sequelize.define('Enquiry', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    booking_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    service: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    media: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('new', 'replied', 'closed'),
      allowNull: false,
      defaultValue: 'new'
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tk_enquiries',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['status'] }]
  });
  Enquiry.associate = function(models) {
    Enquiry.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Enquiry.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });
  };
  return Enquiry;
};