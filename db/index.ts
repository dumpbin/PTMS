// import { drizzle } from "drizzle-orm/neon-serverless"
// import { Pool } from "@neondatabase/serverless"

// const pool = new Pool({ connectionString: process.env.DATABASE_URL! })

// export const db = drizzle(pool)
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: false }); // Disable SSL for local DB

export const db = drizzle(sql);
