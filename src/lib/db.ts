import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DB_URL || process.env.TURSO_DATABASE_URL || 'file:./local.db',
  authToken: process.env.TURSO_DB_TOKEN || process.env.TURSO_AUTH_TOKEN,
});

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS portfolio_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_assets REAL NOT NULL,
      total_debt REAL NOT NULL,
      net_worth REAL NOT NULL,
      raw_data_json TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS portfolio_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      category TEXT NOT NULL,
      currency TEXT DEFAULT 'KRW',
      broker TEXT,
      name TEXT NOT NULL,
      ticker TEXT,
      quantity REAL NOT NULL,
      price REAL NOT NULL
    )
  `);
}
