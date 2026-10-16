'use strict';
module.exports = (sequelize, DataTypes) => {
  const Gallery = sequelize.define('Gallery', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    division: {
      type: DataTypes.ENUM('horticulture', 'cleaning', 'waste'),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sort_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'tk_gallery',
    timestamps: true,
    underscored: true, // so created_at, updated_at
    indexes: [
      {
        fields: ['division', 'is_active']
      },
      {
        fields: ['sort_order']
      }
    ]
  });

  return Gallery;
};