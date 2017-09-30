

const Sequelize = require('sequelize');

const db = {};

const conString = process.env.DATABASE_URL || 'postgres://localhost/standup';

const sequelize = new Sequelize(conString, {
  logging: false
});
const models = ['Channel', 'Standup'];
models.forEach((file) => {
  const model = sequelize.import(`${__dirname}/${file}`);
  db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
