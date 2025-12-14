import Database from 'better-sqlite3';
import { Pool } from 'pg';
import { config } from '../config/config.js';
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
      isPublic BOOLEAN DEFAULT 0,
      shareableLink TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Form submissions/responses
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      data JSON NOT NULL,
      status TEXT DEFAULT 'new',
      submission_source TEXT DEFAULT 'admin',
      user_agent TEXT,
      ip_address TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    -- Public form submissions
    CREATE TABLE IF NOT EXISTS public_submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      shareable_link TEXT NOT NULL,
      submission_data JSON NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
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

    -- API Calls Tracking table
    CREATE TABLE IF NOT EXISTS api_calls (
      id TEXT PRIMARY KEY,
      timestamp DATETIME NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      model TEXT,
      service TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      request_size INTEGER NOT NULL,
      response_size INTEGER NOT NULL,
      response_time_ms INTEGER NOT NULL,
      error_message TEXT,
      user_agent TEXT,
      ip_address TEXT,
      request_body TEXT,
      response_body TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indices
    CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
    CREATE INDEX IF NOT EXISTS idx_templates_form_id ON templates(form_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_form_id ON analytics(form_id);
    CREATE INDEX IF NOT EXISTS idx_api_calls_timestamp ON api_calls(timestamp);
    CREATE INDEX IF NOT EXISTS idx_api_calls_model ON api_calls(model);
    CREATE INDEX IF NOT EXISTS idx_api_calls_service ON api_calls(service);
    CREATE INDEX IF NOT EXISTS idx_api_calls_endpoint ON api_calls(endpoint);
    CREATE INDEX IF NOT EXISTS idx_api_calls_status_code ON api_calls(status_code);
    CREATE INDEX IF NOT EXISTS idx_api_calls_model_timestamp ON api_calls(model, timestamp);
    CREATE INDEX IF NOT EXISTS idx_api_calls_endpoint_timestamp ON api_calls(endpoint, timestamp);
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
      isPublic BOOLEAN DEFAULT false,
      shareableLink TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Form submissions/responses
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      data JSONB NOT NULL,
      status TEXT DEFAULT 'new',
      submission_source TEXT DEFAULT 'admin',
      user_agent TEXT,
      ip_address TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    -- Public form submissions
    CREATE TABLE IF NOT EXISTS public_submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      shareable_link TEXT NOT NULL,
      submission_data JSONB NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
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

    -- API Calls Tracking table
    CREATE TABLE IF NOT EXISTS api_calls (
      id TEXT PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      model TEXT,
      service TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      request_size INTEGER NOT NULL,
      response_size INTEGER NOT NULL,
      response_time_ms INTEGER NOT NULL,
      error_message TEXT,
      user_agent TEXT,
      ip_address TEXT,
      request_body TEXT,
      response_body TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indices
    CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
    CREATE INDEX IF NOT EXISTS idx_templates_form_id ON templates(form_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_form_id ON analytics(form_id);
    CREATE INDEX IF NOT EXISTS idx_api_calls_timestamp ON api_calls(timestamp);
    CREATE INDEX IF NOT EXISTS idx_api_calls_model ON api_calls(model);
    CREATE INDEX IF NOT EXISTS idx_api_calls_service ON api_calls(service);
    CREATE INDEX IF NOT EXISTS idx_api_calls_endpoint ON api_calls(endpoint);
    CREATE INDEX IF NOT EXISTS idx_api_calls_status_code ON api_calls(status_code);
    CREATE INDEX IF NOT EXISTS idx_api_calls_model_timestamp ON api_calls(model, timestamp);
    CREATE INDEX IF NOT EXISTS idx_api_calls_endpoint_timestamp ON api_calls(endpoint, timestamp);
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
