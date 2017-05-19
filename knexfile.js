
module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/mountains',
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/dev'
    }
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://localhost/mountains_test',
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/test`,
    },
    useNullAsDefault: true,
  },
  production: {
    client: 'pg',
    connection: `${process.env.DATABASE_URL}?ssl=true`,
    migrations: {
      directory: './db/migrations',
    },
    useNullAsDefault: true,
    seeds: {
      directory: './db/seeds/dev',
    }
  }
};
