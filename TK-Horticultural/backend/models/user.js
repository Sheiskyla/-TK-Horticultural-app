'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    remember_token: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    google_uid: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    postcode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: false,
  });

  User.associate = function(models) {
    User.hasMany(models.Booking, { foreignKey: 'user_id', as: 'bookings' });
    User.hasMany(models.Slot, { foreignKey: 'user_id', as: 'slots' });
    User.hasMany(models.Enquiry, { foreignKey: 'user_id', as: 'enquiries' });
  };

  return User;
};