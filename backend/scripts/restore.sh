#!/bin/bash
# SQLite Database Restore Script for POCO Phone Server (Termux)

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <path_to_backup_file.db>"
  echo "Example: ./restore.sh /sdcard/ExpenseFlow_Backups/crm_backup_20260919_120000.db"
  exit 1
fi

RESTORE_SRC="$1"
DB_PATH="${DB_FILE:-./crm.db}"

if [ ! -f "$RESTORE_SRC" ]; then
  echo "❌ Specified backup file does not exist: $RESTORE_SRC"
  exit 1
fi

echo "⚠️ WARNING: Restoring will overwrite active database at ${DB_PATH}!"
read -p "Are you sure you want to proceed? (y/N): " confirm

if [[ "$confirm" =~ ^[Yy]$ ]]; then
  # Verify SQLite file integrity
  INTEGRITY=$(sqlite3 "$RESTORE_SRC" "PRAGMA quick_check;")
  if [ "$INTEGRITY" != "ok" ]; then
    echo "❌ Backup file integrity check failed! Aborting restore."
    exit 1
  fi

  cp "$RESTORE_SRC" "$DB_PATH"
  echo "✅ Database restored successfully from ${RESTORE_SRC}."
else
  echo "Restore cancelled."
fi
