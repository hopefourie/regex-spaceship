const Sequelize = require("sequelize");

const databaseName = "regex-spaceship";

const db = new Sequelize(
  process.env.DATABASE_URL || `postgres://localhost:5432/${databaseName}`,
  {
    logging: false,
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   },
    // },
  }
);
module.exports = db;

// // This is a global Mocha hook used for resource cleanup.
// // Otherwise, Mocha v4+ does not exit after tests.
// if (process.env.NODE_ENV === 'test') {
//   after('close database connection', () => db.close())
// }
