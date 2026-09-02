import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = path.join(process.cwd(), "local.db");

const globalForDb = globalThis as typeof globalThis & {
  __sqliteDb?: Database.Database;
};

if (!globalForDb.__sqliteDb) {
  globalForDb.__sqliteDb = new Database(dbPath);
  globalForDb.__sqliteDb.pragma("journal_mode = WAL");
}

export const db = drizzle(globalForDb.__sqliteDb, { schema });
