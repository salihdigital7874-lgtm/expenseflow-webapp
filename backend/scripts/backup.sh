#!/bin/bash
# SQLite Database Backup Script for POCO Phone Server (Termux)

BACKUP_DIR="/sdcard/ExpenseFlow_Backups"
DB_PATH="${DB_FILE:-./crm.db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/crm_backup_${TIMESTAMP}.db"

mkdir -p "$BACKUP_DIR"

echo "📦 Starting SQLite database backup..."
if [ -f "$DB_PATH" ]; then
  # Use sqlite3 online backup API to prevent corruption if DB is in active use
  sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
  if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: ${BACKUP_FILE}"
    # Keep only last 14 days of backups
    find "$BACKUP_DIR" -name "crm_backup_*.db" -mtime +14 -delete
    echo "🧹 Cleaned backups older than 14 days."
  else
    echo "❌ SQLite backup failed!"
    exit 1
  fi
else
  echo "❌ Database file not found at: ${DB_PATH}"
  exit 1
fi
