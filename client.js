const { Pool } = require('pg');

const client = new Pool({
 user: 'igdmmekr',
 host: 'hattie.db.elephantsql.com',
 database: 'igdmmekr',
 password: 'L4zjX6brvKvd1jl8AMjUxb7pbjP4w2AO',
 port: 5432,
});

module.exports = client