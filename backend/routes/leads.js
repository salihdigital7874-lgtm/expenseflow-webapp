const express = require('express');
const router = express.Router();
const { dbAsync, generateLeadId } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Apply auth middleware to all lead endpoints
router.use(authenticateToken);

// GET /api/leads - Fetch leads with search and filter parameters
router.get('/', async (req, res) => {
  try {
    const { search, status, source, limit, offset } = req.query;

    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      sql += ' AND (customer_name LIKE ? OR phone LIKE ? OR email LIKE ? OR lead_id LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'All') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (source && source !== 'All') {
      sql += ' AND source = ?';
      params.push(source);
    }

    sql += ' ORDER BY id DESC';

    if (limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
    }

    const leads = await dbAsync.all(sql, params);
    
    // Total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM leads WHERE 1=1';
    const countParams = [];

    if (search && search.trim() !== '') {
      countSql += ' AND (customer_name LIKE ? OR phone LIKE ? OR email LIKE ? OR lead_id LIKE ?)';
      const term = `%${search.trim()}%`;
      countParams.push(term, term, term, term);
    }
    if (status && status !== 'All') {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    if (source && source !== 'All') {
      countSql += ' AND source = ?';
      countParams.push(source);
    }

    const countResult = await dbAsync.get(countSql, countParams);

    res.json({
      success: true,
      data: leads,
      total: countResult ? countResult.total : 0
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ success: false, error: 'Database error fetching leads.' });
  }
});

// GET /api/leads/export - Export leads to CSV format
router.get('/export', async (req, res) => {
  try {
    const { status, source } = req.query;
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (source && source !== 'All') {
      sql += ' AND source = ?';
      params.push(source);
    }

    sql += ' ORDER BY id DESC';

    const leads = await dbAsync.all(sql, params);

    // Build CSV Header
    let csv = 'Lead ID,Customer Name,Phone,Email,Source,Status,Notes,Created At,Updated At\n';

    leads.forEach((l) => {
      const escape = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;
      csv += `${escape(l.lead_id)},${escape(l.customer_name)},${escape(l.phone)},${escape(l.email)},${escape(l.source)},${escape(l.status)},${escape(l.notes)},${escape(l.created_at)},${escape(l.updated_at)}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads_export.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ success: false, error: 'Error generating CSV file.' });
  }
});

// GET /api/leads/:id - Fetch single lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await dbAsync.get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching lead details.' });
  }
});

// POST /api/leads - Create new lead
router.post('/', async (req, res) => {
  try {
    const { customer_name, phone, email, source, status, notes } = req.body;

    if (!customer_name || !phone) {
      return res.status(400).json({ success: false, error: 'Customer name and phone number are required fields.' });
    }

    const lead_id = await generateLeadId();

    const result = await dbAsync.run(
      `INSERT INTO leads (lead_id, customer_name, phone, email, source, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        lead_id,
        customer_name.trim(),
        phone.trim(),
        email ? email.trim() : '',
        source || 'Meta Ads',
        status || 'New',
        notes ? notes.trim() : ''
      ]
    );

    const newLead = await dbAsync.get('SELECT * FROM leads WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      data: newLead
    });
  } catch (error) {
    console.error('Create Lead Error:', error);
    res.status(500).json({ success: false, error: 'Failed to create new lead.' });
  }
});

// PUT /api/leads/:id - Update existing lead
router.put('/:id', async (req, res) => {
  try {
    const { customer_name, phone, email, source, status, notes } = req.body;
    const { id } = req.params;

    const existing = await dbAsync.get('SELECT id FROM leads WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    if (!customer_name || !phone) {
      return res.status(400).json({ success: false, error: 'Customer name and phone number are required.' });
    }

    const now = new Date().toISOString();

    await dbAsync.run(
      `UPDATE leads 
       SET customer_name = ?, phone = ?, email = ?, source = ?, status = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [
        customer_name.trim(),
        phone.trim(),
        email ? email.trim() : '',
        source || 'Meta Ads',
        status || 'New',
        notes ? notes.trim() : '',
        now,
        id
      ]
    );

    const updatedLead = await dbAsync.get('SELECT * FROM leads WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Lead updated successfully.',
      data: updatedLead
    });
  } catch (error) {
    console.error('Update Lead Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update lead.' });
  }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbAsync.get('SELECT id FROM leads WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    await dbAsync.run('DELETE FROM leads WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Lead #${id} deleted successfully.`
    });
  } catch (error) {
    console.error('Delete Lead Error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete lead.' });
  }
});

module.exports = router;
