require('dotenv').config({ path: 'env/.env' });

const rulesAndUnderstandings = require('./data/rulesAndUnderstandings.json');
const db = require('./mongodb');

async function populateDB() {
    try {
        // insert the entire rulesAndUnderstandings object into the database
        console.log(rulesAndUnderstandings[0]);
        await db.collection('prueba').insert(rulesAndUnderstandings);
        console.log("Database populated");
        process.exit(0);
    } catch (error) {
        console.error(error);
    }
}

populateDB()