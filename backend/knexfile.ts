import path from 'path';

module.exports = {
  client: 'mysql',
  connection: {
    host: 'http://www.db4free.net',
    port: '3306',
    user: 'usuarioecoleta',
    password: 'usuarioecoleta',
    database: 'ecoleta',
  },
  migrations: {
    directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
  },
  seeds: {
    directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
  },
  useNullAsDefault: true,
};
