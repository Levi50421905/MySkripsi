const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/users/dosen
// @desc    Get all dosen
// @access  Private
router.get('/dosen', auth, async (req, res) => {
  try {
      const dosen = await User.find({ role: 'dosen' })
          .select('nama nim_nidn')
          .sort('nama');
      
      res.json(dosen);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
});

module.exports = router;

// Register user
router.post('/signup', async (req, res) => {
    try {
        const { nama, email, password, nim_nidn, role } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        user = new User({
            nama,
            email,
            password,
            nim_nidn,
            role
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error', detail: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        console.log('Data yang diterima:', { email, password, role }); // Log data yang diterima

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email atau password salah' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah' });
        }

        // Validasi role
        console.log('Role pengguna dari database:', user.role); // Log role pengguna dari database
        if (user.role !== role) {
            return res.status(400).json({ message: 'Peran tidak sesuai' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;