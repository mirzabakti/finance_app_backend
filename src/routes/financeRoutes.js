// Import express, middleware, dan controller
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
  getFinanceSummary,
  getFinanceReportByPeriod,
  filterFinance,
  getCategoryStats,
  getMonthlyStats
} = require('../controllers/financeController');

// Route untuk mendapatkan semua data finance
router.get('/', protect, getFinances);

// Route untuk membuat data finance baru
router.post('/', protect, createFinance);

// Route untuk mengupdate data finance
router.put('/:id', protect, updateFinance);

// Route untuk menghapus data finance
router.delete('/:id', protect, deleteFinance);

// Route untuk mendapatkan summary finance
router.get('/summary', protect, getFinanceSummary);

// Route untuk mendapatkan laporan keuangan dalam periode tertentu
router.get('/report', protect, getFinanceReportByPeriod)

// Route untuk filter data finance
router.get('/filter', protect, filterFinance);

// Route untuk mendapatkan statistik kategori
router.get('/category-stats', protect, getCategoryStats);

// Route untuk mendapatkan statistik bulanan
router.get('/monthly-stats', protect, getMonthlyStats);

module.exports = router;
