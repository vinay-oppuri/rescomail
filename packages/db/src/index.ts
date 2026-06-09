import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { serverEnv } from "@repo/env/server";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
  max: serverEnv.NODE_ENV === "production" ? 10 : 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
