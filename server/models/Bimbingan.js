const mongoose = require('mongoose');

const bimbinganSchema = new mongoose.Schema({
    skripsi_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skripsi',
        required: true
    },
    catatan: String,
    status: {
        type: String,
        enum: ['dijadwalkan', 'selesai', 'ditunda'],
        default: 'dijadwalkan'
    },
    tanggal: {
        type: Date,
        required: true
    },
    lampiran_url: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bimbingan', bimbinganSchema);