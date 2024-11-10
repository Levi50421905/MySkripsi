const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Skripsi = require('../models/Skripsi');
const User = require('../models/User');

const multer = require('multer');
const path = require('path');

// Konfigurasi multer untuk upload PDF
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder tempat file akan disimpan
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal ukuran file 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Hanya file PDF yang diperbolehkan'));
        }
    }
});

// Get skripsi (based on role)
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let skripsi;
  
        if (user.role === 'mahasiswa') {
            skripsi = await Skripsi.findOne({ mahasiswa_id: req.user.id })
                .populate('dosen_id', 'nama');
        } else {
            skripsi = await Skripsi.find({ dosen_id: req.user.id })
                .populate('mahasiswa_id', 'nama nim_nidn');
        }
  
        res.json(skripsi || {}); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
  });

// Submit skripsi
router.post('/', auth, upload.single('dokumen'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'mahasiswa') {
            return res.status(403).json({ message: 'Akses ditolak' });
        }

        const { judul, abstrak, dosen_id } = req.body;
        const dokumen_url = req.file ? `/uploads/${req.file.filename}` : null;

        const skripsi = new Skripsi({
            mahasiswa_id: req.user.id,
            dosen_id,
            judul,
            abstrak,
            dokumen_url
        });

        await skripsi.save();
        res.json(skripsi);
    } catch (err) {
        console.error('Error saat menyimpan pengajuan skripsi:', err.message);
        res.status(500).json({ message: 'Server Error', detail: err.message });
    }
});
// Update skripsi status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'dosen') {
            return res.status(403).json({ message: 'Akses ditolak' });
        }

        const skripsi = await Skripsi.findById(req.params.id);
        if (!skripsi) {
            return res.status(404).json({ message: 'Skripsi tidak ditemukan' });
        }

        skripsi.status = req.body.status;
        skripsi.updatedAt = Date.now();

        await skripsi.save();
        res.json(skripsi);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;