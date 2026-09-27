const express = require('express');
const router = express.Router();
const { dbAsync } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/budgets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const budgets = await dbAsync.all(
      'SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const formatted = budgets.map(b => ({
      id: b.id.toString(),
      user_id: b.user_id.toString(),
      category: b.category,
      budget_amount: Number(b.budget_amount),
      start_date: b.start_date,
      end_date: b.end_date,
      created_at: b.created_at,
      updated_at: b.updated_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budget targets: ' + error.message });
  }
});

// POST /api/budgets
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { category, budget_amount, start_date, end_date } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Budget category is required.' });
    }

    const numAmount = Number(budget_amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive budget amount is required.' });
    }

    const result = await dbAsync.run(
      `INSERT INTO budgets (user_id, category, budget_amount, start_date, end_date)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, category, numAmount, start_date || null, end_date || null]
    );

    const budget = await dbAsync.get('SELECT * FROM budgets WHERE id = ?', [result.lastID]);

    res.status(201).json({
      id: budget.id.toString(),
      user_id: budget.user_id.toString(),
      category: budget.category,
      budget_amount: Number(budget.budget_amount),
      start_date: budget.start_date,
      end_date: budget.end_date,
      created_at: budget.created_at,
      updated_at: budget.updated_at
    });
  } catch (error) {
    console.error('❌ Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget target: ' + error.message });
  }
});

// PUT /api/budgets/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await dbAsync.get(
      'SELECT * FROM budgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Budget target not found.' });
    }

    const category = req.body.category !== undefined ? req.body.category : existing.category;
    const budget_amount = req.body.budget_amount !== undefined ? Number(req.body.budget_amount) : existing.budget_amount;
    const start_date = req.body.start_date !== undefined ? req.body.start_date : existing.start_date;
    const end_date = req.body.end_date !== undefined ? req.body.end_date : existing.end_date;

    await dbAsync.run(
      `UPDATE budgets SET 
        category = ?,
        budget_amount = ?,
        start_date = ?,
        end_date = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [category, budget_amount, start_date, end_date, req.params.id, req.user.id]
    );

    const updated = await dbAsync.get('SELECT * FROM budgets WHERE id = ?', [req.params.id]);

    res.json({
      id: updated.id.toString(),
      user_id: updated.user_id.toString(),
      category: updated.category,
      budget_amount: Number(updated.budget_amount),
      start_date: updated.start_date,
      end_date: updated.end_date,
      created_at: updated.created_at,
      updated_at: updated.updated_at
    });
  } catch (error) {
    console.error('❌ Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget target: ' + error.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await dbAsync.get(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Budget target not found.' });
    }

    await dbAsync.run('DELETE FROM budgets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Budget target deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget target: ' + error.message });
  }
});

module.exports = router;
