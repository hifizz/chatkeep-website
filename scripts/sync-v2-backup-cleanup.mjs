#!/usr/bin/env node
import path from "node:path";
import process from "node:process";

import postgres from "postgres";

const SOURCE_SYNC_RECORDS = "chat_aside_sync_records";
const SOURCE_SYNC_USER_STATE = "chat_aside_sync_user_state";

function loadEnvFile(fileName) {
  const envPath = path.join(process.cwd(), fileName);
  if (typeof process.loadEnvFile !== "function") return;
  try {
    process.loadEnvFile(envPath);
  } catch {
    // ignore missing env files
  }
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

function toCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function formatSuffix(date) {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hour}${minute}${second}`;
}

function parseArgs(argv) {
  const options = {
    execute: false,
    suffix: formatSuffix(new Date()),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--execute") {
      options.execute = true;
      continue;
    }
    if (arg === "--suffix") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--suffix requires a value");
      }
      options.suffix = value.replace(/[^a-zA-Z0-9_]/g, "_");
      i += 1;
      continue;
    }
    if (arg === "--help") {
      options.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function countRows(client, tableName) {
  const rows = await client.unsafe(
    `select count(*)::bigint as count from ${quoteIdentifier(tableName)}`,
  );
  return toCount(rows[0]?.count);
}

async function tableExists(client, tableName) {
  const rows = await client`
    select to_regclass(${tableName}) as name
  `;
  return Boolean(rows[0]?.name);
}

function buildRestoreSql(backupRecordsTable, backupUserStateTable) {
  const srcRecords = quoteIdentifier(SOURCE_SYNC_RECORDS);
  const srcUserState = quoteIdentifier(SOURCE_SYNC_USER_STATE);
  const backupRecords = quoteIdentifier(backupRecordsTable);
  const backupUserState = quoteIdentifier(backupUserStateTable);

  return [
    `truncate table ${srcRecords};`,
    `truncate table ${srcUserState};`,
    `insert into ${srcRecords} select * from ${backupRecords};`,
    `insert into ${srcUserState} select * from ${backupUserState};`,
  ].join("\n");
}

function printHelp() {
  console.log(`sync-v2 backup/cleanup script

Usage:
  node ./scripts/sync-v2-backup-cleanup.mjs [--suffix <value>] [--execute]

Options:
  --execute         Actually create backup tables and clear source tables.
  --suffix <value>  Suffix for backup table names (default: UTC timestamp).
  --help            Show this help message.

Default mode is dry-run. Without --execute, no data is modified.
`);
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  printHelp();
  process.exit(0);
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL.");
  process.exit(1);
}

const backupRecordsTable = `chat_aside_sync_records_backup_${options.suffix}`;
const backupUserStateTable = `chat_aside_sync_user_state_backup_${options.suffix}`;

const sql = postgres(databaseUrl, { max: 1 });

try {
  const [sourceRecordsCount, sourceUserStateCount] = await Promise.all([
    countRows(sql, SOURCE_SYNC_RECORDS),
    countRows(sql, SOURCE_SYNC_USER_STATE),
  ]);

  const dryRunPayload = {
    mode: options.execute ? "execute" : "dry-run",
    source: {
      syncRecords: sourceRecordsCount,
      syncUserState: sourceUserStateCount,
    },
    backup: {
      syncRecordsTable: backupRecordsTable,
      syncUserStateTable: backupUserStateTable,
    },
  };

  if (!options.execute) {
    console.log(JSON.stringify(dryRunPayload, null, 2));
    console.log("\nRe-run with --execute to apply cleanup.");
    process.exit(0);
  }

  const [recordsBackupExists, userStateBackupExists] = await Promise.all([
    tableExists(sql, backupRecordsTable),
    tableExists(sql, backupUserStateTable),
  ]);
  if (recordsBackupExists || userStateBackupExists) {
    throw new Error("Backup table already exists. Please use a different --suffix.");
  }

  const summary = await sql.begin(async (tx) => {
    await tx.unsafe(
      `create table ${quoteIdentifier(backupRecordsTable)} as table ${quoteIdentifier(SOURCE_SYNC_RECORDS)} with data`,
    );
    await tx.unsafe(
      `create table ${quoteIdentifier(backupUserStateTable)} as table ${quoteIdentifier(SOURCE_SYNC_USER_STATE)} with data`,
    );

    const [backupRecordsCount, backupUserStateCount] = await Promise.all([
      countRows(tx, backupRecordsTable),
      countRows(tx, backupUserStateTable),
    ]);

    if (
      backupRecordsCount !== sourceRecordsCount ||
      backupUserStateCount !== sourceUserStateCount
    ) {
      throw new Error("Backup row count mismatch. Transaction aborted.");
    }

    const deletedRecordsRows = await tx.unsafe(
      `delete from ${quoteIdentifier(SOURCE_SYNC_RECORDS)}`,
    );
    const deletedUserStateRows = await tx.unsafe(
      `delete from ${quoteIdentifier(SOURCE_SYNC_USER_STATE)}`,
    );

    const [remainingRecords, remainingUserState] = await Promise.all([
      countRows(tx, SOURCE_SYNC_RECORDS),
      countRows(tx, SOURCE_SYNC_USER_STATE),
    ]);

    if (remainingRecords !== 0 || remainingUserState !== 0) {
      throw new Error("Source cleanup verification failed. Transaction aborted.");
    }

    return {
      backupRecordsCount,
      backupUserStateCount,
      deletedRecords: deletedRecordsRows.count,
      deletedUserState: deletedUserStateRows.count,
    };
  });

  console.log(
    JSON.stringify(
      {
        ...dryRunPayload,
        result: summary,
        restoreSql: buildRestoreSql(backupRecordsTable, backupUserStateTable),
      },
      null,
      2,
    ),
  );
} finally {
  await sql.end({ timeout: 5 });
}
