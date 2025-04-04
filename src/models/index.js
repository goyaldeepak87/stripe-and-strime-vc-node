const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/database.js`)[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
    .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);  // Ensure this returns a model
        db[model.name] = model;
    });

// Define associations after models are loaded
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});


// (async () => {
//     try {
//         const [results, metadata] = await sequelize.query('DESCRIBE Tokens;');
//         console.log('Table structure:', results);
//     } catch (error) {
//         console.error('Error querying the table structure:', error);
//     }
// })();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
