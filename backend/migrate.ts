import fs from 'fs';
import path from 'path';
import { query, getPool, testConnection } from './db';
import { config } from './config';

export async function runMigrations(): Promise<{ success: boolean; message: string; details?: any }> {
  if (!config.databaseUrl) {
    return {
      success: false,
      message: 'DATABASE_URL is not set in environment. Migration skipped.',
    };
  }

  const pool = getPool();
  if (!pool) {
    return {
      success: false,
      message: 'Could not initialize PostgreSQL pool.',
    };
  }

  try {
    console.log('[PostgreSQL Migration] Verifying database connection...');
    const connCheck = await testConnection();
    if (!connCheck.connected) {
      throw new Error(`Database connection failed: ${connCheck.error}`);
    }

    console.log(`[PostgreSQL Migration] Connected to "${connCheck.databaseName}". Reading schema.sql...`);
    
    // Locate schema.sql
    const schemaPath = path.resolve(process.cwd(), 'backend/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Run the schema inside a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(schemaSql);
      await client.query('COMMIT');
      console.log('[PostgreSQL Migration] All tables and indexes successfully migrated!');
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // Inspect created tables
    const tableRes = await query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name;`
    );

    const tables = tableRes.rows.map((r: any) => r.table_name);
    return {
      success: true,
      message: `Database migrated successfully. Active tables: ${tables.join(', ')}`,
      details: {
        database: connCheck.databaseName,
        tables,
        latencyMs: connCheck.latencyMs,
      },
    };
  } catch (err: any) {
    console.error('[PostgreSQL Migration Error]:', err.message);
    return {
      success: false,
      message: err.message,
    };
  }
}

// Allow direct execution: npx tsx backend/migrate.ts
if (process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
