// db.js
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
dotenv.config()
const pool = neon(process.env.DATABASE_URL);


export default pool;
