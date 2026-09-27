const express = require('express');
const router = express.Router();
const { dbAsync } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/expenses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const expenses = await dbAsync.all(
      'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      [req.user.id]
    );

    const formatted = expenses.map(e => ({
      id: e.id.toString(),
      user_id: e.user_id.toString(),
      amount: Number(e.amount),
      category: e.category,
      description: e.description,
      date: e.date,
      payment_method: e.payment_method || 'Cash',
      notes: e.notes,
      created_at: e.created_at,
      updated_at: e.updated_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses: ' + error.message });
  }
});

// POST /api/expenses
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { amount, category, description, date, payment_method = 'Cash', notes } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive expense amount is required.' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Expense category is required.' });
    }

    const dateStr = date || new Date().toISOString().split('T')[0];

    const result = await dbAsync.run(
      `INSERT INTO expenses (user_id, amount, category, description, date, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, numAmount, category, description || null, dateStr, payment_method, notes || null]
    );

    const expense = await dbAsync.get('SELECT * FROM expenses WHERE id = ?', [result.lastID]);

    res.status(201).json({
      id: expense.id.toString(),
      user_id: expense.user_id.toString(),
      amount: Number(expense.amount),
      category: expense.category,
      description: expense.description,
      date: expense.date,
      payment_method: expense.payment_method,
      notes: expense.notes,
      created_at: expense.created_at,
      updated_at: expense.updated_at
    });
  } catch (error) {
    console.error('❌ Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense entry: ' + error.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await dbAsync.get(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Expense entry not found.' });
    }

    const amount = req.body.amount !== undefined ? Number(req.body.amount) : existing.amount;
    const category = req.body.category !== undefined ? req.body.category : existing.category;
    const description = req.body.description !== undefined ? req.body.description : existing.description;
    const date = req.body.date !== undefined ? req.body.date : existing.date;
    const payment_method = req.body.payment_method !== undefined ? req.body.payment_method : existing.payment_method;
    const notes = req.body.notes !== undefined ? req.body.notes : existing.notes;

    await dbAsync.run(
      `UPDATE expenses SET 
        amount = ?,
        category = ?,
        description = ?,
        date = ?,
        payment_method = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [amount, category, description, date, payment_method, notes, req.params.id, req.user.id]
    );

    const updated = await dbAsync.get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);

    res.json({
      id: updated.id.toString(),
      user_id: updated.user_id.toString(),
      amount: Number(updated.amount),
      category: updated.category,
      description: updated.description,
      date: updated.date,
      payment_method: updated.payment_method,
      notes: updated.notes,
      created_at: updated.created_at,
      updated_at: updated.updated_at
    });
  } catch (error) {
    console.error('❌ Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense entry: ' + error.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await dbAsync.get(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Expense entry not found.' });
    }

    await dbAsync.run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Expense entry deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense entry: ' + error.message });
  }
});

module.exports = router;
