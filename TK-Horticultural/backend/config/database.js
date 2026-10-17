require('dotenv').config();

const baseConfig = {
  dialect: 'mysql',
  use_env_variable: process.env.DATABASE_URL
    ? 'DATABASE_URL'
    : process.env.MYSQL_PUBLIC_URL
      ? 'MYSQL_PUBLIC_URL'
      : process.env.MYSQL_URL
        ? 'MYSQL_URL'
        : undefined,
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  database: process.env.DB_DATABASE || process.env.MYSQLDATABASE || 'tk_horticultural',
  username: process.env.DB_USERNAME || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  logging: false
};

const hasDatabaseConfig = !!(
  process.env.DATABASE_URL ||
  process.env.MYSQL_PUBLIC_URL ||
  process.env.MYSQL_URL ||
  process.env.DB_HOST ||
  process.env.MYSQLHOST ||
  process.env.DB_DATABASE ||
  process.env.MYSQLDATABASE ||
  process.env.DB_USERNAME ||
  process.env.MYSQLUSER ||
  process.env.DB_PASSWORD ||
  process.env.MYSQLPASSWORD ||
  process.env.DB_SOCKET_PATH
);

if (process.env.NODE_ENV === 'production' && !hasDatabaseConfig) {
  throw new Error('Missing production database configuration. Set DATABASE_URL or the DB_ / MYSQL_PUBLIC_URL variables in Vercel.');
}

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