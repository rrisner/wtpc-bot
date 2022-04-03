require('dotenv').config();

const Pool = require('pg').Pool;

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`;

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    // Comment out this ssl field in development mode
    ssl: {
        rejectUnauthorized: false,
    },
});

module.exports = pool;