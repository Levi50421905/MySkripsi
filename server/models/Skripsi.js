const mongoose = require('mongoose');

const skripsiSchema = new mongoose.Schema({
    mahasiswa_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dosen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    judul: {
        type: String,
        required: true
    },
    abstrak: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'pengajuan', 'revisi', 'diterima', 'selesai'],
        default: 'draft'
    },
    dokumen_url: String,
    tanggal_pengajuan: {
        type: Date,
        default: Date.now
    },
    tanggal_selesai: Date,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Skripsi', skripsiSchema);