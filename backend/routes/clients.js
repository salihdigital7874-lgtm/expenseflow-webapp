const express = require('express');
const router = express.Router();
const { dbAsync, runTransaction } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/clients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const clients = await dbAsync.all(
      'SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const formatted = clients.map(c => ({
      id: c.id.toString(),
      user_id: c.user_id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone,
      total_amount: Number(c.total_amount || 0),
      paid_amount: Number(c.paid_amount || 0),
      balance_amount: Number(c.balance_amount || 0),
      status: c.status || 'active',
      created_at: c.created_at,
      updated_at: c.updated_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients: ' + error.message });
  }
});

// POST /api/clients
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, total_amount = 0, paid_amount = 0, status = 'active' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    const total = Number(total_amount) || 0;
    const paid = Number(paid_amount) || 0;
    const balance = total - paid;

    const result = await dbAsync.run(
      `INSERT INTO clients (user_id, name, email, phone, total_amount, paid_amount, balance_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name.trim(), email || null, phone || null, total, paid, balance, status]
    );

    const client = await dbAsync.get('SELECT * FROM clients WHERE id = ?', [result.lastID]);

    res.status(201).json({
      id: client.id.toString(),
      user_id: client.user_id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      total_amount: Number(client.total_amount),
      paid_amount: Number(client.paid_amount),
      balance_amount: Number(client.balance_amount),
      status: client.status,
      created_at: client.created_at,
      updated_at: client.updated_at
    });
  } catch (error) {
    console.error('❌ Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client: ' + error.message });
  }
});

// GET /api/clients/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const client = await dbAsync.get(
      'SELECT * FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    res.json({
      id: client.id.toString(),
      user_id: client.user_id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      total_amount: Number(client.total_amount),
      paid_amount: Number(client.paid_amount),
      balance_amount: Number(client.balance_amount),
      status: client.status,
      created_at: client.created_at,
      updated_at: client.updated_at
    });
  } catch (error) {
    console.error('❌ Error fetching client detail:', error);
    res.status(500).json({ error: 'Failed to fetch client detail: ' + error.message });
  }
});

// PUT /api/clients/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await dbAsync.get(
      'SELECT * FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const email = req.body.email !== undefined ? req.body.email : existing.email;
    const phone = req.body.phone !== undefined ? req.body.phone : existing.phone;
    const total_amount = req.body.total_amount !== undefined ? Number(req.body.total_amount) : Number(existing.total_amount);
    const paid_amount = req.body.paid_amount !== undefined ? Number(req.body.paid_amount) : Number(existing.paid_amount);
    const status = req.body.status !== undefined ? req.body.status : existing.status;
    const balance_amount = total_amount - paid_amount;

    await dbAsync.run(
      `UPDATE clients SET 
        name = ?,
        email = ?,
        phone = ?,
        total_amount = ?,
        paid_amount = ?,
        balance_amount = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [name, email, phone, total_amount, paid_amount, balance_amount, status, req.params.id, req.user.id]
    );

    const updated = await dbAsync.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);

    res.json({
      id: updated.id.toString(),
      user_id: updated.user_id.toString(),
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      total_amount: Number(updated.total_amount),
      paid_amount: Number(updated.paid_amount),
      balance_amount: Number(updated.balance_amount),
      status: updated.status,
      created_at: updated.created_at,
      updated_at: updated.updated_at
    });
  } catch (error) {
    console.error('❌ Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client: ' + error.message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await dbAsync.get(
      'SELECT id FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    await dbAsync.run('DELETE FROM clients WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Client deleted successfully.' });
  } catch (error) {
    console.error('❌ Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client: ' + error.message });
  }
});

// GET /api/clients/:id/payments - Payment History
router.get('/:id/payments', authenticateToken, async (req, res) => {
  try {
    const client = await dbAsync.get(
      'SELECT id FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const payments = await dbAsync.all(
      'SELECT * FROM payments WHERE client_id = ? AND user_id = ? ORDER BY payment_date DESC, created_at DESC',
      [req.params.id, req.user.id]
    );

    const formatted = payments.map(p => ({
      id: p.id.toString(),
      user_id: p.user_id.toString(),
      client_id: p.client_id.toString(),
      amount: Number(p.amount),
      payment_date: p.payment_date,
      payment_method: p.payment_method,
      reference_no: p.reference_no,
      notes: p.notes,
      created_at: p.created_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Error fetching client payments:', error);
    res.status(500).json({ error: 'Failed to fetch payment history: ' + error.message });
  }
});

// POST /api/clients/:id/payments - Record Payment (Atomic Transaction)
router.post('/:id/payments', authenticateToken, async (req, res) => {
  try {
    const { amount, payment_date, payment_method = 'Cash', reference_no = '', notes = '' } = req.body;

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'A valid positive payment amount is required.' });
    }

    const paymentDateStr = payment_date || new Date().toISOString().split('T')[0];

    // Execute atomic payment transaction
    const result = await runTransaction(async (tx) => {
      const client = await tx.get(
        'SELECT * FROM clients WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );

      if (!client) {
        throw new Error('CLIENT_NOT_FOUND');
      }

      const totalAmount = Number(client.total_amount);
      const currentPaid = Number(client.paid_amount);
      const newPaid = currentPaid + paymentAmount;

      if (newPaid > totalAmount) {
        throw new Error(`OVERPAYMENT_ERROR: Payment amount ₹${paymentAmount} exceeds total remaining balance ₹${totalAmount - currentPaid}`);
      }

      const newBalance = totalAmount - newPaid;

      // 1. Insert Payment Record
      const paymentRes = await tx.run(
        `INSERT INTO payments (user_id, client_id, amount, payment_date, payment_method, reference_no, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, client.id, paymentAmount, paymentDateStr, payment_method, reference_no, notes]
      );

      // 2. Update Client Record Ledger
      await tx.run(
        `UPDATE clients SET 
          paid_amount = ?,
          balance_amount = ?,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newPaid, newBalance, client.id]
      );

      // 3. Also log as Income entry linked to client for financial reports
      await tx.run(
        `INSERT INTO income (user_id, client_id, amount, description, date, payment_status, notes)
         VALUES (?, ?, ?, ?, ?, 'paid', ?)`,
        [req.user.id, client.id, paymentAmount, `Payment from ${client.name}`, paymentDateStr, notes || `Ref: ${reference_no}`]
      );

      const paymentRecord = await tx.get('SELECT * FROM payments WHERE id = ?', [paymentRes.lastID]);
      const updatedClient = await tx.get('SELECT * FROM clients WHERE id = ?', [client.id]);

      return {
        payment: {
          id: paymentRecord.id.toString(),
          user_id: paymentRecord.user_id.toString(),
          client_id: paymentRecord.client_id.toString(),
          amount: Number(paymentRecord.amount),
          payment_date: paymentRecord.payment_date,
          payment_method: paymentRecord.payment_method,
          reference_no: paymentRecord.reference_no,
          notes: paymentRecord.notes,
          created_at: paymentRecord.created_at
        },
        client: {
          id: updatedClient.id.toString(),
          name: updatedClient.name,
          total_amount: Number(updatedClient.total_amount),
          paid_amount: Number(updatedClient.paid_amount),
          balance_amount: Number(updatedClient.balance_amount)
        }
      };
    });

    res.status(201).json({
      message: 'Payment recorded successfully.',
      payment: result.payment,
      client: result.client
    });
  } catch (error) {
    if (error.message === 'CLIENT_NOT_FOUND') {
      return res.status(404).json({ error: 'Client not found.' });
    }
    if (error.message.startsWith('OVERPAYMENT_ERROR')) {
      return res.status(400).json({ error: error.message.replace('OVERPAYMENT_ERROR: ', '') });
    }
    console.error('❌ Error recording client payment:', error);
    res.status(500).json({ error: 'Failed to record payment transaction: ' + error.message });
  }
});

module.exports = router;
