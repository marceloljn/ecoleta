import knex from 'knex';
import path from 'path';

const connection = knex({
  client: 'mysql',
  connection: {
    host: 'http://www.db4free.net',
    user: 'usuarioecoleta',
    password: 'usuarioecoleta',
    database: 'ecoleta',
  },
  useNullAsDefault: true,
});

export default connection;
