const pg = require('pg');


const uri = process.env.POSTGRES_URI;

const pgClient = new pg.Client(uri);
pgClient.connect();

module.exports = pgClient;
