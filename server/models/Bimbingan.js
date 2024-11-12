const mongoose = require('mongoose');

const BimbinganSchema = new mongoose.Schema({
    skripsi_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skripsi',
        required: true
    },
    catatan: {
        type: String,
        required: true
    },
    tanggal: {
        type: Date,
        required: true
    },
    mahasiswa_id: {  // Tambahkan ini jika belum ada
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User ',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Bimbingan', BimbinganSchema);