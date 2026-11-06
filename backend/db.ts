import pg from 'pg';
import { config } from './config';

const { Pool } = pg;

// Connection pooling configuration for PostgreSQL (Render compatible)
let pool: pg.Pool | null = null;

export function getPool(): pg.Pool | null {
  if (!config.databaseUrl) {
    return null;
  }

  if (!pool) {
    const isLocalhost =
      config.databaseUrl.includes('localhost') ||
      config.databaseUrl.includes('127.0.0.1');

    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 20, // Max clients in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error] Unexpected idle client error:', err.message);
    });
  }

  return pool;
}

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('DATABASE_URL is not set. PostgreSQL connection pool unavailable.');
  }

  const start = Date.now();
  try {
    const result = await currentPool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL === 'true') {
      console.log('[SQL]', { text, duration, rows: result.rowCount });
    }
    return result;
  } catch (error: any) {
    console.error('[SQL Error]', {
      message: error.message,
      query: text.slice(0, 100),
    });
    throw error;
  }
}

export interface ConnectionTestResult {
  connected: boolean;
  databaseName?: string;
  version?: string;
  serverTime?: string;
  latencyMs?: number;
  tables?: string[];
  error?: string;
}

export async function testConnection(): Promise<ConnectionTestResult> {
  if (!config.databaseUrl) {
    return {
      connected: false,
      error: 'DATABASE_URL is not configured in environment variables.',
    };
  }

  const start = Date.now();
  try {
    const res = await query(
      `SELECT NOW() AS now, current_database() AS db_name, version() AS version;`
    );
    const latency = Date.now() - start;

    // Also fetch list of public tables if available
    let tableNames: string[] = [];
    try {
      const tableRes = await query(
        `SELECT table_name 
         FROM information_schema.tables 
         WHERE table_schema = 'public' 
         ORDER BY table_name;`
      );
      tableNames = tableRes.rows.map((r: any) => r.table_name);
    } catch {
      // Non-fatal if table listing query fails
    }

    return {
      connected: true,
      databaseName: res.rows[0]?.db_name,
      version: res.rows[0]?.version?.split(' ')?.[0] + ' ' + (res.rows[0]?.version?.split(' ')?.[1] || ''),
      serverTime: res.rows[0]?.now?.toISOString?.() || String(res.rows[0]?.now),
      latencyMs: latency,
      tables: tableNames,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Failed to establish connection to PostgreSQL database.',
      latencyMs: Date.now() - start,
    };
  }
}
