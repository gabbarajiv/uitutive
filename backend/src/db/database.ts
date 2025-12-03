import Database from 'better-sqlite3';
import { Pool } from 'pg';
import { config } from '../config/config.ts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let dbConnection: any;

export interface DbConnection {
    query: (sql: string, params?: any[]) => Promise<any>;
    run: (sql: string, params?: any[]) => Promise<any>;
    close: () => Promise<void>;
}

export async function initializeDatabase(): Promise<DbConnection> {
    if (config.db.type === 'postgres') {
        return initializePostgres();
    } else {
        return initializeSqlite();
    }
}

async function initializeSqlite(): Promise<DbConnection> {
    const dbPath = config.db.sqlite.path;
    const dbDir = path.dirname(dbPath);

    // Ensure data directory exists
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Using better-sqlite3 for synchronous operations
    // In production, consider using sqlite3 or sql.js for async support
    const db = new Database(dbPath);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create tables
    await createSqliteTables(db);

    return {
        query: async (sql: string, params: any[] = []) => {
            const stmt = db.prepare(sql);
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                return stmt.all(...params);
            }
            return stmt.run(...params);
        },
        run: async (sql: string, params: any[] = []) => {
            const stmt = db.prepare(sql);
            return stmt.run(...params);
        },
        close: async () => {
            db.close();
        }
    };
}

async function initializePostgres(): Promise<DbConnection> {
    const pool = new Pool({
        host: config.db.postgres.host,
        port: config.db.postgres.port,
        user: config.db.postgres.user,
        password: config.db.postgres.password,
        database: config.db.postgres.database
    });

    // Create tables
    await createPostgresTables(pool);

    return {
        query: async (sql: string, params: any[] = []) => {
            const result = await pool.query(sql, params);
            return result.rows;
        },
        run: async (sql: string, params: any[] = []) => {
            return pool.query(sql, params);
        },
        close: async () => {
            await pool.end();
        }
    };
}

async function createSqliteTables(db: any): Promise<void> {
    const schema = `
    -- Forms table
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      fields JSON NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Form submissions/responses
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      data JSON NOT NULL,
      status TEXT DEFAULT 'new',
      user_agent TEXT,
      ip_address TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    -- Response templates
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'default',
      content JSON NOT NULL,
      is_default BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    -- Analytics data
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    -- Create indices
    CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
    CREATE INDEX IF NOT EXISTS idx_templates_form_id ON templates(form_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_form_id ON analytics(form_id);
  `;

    db.exec(schema);
}

async function createPostgresTables(pool: Pool): Promise<void> {
    const schema = `
    -- Forms table
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      fields JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Form submissions/responses
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      data JSONB NOT NULL,
      status TEXT DEFAULT 'new',
      user_agent TEXT,
      ip_address TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    -- Response templates
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'default',
      content JSONB NOT NULL,
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    -- Analytics data
    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      metric_value NUMERIC NOT NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    -- Create indices
    CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
    CREATE INDEX IF NOT EXISTS idx_templates_form_id ON templates(form_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_form_id ON analytics(form_id);
  `;

    try {
        await pool.query(schema);
    } catch (error: any) {
        // Ignore table exists errors
        if (!error.message.includes('already exists')) {
            throw error;
        }
    }
}

export function getDatabase(): DbConnection {
    if (!dbConnection) {
        throw new Error('Database not initialized');
    }
    return dbConnection;
}

export async function setDatabase(connection: DbConnection): Promise<void> {
    dbConnection = connection;
}
