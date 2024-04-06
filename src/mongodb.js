require('dotenv').config({ path: 'env/.env' });

const mongojs = require('mongojs')
const db = mongojs(process.env.MONGODB_URI, ['understandings', 'prueba'])

module.exports = db;