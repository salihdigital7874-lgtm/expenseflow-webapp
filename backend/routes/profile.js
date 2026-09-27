const express = require('express');
const router = express.Router();
const { dbAsync } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    let profile = await dbAsync.get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    
    if (!profile) {
      // Auto-create default profile if missing
      await dbAsync.run(
        `INSERT INTO profiles (user_id, full_name, email, currency, app_name, app_subtitle) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.name, req.user.email, 'INR', 'SalihPort', 'Expense & Client Ledger System']
      );
      profile = await dbAsync.get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    }

    res.json({
      id: profile.id.toString(),
      user_id: profile.user_id.toString(),
      full_name: profile.full_name,
      email: profile.email,
      company_name: profile.company_name,
      phone: profile.phone,
      currency: profile.currency || 'INR',
      app_name: profile.app_name || 'SalihPort',
      app_subtitle: profile.app_subtitle || 'Expense & Client Ledger System',
      app_logo: profile.app_logo,
      accent_color: profile.accent_color || '#4F46E5',
      created_at: profile.created_at,
      updated_at: profile.updated_at
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile: ' + error.message });
  }
});

// PUT /api/profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { full_name, company_name, phone, currency, app_name, app_subtitle, app_logo, accent_color } = req.body;

    const existing = await dbAsync.get('SELECT id FROM profiles WHERE user_id = ?', [req.user.id]);

    if (existing) {
      await dbAsync.run(
        `UPDATE profiles SET 
          full_name = COALESCE(?, full_name),
          company_name = COALESCE(?, company_name),
          phone = COALESCE(?, phone),
          currency = COALESCE(?, currency),
          app_name = COALESCE(?, app_name),
          app_subtitle = COALESCE(?, app_subtitle),
          app_logo = COALESCE(?, app_logo),
          accent_color = COALESCE(?, accent_color),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [full_name, company_name, phone, currency, app_name, app_subtitle, app_logo, accent_color, req.user.id]
      );
    } else {
      await dbAsync.run(
        `INSERT INTO profiles (user_id, full_name, email, company_name, phone, currency, app_name, app_subtitle, app_logo, accent_color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, full_name, req.user.email, company_name, phone, currency || 'INR', app_name || 'SalihPort', app_subtitle || 'Expense & Client Ledger System', app_logo, accent_color || '#4F46E5']
      );
    }

    const updated = await dbAsync.get('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);

    res.json({
      id: updated.id.toString(),
      user_id: updated.user_id.toString(),
      full_name: updated.full_name,
      email: updated.email,
      company_name: updated.company_name,
      phone: updated.phone,
      currency: updated.currency,
      app_name: updated.app_name,
      app_subtitle: updated.app_subtitle,
      app_logo: updated.app_logo,
      accent_color: updated.accent_color,
      created_at: updated.created_at,
      updated_at: updated.updated_at
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile: ' + error.message });
  }
});

module.exports = router;
