import { configDotenv } from "dotenv"
import { Pool } from "pg"

configDotenv()
// define DB
export const client = new Pool({
    database:  process.env.PGDATABASE,
    host:  process.env.PGHOST,
    port:  parseInt(process.env.PGPORT || '5432'),
    user:  process.env.PGUSER,
    password: process.env.PGPASS
})

export async function dbInitialize(pool) {
      try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS profiles (
        id CHAR(10) NOT NULL,
        name VARCHAR(255),
        gambar VARCHAR(255),
        PRIMARY KEY (id)
        )
        `)

        console.log('table profiles create !')
   } catch (error) {
    console.log(error)
   }
}
