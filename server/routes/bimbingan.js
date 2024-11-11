const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Skripsi = require('../models/Skripsi');
const Bimbingan = require('../models/Bimbingan');
const { check, validationResult } = require('express-validator');

router.get('/', auth, async (req, res) => {
  try {
      const bimbingan = await Bimbingan.find().populate('skripsi_id'); // Atau sesuaikan dengan model Anda
      res.json(bimbingan);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
});

// Get all bimbingan for a skripsi
router.get('/skripsi/:skripsiId', auth, async (req, res) => {
  try {
    const bimbingan = await Bimbingan.find({ skripsi: req.params.skripsiId })
      .sort({ tanggal: -1 });
    res.json(bimbingan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Schedule new bimbingan
router.post('/', [
  auth,
  [
      check('catatan', 'Catatan wajib diisi').not().isEmpty(),
      check('tanggal', 'Tanggal wajib diisi').not().isEmpty(),
      check('skripsi_id', 'ID Skripsi wajib diisi').not().isEmpty() // Pastikan ini ada
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  try {
      const { skripsi_id, tanggal, catatan } = req.body; // Ambil skripsi_id dari body
      const skripsiDoc = await Skripsi.findById(skripsi_id);
      if (!skripsiDoc) {
          return res.status(404).json({ message: 'Skripsi tidak ditemukan' });
      }

      const newBimbingan = new Bimbingan({
          skripsi_id,
          catatan,
          tanggal,
      });

      const bimbingan = await newBimbingan.save();
      res.json(bimbingan);
  } catch (err) {
      console.error('Server Error:', err.message);
      res.status(500).send('Server Error');
  }
});


// Update bimbingan status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const bimbingan = await Bimbingan.findById(req.params.id);

    if (!bimbingan) {
      return res.status(404).json({ message: 'Bimbingan tidak ditemukan' });
    }

    const skripsi = await Skripsi.findById(bimbingan.skripsi);
    if (skripsi.pembimbing.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    bimbingan.status = status;
    await bimbingan.save();
    res.json(bimbingan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;