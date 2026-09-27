const express = require('express');
const router = express.Router();
const { dbAsync } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/income
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await dbAsync.all(
      `SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone 
       FROM income i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.user_id = ?
       ORDER BY i.date DESC, i.created_at DESC`,
      [req.user.id]
    );

    const formatted = rows.map(r => ({
      id: r.id.toString(),
      user_id: r.user_id.toString(),
      client_id: r.client_id ? r.client_id.toString() : null,
      amount: Number(r.amount),
      description: r.description,
      date: r.date,
      payment_status: r.payment_status || 'paid',
      notes: r.notes,
      created_at: r.created_at,
      updated_at: r.updated_at,
      client: r.client_id ? {
        id: r.client_id.toString(),
        name: r.client_name,
        email: r.client_email,
        phone: r.client_phone
      } : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error fetching income records:', error);
    res.status(500).json({ error: 'Failed to fetch income records: ' + error.message });
  }
});

// POST /api/income
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { client_id, amount, description, date, payment_status = 'paid', notes } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive income amount is required.' });
    }

    const dateStr = date || new Date().toISOString().split('T')[0];

    const result = await dbAsync.run(
      `INSERT INTO income (user_id, client_id, amount, description, date, payment_status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, client_id ? Number(client_id) : null, numAmount, description || null, dateStr, payment_status, notes || null]
    );

    const record = await dbAsync.get('SELECT * FROM income WHERE id = ?', [result.lastID]);

    let client = null;
    if (record.client_id) {
      client = await dbAsync.get('SELECT id, name, email, phone FROM clients WHERE id = ?', [record.client_id]);
    }

    res.status(201).json({
      id: record.id.toString(),
      user_id: record.user_id.toString(),
      client_id: record.client_id ? record.client_id.toString() : null,
      amount: Number(record.amount),
      description: record.description,
      date: record.date,
      payment_status: record.payment_status,
      notes: record.notes,
      created_at: record.created_at,
      updated_at: record.updated_at,
      client: client ? {
        id: client.id.toString(),
        name: client.name,
        email: client.email,
        phone: client.phone
      } : null
    });
  } catch (error) {
    console.error('❌ Error creating income record:', error);
    res.status(500).json({ error: 'Failed to create income record: ' + error.message });
  }
});

// PUT /api/income/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await dbAsync.get(
      'SELECT * FROM income WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Income record not found.' });
    }

    const client_id = req.body.client_id !== undefined ? (req.body.client_id ? Number(req.body.client_id) : null) : existing.client_id;
    const amount = req.body.amount !== undefined ? Number(req.body.amount) : existing.amount;
    const description = req.body.description !== undefined ? req.body.description : existing.description;
    const date = req.body.date !== undefined ? req.body.date : existing.date;
    const payment_status = req.body.payment_status !== undefined ? req.body.payment_status : existing.payment_status;
    const notes = req.body.notes !== undefined ? req.body.notes : existing.notes;

    await dbAsync.run(
      `UPDATE income SET 
        client_id = ?,
        amount = ?,
        description = ?,
        date = ?,
        payment_status = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [client_id, amount, description, date, payment_status, notes, req.params.id, req.user.id]
    );

    const updated = await dbAsync.get('SELECT * FROM income WHERE id = ?', [req.params.id]);

    let client = null;
    if (updated.client_id) {
      client = await dbAsync.get('SELECT id, name, email, phone FROM clients WHERE id = ?', [updated.client_id]);
    }

    res.json({
      id: updated.id.toString(),
      user_id: updated.user_id.toString(),
      client_id: updated.client_id ? updated.client_id.toString() : null,
      amount: Number(updated.amount),
      description: updated.description,
      date: updated.date,
      payment_status: updated.payment_status,
      notes: updated.notes,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
      client: client ? {
        id: client.id.toString(),
        name: client.name,
        email: client.email,
        phone: client.phone
      } : null
    });
  } catch (error) {
    console.error('❌ Error updating income record:', error);
    res.status(500).json({ error: 'Failed to update income record: ' + error.message });
  }
});

// DELETE /api/income/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await dbAsync.get(
      'SELECT id FROM income WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Income record not found.' });
    }

    await dbAsync.run('DELETE FROM income WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Income record deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting income record:', error);
    res.status(500).json({ error: 'Failed to delete income record: ' + error.message });
  }
});

module.exports = router;
