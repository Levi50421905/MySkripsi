const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users
// @desc    Mendapatkan semua user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find()
            .select('nama nim_nidn role')
            .sort('nama');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;