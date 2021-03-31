module.exports = {
  development: {
    client: "pg",
    connection: {
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "root",
      database: "wimp"
    },
    migrations: {
      directory: "./data/migrations",
    },
    seeds: {
      directory: "./data/seeds",
    },
  },
  staging: {
    client: 'pg',
    connection: {
      database: 'postgres',
      user:     'postgres',
      password: 'root'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'pg',
    connection: {
      database: 'postgres',
      user:     'postgres',
      password: 'root'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
