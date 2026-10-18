require('dotenv').config();

const mysqlPublicUrl = process.env.MYSQL_PUBLIC_URL;
const publicUrlIsMysqlUrl = /^mysql:\/\//i.test(mysqlPublicUrl || '');
const publicUrlIsHost = mysqlPublicUrl && !/^[a-z][a-z\d+.-]*:\/\//i.test(mysqlPublicUrl);
const publicHostPort = publicUrlIsHost && mysqlPublicUrl.match(/^([^:/?#]+):(\d+)$/);
const publicHost = publicHostPort ? publicHostPort[1] : publicUrlIsHost ? mysqlPublicUrl : undefined;

const baseConfig = {
  dialect: 'mysql',
  use_env_variable: process.env.DATABASE_URL
    ? 'DATABASE_URL'
    : publicUrlIsMysqlUrl
      ? 'MYSQL_PUBLIC_URL'
      : /^mysql:\/\//i.test(process.env.MYSQL_URL || '')
        ? 'MYSQL_URL'
        : undefined,
  host: publicHost || process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: publicHostPort?.[2] || process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'tk_horticultural',
  username: process.env.DB_USERNAME || process.env.MYSQL_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '',
  logging: false
};

// Use socket path if provided (XAMPP), otherwise use host/port
if (process.env.DB_SOCKET_PATH && !baseConfig.use_env_variable && process.env.NODE_ENV !== 'production') {
  baseConfig.host = undefined;
  baseConfig.socketPath = process.env.DB_SOCKET_PATH;
}

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: { ...baseConfig }
};