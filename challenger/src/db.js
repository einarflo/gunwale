import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'challenger'
};

let pool;

export async function ensureDb() {
  pool = await mysql.createPool({ ...DB_CONFIG, connectionLimit: 5 });
  return pool;
}

export function getPool() {
  if (!pool) throw new Error('DB pool not initialized. Call ensureDb() first.');
  return pool;
}

