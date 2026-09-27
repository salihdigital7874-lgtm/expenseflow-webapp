const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_FILE || path.join(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`✅ SQLite Database connected at: ${dbPath}`);
  }
});

// Promisified Database Helper Methods
const dbAsync = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// SQLite Transaction Helper
async function runTransaction(callback) {
  await dbAsync.run('BEGIN TRANSACTION');
  try {
    const result = await callback(dbAsync);
    await dbAsync.run('COMMIT');
    return result;
  } catch (error) {
    await dbAsync.run('ROLLBACK');
    throw error;
  }
}

// Initialize Tables & Indexes
async function initDatabase() {
  try {
    // Enable Foreign Keys & Write-Ahead Logging for speed & safety
    await dbAsync.run('PRAGMA foreign_keys = ON;');
    await dbAsync.run('PRAGMA journal_mode = WAL;');

    // Users Table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Profiles & Branding Table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        full_name TEXT,
        email TEXT,
        company_name TEXT,
        phone TEXT,
        currency TEXT DEFAULT 'INR',
        app_name TEXT DEFAULT 'SalihPort',
        app_subtitle TEXT DEFAULT 'Expense & Client Ledger System',
        app_logo TEXT,
        accent_color TEXT DEFAULT '#4F46E5',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Clients Table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        total_amount REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        balance_amount REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Expenses Table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        payment_method TEXT DEFAULT 'Cash',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Income Table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        client_id INTEGER,
        amount REAL NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        payment_status TEXT DEFAULT 'paid',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
      );
    `);

    // Payments Table (Client Payment History)
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_date TEXT NOT NULL,
        payment_method TEXT DEFAULT 'Cash',
        reference_no TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      );
    `);

    // Budgets Table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        budget_amount REAL NOT NULL,
        start_date TEXT,
        end_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create Indexes for performance
    await dbAsync.run(`CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);`);
    await dbAsync.run(`CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);`);
    await dbAsync.run(`CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, date);`);
    await dbAsync.run(`CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);`);
    await dbAsync.run(`CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);`);

    // Seed default admin user if no user exists
    const adminCheck = await dbAsync.get('SELECT id FROM users LIMIT 1;');
    if (!adminCheck) {
      const defaultPassword = 'AdminPassword123!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(defaultPassword, salt);
      const result = await dbAsync.run(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Muhammed Salih', 'admin@salihport.local', hash, 'admin']
      );
      
      const userId = result.lastID;
      await dbAsync.run(
        `INSERT INTO profiles (user_id, full_name, email, company_name, phone, currency, app_name, app_subtitle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          'Muhammed Salih',
          'admin@salihport.local',
          'SalihPort Digital',
          '+91 90000 00000',
          'INR',
          'SalihPort',
          'Business Expense & Client Ledger System'
        ]
      );

      console.log('👤 Default admin account created: admin@salihport.local / AdminPassword123!');
    }

    console.log('✅ SQLite Schema Initialized successfully.');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
  }
}

module.exports = {
  db,
  dbAsync,
  runTransaction,
  initDatabase
};
