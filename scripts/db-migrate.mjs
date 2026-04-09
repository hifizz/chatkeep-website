import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import postgres from "postgres";

const rootDir = process.cwd();
const migrationsDir = path.join(rootDir, "drizzle");
const journalPath = path.join(migrationsDir, "meta", "_journal.json");

loadEnvFile(".env");
loadEnvFile(".env.local");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("缺少 DATABASE_URL，无法执行数据库迁移。");
  process.exit(1);
}

await ensureMigrationBaseline({
  databaseUrl,
  migrationsDir,
  journalPath,
});

const result = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], {
  cwd: rootDir,
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);

function loadEnvFile(fileName) {
  const envPath = path.join(rootDir, fileName);

  if (!existsSync(envPath) || typeof process.loadEnvFile !== "function") {
    return;
  }

  process.loadEnvFile(envPath);
}

async function ensureMigrationBaseline({ databaseUrl, migrationsDir, journalPath }) {
  if (!existsSync(journalPath)) {
    throw new Error(`找不到 Drizzle journal 文件: ${journalPath}`);
  }

  const journal = JSON.parse(readFileSync(journalPath, "utf8"));
  const migrations = journal.entries.map((entry) => {
    const migrationPath = path.join(migrationsDir, `${entry.tag}.sql`);
    const sql = readFileSync(migrationPath, "utf8");

    return {
      tag: entry.tag,
      createdAt: entry.when,
      hash: createHash("sha256").update(sql).digest("hex"),
    };
  });

  if (migrations.length === 0) {
    return;
  }

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    await sql`create schema if not exists drizzle`;
    await sql`
      create table if not exists drizzle.__drizzle_migrations (
        id serial primary key,
        hash text not null,
        created_at bigint
      )
    `;

    const [migrationState] = await sql`
      select count(*)::int as count
      from drizzle.__drizzle_migrations
    `;

    if (migrationState.count > 0) {
      return;
    }

    const existingColumns = await sql`
      select table_name, column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name like 'chat_aside_%'
    `;

    const existingByTable = new Map();
    for (const row of existingColumns) {
      const columns = existingByTable.get(row.table_name) ?? new Set();
      columns.add(row.column_name);
      existingByTable.set(row.table_name, columns);
    }

    if (existingByTable.size === 0) {
      return;
    }

    const latestEntryIndex = journal.entries.length - 1;
    const latestExpectedTables = readExpectedSchemaByEntry({
      journal,
      migrationsDir,
      entryIndex: latestEntryIndex,
    });
    const latestIncompleteTables = findIncompleteTables(latestExpectedTables, existingByTable);

    let baselineEntryIndex = latestIncompleteTables.length === 0 ? latestEntryIndex : -1;

    if (baselineEntryIndex < 0) {
      for (let entryIndex = latestEntryIndex - 1; entryIndex >= 0; entryIndex--) {
        const expectedTablesAtEntry = readExpectedSchemaByEntry({
          journal,
          migrationsDir,
          entryIndex,
        });
        const incompleteAtEntry = findIncompleteTables(expectedTablesAtEntry, existingByTable);
        if (incompleteAtEntry.length === 0) {
          baselineEntryIndex = entryIndex;
          break;
        }
      }
    }

    if (baselineEntryIndex < 0) {
      const details = formatMissingTableDetails(latestIncompleteTables, existingByTable);
      throw new Error(
        `检测到数据库已有部分表结构，但无法匹配任何历史迁移基线，已停止自动补基线。${details}`,
      );
    }

    const baselineMigrations = migrations.slice(0, baselineEntryIndex + 1);
    if (baselineMigrations.length === 0) {
      return;
    }

    await sql.begin(async (tx) => {
      for (const migration of baselineMigrations) {
        await tx`
          insert into drizzle.__drizzle_migrations (hash, created_at)
          values (${migration.hash}, ${migration.createdAt})
        `;
      }
    });

    if (baselineEntryIndex === latestEntryIndex) {
      console.log(
        `检测到数据库表结构已存在但 Drizzle 迁移历史为空，已自动补齐 ${baselineMigrations.length} 条基线记录。`,
      );
      return;
    }

    const remainingCount = migrations.length - baselineMigrations.length;
    console.log(
      `检测到数据库处于部分迁移状态，已自动补齐前 ${baselineMigrations.length} 条基线（截至 ${journal.entries[baselineEntryIndex].tag}），将继续执行剩余 ${remainingCount} 条迁移。`,
    );
  } finally {
    await sql.end({ timeout: 1 });
  }
}

function readExpectedSchemaByEntry({ journal, migrationsDir, entryIndex }) {
  const entry = journal.entries[entryIndex];
  const snapshotPath = path.join(
    migrationsDir,
    "meta",
    `${entry.idx.toString().padStart(4, "0")}_snapshot.json`,
  );
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));

  return Object.entries(snapshot.tables)
    .filter(([name]) => name.startsWith("public.chat_aside_"))
    .map(([, table]) => ({
      name: table.name,
      columns: Object.keys(table.columns),
    }));
}

function findIncompleteTables(expectedTables, existingByTable) {
  return expectedTables.filter((table) => {
    const columns = existingByTable.get(table.name);
    return !columns || table.columns.some((column) => !columns.has(column));
  });
}

function formatMissingTableDetails(incompleteTables, existingByTable) {
  return incompleteTables
    .map((table) => {
      const existing = existingByTable.get(table.name) ?? new Set();
      const missingColumns = table.columns.filter((column) => !existing.has(column));
      return `${table.name}: 缺少 ${missingColumns.join(", ")}`;
    })
    .join("; ");
}
