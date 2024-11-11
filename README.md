Dokumentasi Aplikasi MySkripsi

Deskripsi Umum
Aplikasi Skripsi adalah platform yang memungkinkan mahasiswa untuk mengajukan skripsi dan menjadwalkan bimbingan dengan dosen. 
Aplikasi ini memiliki dua peran utama: mahasiswa dan dosen, yang masing-masing memiliki akses dan fungsionalitas yang berbeda.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Struktur Proyek

/client
    /js
        dashboard.js         // Logika utama untuk dashboard mahasiswa dan dosen
        script.js            // Logika untuk form login dan signup
/client/public
    index.html              // Halaman utama aplikasi
/server
    /config
        db.js                // Konfigurasi koneksi ke MongoDB
    /middleware
        auth.js              // Middleware untuk otentikasi JWT
    /models
        Bimbingan.js         // Model untuk bimbingan
        Skripsi.js           // Model untuk skripsi
        User.js              // Model untuk pengguna
    /routes
        auth.js              // Rute untuk otentikasi pengguna
        bimbingan.js         // Rute untuk manajemen bimbingan
        skripsi.js           // Rute untuk manajemen skripsi
        users.js             // Rute untuk manajemen pengguna
    server.js                // File utama untuk menjalankan server

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Endpoint API

Auth

POST /api/auth/signup
Mendaftar pengguna baru.
Body: { "nama": String, "email": String, "password": String, "nim_nidn": String, "role": String }

POST /api/auth/login
Login pengguna.
Body: { "email": String, "password": String }

GET /api/auth/dosen
Mengambil daftar dosen.
Akses: Private

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Skripsi

GET /api/skripsi
Mengambil data skripsi berdasarkan peran pengguna (mahasiswa atau dosen).
Akses: Private

POST /api/skripsi
Mengajukan skripsi baru.
Body: { "judul": String, "abstrak": String, "dosen_id": String, "dokumen": File }
Akses: Hanya untuk mahasiswa

PUT /api/skripsi/:id/status
Memperbarui status skripsi.
Body: { "status": String }
Akses: Hanya untuk dosen

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Bimbingan

GET /api/bimbingan
Mengambil semua data bimbingan.
Akses: Private

POST /api/bimbingan
Menjadwalkan bimbingan baru.
Body: { "skripsi": String, "tanggal": Date, "catatan": String }

GET /api/bimbingan/skripsi/:skripsiId
Mengambil semua bimbingan untuk skripsi tertentu.
Akses: Private

PUT /api/bimbingan/:id/status
Memperbarui status bimbingan.
Body: { "status": String }
Akses: Private

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Fungsi Utama di Frontend

submitPengajuanSkripsi(event)
Fungsi ini menangani pengajuan skripsi oleh mahasiswa. Memvalidasi input, mengirim data ke server, dan memperbarui tampilan setelah pengajuan berhasil.

loadDosenPembimbing()
Fungsi ini memuat daftar dosen pembimbing dari server dan memperbarui elemen select di form pengajuan skripsi.

loadMahasiswaData()
Fungsi ini memuat data skripsi mahasiswa dan memperbarui tampilan progress skripsi.

jadwalkanBimbingan(skripsiId)
Fungsi ini menangani penjadwalan bimbingan. Memvalidasi input dan mengirim data ke server.

showAlert(message, type)
Fungsi ini menampilkan alert kepada pengguna dengan pesan dan tipe tertentu (success, error, info).

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Cara Menjalankan Aplikasi

1. Pastikan Anda memiliki Node.js dan MongoDB terinstal.
2. Clone repositori ini.
3. Install dependensi di server:

cd server
npm install

Jalankan server:
npm start

Buka browser dan akses http://localhost:5000 untuk frontend.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Catatan

1. Pastikan untuk mengatur variabel lingkungan yang diperlukan, seperti  MONGODB_URI dan JWT_SECRET, sebelum menjalankan aplikasi.
2. Untuk pengujian, Anda dapat menggunakan Postman atau alat serupa untuk menguji endpoint API.
3. Pastikan untuk membaca dokumentasi tambahan yang mungkin disertakan dalam repositori untuk informasi lebih lanjut tentang pengaturan dan penggunaan aplikasi.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Pengujian

Aplikasi ini telah diuji menggunakan unit test dan integrasi test untuk memastikan semua fungsi berjalan dengan baik. Anda dapat menjalankan pengujian dengan perintah berikut:

cd server
npm test

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Kontribusi
Jika Anda ingin berkontribusi pada proyek ini, silakan ikuti langkah-langkah berikut:

Fork repositori ini.
Buat cabang baru untuk fitur atau perbaikan yang ingin Anda tambahkan.
Lakukan perubahan dan commit dengan pesan yang jelas.
Kirim pull request ke repositori utama.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Lisensi
Proyek ini dilisensikan di bawah MIT License. Silakan lihat file LICENSE untuk informasi lebih lanjut.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Kontak

Jika Anda memiliki pertanyaan atau saran, silakan hubungi:

Nama: MuhammadAlfarezzi Fallevi
Email: levialfarezziar@gmail.com

Dengan dokumentasi ini, diharapkan pengguna dan pengembang lain dapat memahami dan menggunakan aplikasi dengan lebih baik. 
Pastikan untuk memperbarui dokumentasi ini sesuai dengan perubahan yang dilakukan pada kode di masa mendatang.

