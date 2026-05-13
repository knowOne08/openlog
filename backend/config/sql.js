import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'openlog',
    password: 'Abhi@2005'
});

export { connection };