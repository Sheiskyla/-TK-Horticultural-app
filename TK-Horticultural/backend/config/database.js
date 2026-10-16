require('dotenv').config();

const baseConfig = {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_DATABASE || 'tk_horticultural',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: false
};

// Use socket path if provided (XAMPP), otherwise use host/port
if (process.env.DB_SOCKET_PATH) {
  baseConfig.host = undefined;
  baseConfig.socketPath = process.env.DB_SOCKET_PATH;
}

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: { ...baseConfig }
};