const { Sequelize } = require('sequelize')
const dotenv = require('dotenv').config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'social_mern_db',
  DB_USERNAME = 'postgres',
  DB_PASSWORD = 'postgres',
  DATABASE_URL
} = process.env

// Use DATABASE_URL if provided (for production), otherwise use individual config
const sequelize = DATABASE_URL 
  ? new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: process.env.NODE_ENV !== 'production' ? console.log : false
    })
  : new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'postgres',
      logging: process.env.NODE_ENV !== 'production' ? console.log : false
    })

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL connection established successfully.')
  })
  .catch(err => {
    console.error('❌ Unable to connect to PostgreSQL:', err)
  })

module.exports = sequelize
