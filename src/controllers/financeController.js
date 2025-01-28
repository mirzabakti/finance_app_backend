// Import model Finance
const Finance = require('../models/financeModel');

// Controller untuk mendapatkan semua data finance user
const getFinances = async (req, res) => {
  try {
    // Cari semua data finance milik user yang sedang login
    const finances = await Finance.find({ user: req.user.id });
    res.status(200).json(finances);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Controller untuk membuat data finance baru
const createFinance = async (req, res) => {
  const { title, amount, type, category } = req.body;

  // Validasi input
  if (!title || !amount || !type || !category) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Tipe harus income atau expense' });
  }

  if (!['food', 'transportation', 'entertainment', 'utilities', 'others'].includes(category)) {
    return res.status(400).json({ message: 'Kategori tidak valid' });
  }

  try {
    // Buat data finance baru
    const finance = await Finance.create({
      user: req.user.id,
      title,
      amount,
      type,
      category,
    });

    res.status(201).json(finance);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat data finance' });
  }
};

// Controller untuk mengupdate data finance
const updateFinance = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari data finance berdasarkan ID
    const finance = await Finance.findById(id);

    // Periksa apakah data ditemukan dan milik user yang sedang login
    if (!finance || finance.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    // Update data finance
    const updatedFinance = await Finance.findByIdAndUpdate(
      id,
      req.body,
      { new: true } // Mengembalikan data yang sudah diperbarui
    );

    res.status(200).json(updatedFinance);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate data finance' });
  }
};

// Controller untuk menghapus data finance
const deleteFinance = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari data finance berdasarkan ID
    const finance = await Finance.findById(id);

    // Periksa apakah data ditemukan dan milik user yang sedang login
    if (!finance || finance.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    // Hapus data finance
    await finance.deleteOne();
    res.status(200).json({ message: 'Data berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data finance' });
  }
};

// Fungsi untuk mendapatkan laporan keuangan
const getFinanceSummary = async (req, res) => {
  try {
      // Ambil user ID dari JWT
      const userId = req.user._id;

      // Ambil semua data keuangan user
      const finances = await Finance.find({ user: userId });

      // Hitung total pemasukan, pengeluaran, dan saldo
      const totalIncome = finances
          .filter((item) => item.type === 'income')
          .reduce((acc, curr) => acc + curr.amount, 0);

      const totalExpense = finances
          .filter((item) => item.type === 'expense')
          .reduce((acc, curr) => acc + curr.amount, 0);

      const balance = totalIncome - totalExpense;

      res.status(200).json({
          totalIncome,
          totalExpense,
          balance,
      });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk memfilter data keuangan

const filterFinance = async (req, res) => {
  try {
    const userId = req.user._id; // Ambil ID user dari JWT
    const { type, month, year } = req.query; // Ambil query parameters

    // Query dasar: hanya data milik user saat ini
    let query = { user: userId };

    // Filter berdasarkan jenis transaksi (income atau expense)
    if (type) {
      query.type = type; // Contoh: 'income' atau 'expense'
    }

    // Filter berdasarkan tahun
    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
      query.createdAt = { $gte: startOfYear, $lt: endOfYear };
    }

    // Filter berdasarkan bulan (jika bulan juga diberikan)
    if (month) {
      if (!query.createdAt) {
        query.createdAt = {};
      }
      const yearValue = year || new Date().getFullYear(); // Gunakan tahun saat ini jika tidak diberikan
      const monthStart = new Date(`${yearValue}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
      const nextMonth = Number(month) + 1;
      const monthEnd = nextMonth > 12
        ? new Date(`${Number(yearValue) + 1}-01-01T00:00:00.000Z`)
        : new Date(`${yearValue}-${String(nextMonth).padStart(2, '0')}-01T00:00:00.000Z`);
      query.createdAt.$gte = monthStart;
      query.createdAt.$lt = monthEnd;
    }

    // Ambil data berdasarkan query yang telah dibuat
    const finances = await Finance.find(query).sort({ createdAt: -1 });

    res.status(200).json(finances); // Kirim data yang telah difilter
  } catch (error) {
    res.status(500).json({ message: error.message }); // Tangani error
  }
};

module.exports = { getFinances, createFinance, updateFinance, deleteFinance, getFinanceSummary, filterFinance };
