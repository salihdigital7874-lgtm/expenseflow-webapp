const express = require('express');
const router = express.Router();
const { dbAsync } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total Expenses
    const expRow = await dbAsync.get(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?',
      [userId]
    );

    // Total Incoming Income
    const incRow = await dbAsync.get(
      'SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ? AND payment_status != "cancelled"',
      [userId]
    );

    // Total Outstanding Client Balances
    const clientRow = await dbAsync.get(
      'SELECT COALESCE(SUM(balance_amount), 0) as total FROM clients WHERE user_id = ? AND status = "active"',
      [userId]
    );

    // Total Budgets
    const budgetRow = await dbAsync.get(
      'SELECT COALESCE(SUM(budget_amount), 0) as total FROM budgets WHERE user_id = ?',
      [userId]
    );

    const totalExpenses = Number(expRow ? expRow.total : 0);
    const totalIncoming = Number(incRow ? incRow.total : 0);
    const totalClientBalance = Number(clientRow ? clientRow.total : 0);
    const totalBudget = Number(budgetRow ? budgetRow.total : 0);
    const budgetUsed = totalExpenses;
    const remainingBudget = Math.max(0, totalBudget - budgetUsed);

    res.json({
      totalExpenses,
      totalIncoming,
      totalClientBalance,
      totalBudget,
      budgetUsed,
      remainingBudget
    });
  } catch (error) {
    console.error('❌ Error generating dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to calculate dashboard metrics: ' + error.message });
  }
};

// GET /api/dashboard
router.get('/', authenticateToken, getDashboardStats);

// GET /api/dashboard/stats (Alias for HTML frontend)
router.get('/stats', authenticateToken, getDashboardStats);

// GET /api/reports/summary
router.get('/reports/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const monthlyExpenses = await dbAsync.all(
      `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total 
       FROM expenses 
       WHERE user_id = ? 
       GROUP BY month 
       ORDER BY month DESC 
       LIMIT 12`,
      [userId]
    );

    const monthlyIncome = await dbAsync.all(
      `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total 
       FROM income 
       WHERE user_id = ? AND payment_status != "cancelled"
       GROUP BY month 
       ORDER BY month DESC 
       LIMIT 12`,
      [userId]
    );

    res.json({
      monthlyExpenses,
      monthlyIncome
    });
  } catch (error) {
    console.error('❌ Error generating financial report summary:', error);
    res.status(500).json({ error: 'Failed to generate financial report: ' + error.message });
  }
});

module.exports = router;
