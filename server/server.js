// server/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Bimbingan = require('./models/Bimbingan'); 
require('dotenv').config();

const app = express();
app.get('/bimbingan', async (req, res) => {
    try {
        const bimbinganData = await Bimbingan.find(); // Ambil semua data bimbingan
        res.json(bimbinganData);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data bimbingan' });
    }
});
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Connect Database
connectDB();

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500', 
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skripsi', require('./routes/skripsi'));
app.use('/api/bimbingan', require('./routes/bimbingan'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));