import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

export async function initDb() {
  if (db) return db;

  db = await open({
    filename: path.join(__dirname, "postbyvoice.db"),
    driver: sqlite3.Database,
  });

  await db.exec("PRAGMA foreign_keys = ON");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS drafts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coreMessage TEXT NOT NULL,
      linkedIn TEXT NOT NULL,
      twitter TEXT NOT NULL,
      substack TEXT NOT NULL,
      newsId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (newsId) REFERENCES news(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      newsId INTEGER NOT NULL,
      suggestion TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (newsId) REFERENCES news(id) ON DELETE CASCADE
    );
  `);

  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not initialized");
  return db;
}
