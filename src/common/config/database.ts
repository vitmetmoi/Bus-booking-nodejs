import knex from 'knex';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const environment = (process.env.NODE_ENV || 'development') as 'development' | 'production';

const config: { [key: string]: any } = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        migrations: {
            directory: './src/db/migrations',
        },
        seeds: {
            directory: './src/db/seeds',
        },
    },
    production: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        migrations: {
            directory: './dist/db/migrations',
        },
        seeds: {
            directory: './src/db/seeds',
        },
    },
};

export const db = knex(config[environment]);


// db.raw('SELECT 1')
//   .then(() => {
//     console.log('Kết nối MySQL thành công!');
//   })
//   .catch((err) => {
//     console.error('Lỗi kết nối MySQL:', err);
//   });