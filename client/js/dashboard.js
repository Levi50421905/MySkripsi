const API_BASE_URL = 'http://localhost:5000/api';

// Fungsi untuk membuka modal dengan ID tertentu
async function openModal(modalId, skripsiId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.setAttribute('data-skripsi-id', skripsiId);
        document.body.style.overflow = 'hidden';

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/skripsi/${skripsiId}`, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data skripsi');
            }

            const skripsiData = await response.json();
            document.getElementById('bimbinganAbstract').textContent = skripsiData.abstrak || 'Abstrak tidak tersedia';

            if (skripsiData.dokumen_url) {
                const pdfLinkContainer = document.getElementById('pdfLinkContainer');
                pdfLinkContainer.innerHTML = `
                    <a href="${skripsiData.dokumen_url}" target="_blank" class="btn-document">
                        <i class="fas fa-file-pdf"></i> Lihat Dokumen
                    </a>
                `;
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Gagal memuat data skripsi: ' + error.message, 'error');
        }

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('bimbinganDate').setAttribute('min', today);
    }
}


//submit pengajuan
async function submitPengajuanSkripsi(event) {
    event.preventDefault();

    // Ambil token dari localStorage
    const token = localStorage.getItem('token'); // Pastikan token diambil di sini
    if (!token) {
        showAlert('Anda harus login terlebih dahulu', 'error');
        return;
    }

    const formData = new FormData(document.getElementById('skripsiForm'));
    try {
        const response = await fetch(`${API_BASE_URL}/skripsi`, {
            method: 'POST',
            headers: {
                'x-auth-token': token // Menggunakan token yang diambil
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Gagal mengajukan skripsi');
        }

        showAlert('Pengajuan skripsi berhasil dikirim', 'success');
        document.getElementById('skripsiForm').reset();
        loadMahasiswaData();  // Memperbarui progress skripsi
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal mengajukan skripsi: ' + error.message, 'error');
    }
}

// Fungsi untuk memuat daftar dosen pembimbing
async function loadDosenPembimbing() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data dosen');
        }

        const users = await response.json();
        const dosenList = users.filter(user => user.role === 'dosen');

        const selectElement = document.getElementById('dosen_id'); // Pastikan ID sesuai
        if (selectElement) {
            selectElement.innerHTML = '<option value="">Pilih Dosen Pembimbing</option>';
            dosenList.forEach(dosen => {
                const option = document.createElement('option');
                option.value = dosen._id; // Pastikan ini adalah ID dosen
                option.textContent = dosen.nama;
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal memuat daftar dosen pembimbing', 'error');
    }
}

async function loadDosenList() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/dosen`, {  
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil daftar dosen');
        }

        const dosenList = await response.json();
        updateDosenSelect(dosenList);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal memuat daftar dosen: ' + error.message, 'error');
    }
}

function updateDosenSelect(dosenList) {
    const formGroup = document.querySelector('#pengajuan .form-group:nth-child(2)');
    if (!formGroup) return;

    // Buat elemen select
    formGroup.innerHTML = `
        <label for="pembimbing">Dosen Pembimbing</label>
        <select id="pembimbing" name="pembimbing" required class="form-control">
            <option value="">Pilih Dosen Pembimbing</option>
            ${dosenList.map(dosen => `
                <option value="${dosen._id}">${dosen.nama} - ${dosen.nim_nidn}</option>
            `).join('')}
        </select>
    `;
}
document.getElementById('skripsiForm').addEventListener('submit', submitPengajuanSkripsi);
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
        window.location.href = '/';
        return;
    }

    // Tampilkan/sembunyikan elemen berdasarkan role
    const mahasiswaElements = document.querySelectorAll('.mahasiswa-only');
    const dosenElements = document.querySelectorAll('.dosen-only');

    if (userRole === 'mahasiswa') {
        mahasiswaElements.forEach(el => el.style.display = 'block');
        dosenElements.forEach(el => el.style.display = 'none');
        loadMahasiswaData();
        loadDosenPembimbing(); // Panggil fungsi load dosen
    } else {
        mahasiswaElements.forEach(el => el.style.display = 'none');
        dosenElements.forEach(el => el.style.display = 'block');
        loadDosenData();
    } 

    // Navigation
    document.querySelectorAll('[page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.getAttribute('page');
            showPage(pageId);
        });
    });

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/client/public/index.html';
    });

    // Show initial page
    showPage(userRole === 'mahasiswa' ? 'pengajuan' : 'bimbingan');
});

async function loadMahasiswaData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token tidak ditemukan');
        }

        const response = await fetch(`${API_BASE_URL}/skripsi`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data skripsi');
        }

        const skripsiData = await response.json();
        updateProgressView(skripsiData);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal memuat data skripsi: ' + error.message, 'error');
    }
}

async function loadDosenData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token tidak ditemukan');
        }

        const response = await fetch(`${API_BASE_URL}/skripsi`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data bimbingan');
        }

        const skripsiData = await response.json();
        console.log('Skripsi Data:', skripsiData); // Tambahkan log ini untuk cek data

        updateBimbinganList(skripsiData);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal memuat data bimbingan: ' + error.message, 'error');
    }
}


function updateProgressView(skripsi) {
    const progressContainer = document.querySelector('.progress-container');
    if (!progressContainer) return;

    const statusMap = {
        'draft': 0,
        'pengajuan': 25,
        'revisi': 50,
        'diterima': 75,
        'selesai': 100
    };

    if (!skripsi || Object.keys(skripsi).length === 0) {
        progressContainer.innerHTML = `
            <div class="empty-state">
                <h3>Belum ada pengajuan skripsi</h3>
                <p>Silakan ajukan skripsi Anda melalui form pengajuan</p>
            </div>
        `;
        return;
    }

    const progress = statusMap[skripsi.status] || 0;

    progressContainer.innerHTML = `
        <div class="progress-info">
            <h3>Status: ${skripsi.status.toUpperCase()}</h3>
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%"></div>
            </div>
            <p>Judul: ${skripsi.judul}</p>
            <p>Pembimbing: ${skripsi.dosen_id?.nama || 'Belum ditentukan'}</p>
        </div>
        <div class="document-section">
            <h3>Dokumen Terkait</h3>
            ${skripsi.dokumen_url ? 
                `<a href="${skripsi.dokumen_url}" target="_blank" class="btn-document">
                    <i class="fas fa-file-pdf"></i> Lihat Dokumen
                </a>` : 
                '<p>Belum ada dokumen</p>'
            }
        </div>
    `;
}

function updateBimbinganList(skripsiList) {
    const bimbinganList = document.querySelector('.bimbingan-list');
    if (!bimbinganList) return;

    if (!Array.isArray(skripsiList) || skripsiList.length === 0) {
        bimbinganList.innerHTML = `
            <div class="empty-state">
                <h3>Belum ada mahasiswa bimbingan</h3>
                <p>Daftar mahasiswa bimbingan akan muncul di sini</p>
            </div>
        `;
        return;
    }

    bimbinganList.innerHTML = skripsiList.map(skripsi => {
        const mahasiswaName = skripsi.mahasiswa_id ? skripsi.mahasiswa_id.nama : 'Nama tidak tersedia';
        const status = skripsi.status ? skripsi.status.toUpperCase() : 'TIDAK ADA STATUS'; // Validasi status
        
        return `
            <div class="bimbingan-card">
                <div class="bimbingan-header">
                    <h3>${mahasiswaName}</h3>
                    <span class="status ${skripsi.status || 'unknown'}">${status}</span>
                </div>
                <p>NIM: ${skripsi.mahasiswa_id ? skripsi.mahasiswa_id.nim_nidn : 'NIM tidak tersedia'}</p>
                <p>Judul: ${skripsi.judul || 'Judul tidak tersedia'}</p>
                <div class="document-section">
                    <h4>Dokumen Terkait</h4>
                    ${skripsi.dokumen_url ? 
                        `<a href="${skripsi.dokumen_url}" target="_blank" class="btn-document">
                            <i class="fas fa-file-pdf"></i> Lihat Dokumen
                        </a>` : 
                        '<p>Belum ada dokumen</p>'
                    }
                </div>
                <div class="bimbingan-actions">
                    <div class="form-group">
                        <label for="catatan-${skripsi._id}">Catatan</label>
                        <input type="text" id="catatan-${skripsi._id}" placeholder="Catatan" required>
                    </div>
                    <select id="status-${skripsi._id}" class="status-select">
                        <option value="draft">Draft</option>
                        <option value="pengajuan">Pengajuan</option>
                        <option value="revisi">Revisi</option>
                        <option value="diterima">Diterima</option>
                        <option value="selesai">Selesai</option>
                    </select>
                    <button onclick="updateStatus('${skripsi._id}')" class="btn-action">
                        Update Status
                    </button>
                    <input type="date" id="tanggal-${skripsi._id}" class="date-input" />
                    <button onclick="jadwalkanBimbingan('${skripsi._id}')" class="btn-action">
                        Jadwalkan Bimbingan
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


async function updateStatus(skripsiId) {
    const selectElement = document.getElementById(`status-${skripsiId}`);
    const newStatus = selectElement.value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/skripsi/${skripsiId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Gagal memperbarui status');
        }

        showAlert('Status berhasil diperbarui', 'success');
        loadDosenData(); // Refresh data dosen
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal memperbarui status: ' + error.message, 'error');
    }
}

async function jadwalkanBimbingan(skripsiId) {
    const catatan = document.getElementById(`catatan-${skripsiId}`).value;
    const tanggal = document.getElementById(`tanggal-${skripsiId}`).value;

    // Validasi input
    if (!tanggal || !catatan) {
        showAlert('Tanggal dan catatan harus diisi', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/bimbingan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                skripsi_id: skripsiId, // Pastikan ini adalah ID skripsi yang valid
                tanggal: new Date(tanggal).toISOString(),
                catatan: catatan
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menjadwalkan bimbingan');
        }
        if (!skripsiId) {
            showAlert('Skripsi ID tidak ditemukan', 'error');
            return;
        }
        showAlert('Bimbingan berhasil dijadwalkan', 'success');
        loadDosenData(); // Refresh data bimbingan
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal menjadwalkan bimbingan: ' + error.message, 'error');
    }
}
document.addEventListener('DOMContentLoaded', function() {
    // Fungsi navigasi berdasarkan role user
    const userRole = localStorage.getItem('role');

    showPage(userRole === 'mahasiswa' ? 'pengajuan' : 'bimbingan');


    showPage(userRole === 'mahasiswa' ? 'pengajuan' : 'bimbingan');



    if (userRole === 'mahasiswa') {
        loadMahasiswaJadwalBimbingan();
    }
    showPage(userRole === 'mahasiswa' ? 'pengajuan' : 'bimbingan');


    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            showPage(pageId);
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    loadBimbinganData();
    loadJadwalBimbingan();
});

async function loadBimbinganData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/bimbingan`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data bimbingan');
        }

        const bimbinganData = await response.json();
        console.log('Bimbingan Data:', bimbinganData); // Tambahkan log ini
        updateBimbinganList(bimbinganData);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal memuat data bimbingan: ' + error.message, 'error');
    }
}

// Event listener untuk form penjadwalan bimbingan
document.getElementById('scheduleBimbinganForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const modal = document.getElementById('scheduleBimbinganModal');
    const skripsiId = modal.getAttribute('data-skripsi-id');
    const tanggal = document.getElementById('bimbinganDate').value;
    const catatan = document.getElementById('bimbinganNotes').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/bimbingan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                skripsi_id: skripsiId, // Pastikan ini ada dan valid
                tanggal: new Date(tanggal), // Pastikan format tanggal benar
                catatan: catatan
            })
        });

        if (!response.ok) {
            throw new Error('Gagal menjadwalkan bimbingan');
        }

        showAlert('Bimbingan berhasil dijadwalkan', 'success');
        closeModal('scheduleBimbinganModal');
        loadDosenData(); // Refresh data bimbingan
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal menjadwalkan bimbingan: ' + error.message, 'error');
    }
});

// Jadwal Bimbingan
async function loadJadwalBimbingan() {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id'); // Ambil user_id dari localStorage
        
        console.log('User  ID:', userId); // Tambahkan log ini untuk debug

        if (!userId) {
            throw new Error('User  ID tidak ditemukan. Pastikan Anda sudah login.');
        }

        const response = await fetch(`${API_BASE_URL}/bimbingan/mahasiswa/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data jadwal bimbingan');
        }

        const jadwalData = await response.json();
        displayJadwalBimbingan(jadwalData);
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal memuat data jadwal bimbingan: ' + error.message, 'error');
    }
}

function displayJadwalBimbingan(jadwalData) {
    const jadwalListContainer = document.getElementById('jadwalList');
    if (!jadwalListContainer) return;

    if (jadwalData.length === 0) {
        jadwalListContainer.innerHTML = `<p>Tidak ada jadwal bimbingan yang tersedia.</p>`;
        return;
    }

    jadwalListContainer.innerHTML = jadwalData.map(jadwal => `
        <div class="jadwal-item">
            <h3>${jadwal.skripsi_id?.judul || 'Judul tidak tersedia'}</h3> <!-- Pastikan ini benar -->
            <p>Tanggal: ${new Date(jadwal.tanggal).toLocaleDateString()}</p>
            <p>Catatan: ${jadwal.catatan || 'Tidak ada catatan'}</p>
        </div>
    `).join('');
}


async function loadMahasiswaJadwalBimbingan() {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id'); // Ambil user_id dari localStorage

        if (!userId) {
            showAlert('User  ID tidak ditemukan. Harap login ulang.', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/bimbingan?mahasiswa_id=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Gagal mengambil data jadwal bimbingan');
        }

        const jadwalData = await response.json();
        displayMahasiswaJadwalBimbingan(jadwalData); // Pastikan fungsi ini didefinisikan
    } catch (error) {
        console.error('Error:', error);
        showAlert('Gagal memuat data jadwal bimbingan: ' + error.message, 'error');
    }
}

function displayMahasiswaJadwalBimbingan(jadwalData) {
    const jadwalListContainer = document.getElementById('jadwalList');
    if (!jadwalListContainer) return;

    if (jadwalData.length === 0) {
        jadwalListContainer.innerHTML = `<p>Anda belum memiliki jadwal bimbingan yang terjadwal.</p>`;
        return;
    }

    jadwalListContainer.innerHTML = jadwalData.map(jadwal => `
        <div class="jadwal-item">
            <h3>${jadwal.skripsi_id?.judul || 'Judul tidak tersedia'}</h3>
            <p>Tanggal: ${new Date(jadwal.tanggal).toLocaleDateString()}</p>
            <p>Catatan: ${jadwal.catatan || 'Tidak ada catatan'}</p>
        </div>
    `).join('');
}


function displayMahasiswaJadwalBimbingan(jadwalData) {
    const jadwalListContainer = document.getElementById('jadwalList');
    if (!jadwalListContainer) return;

    if (jadwalData.length === 0) {
        jadwalListContainer.innerHTML = `<p>Anda belum memiliki jadwal bimbingan yang terjadwal.</p>`;
        return;
    }

    jadwalListContainer.innerHTML = jadwalData.map(jadwal => `
        <div class="jadwal-item">
            <h3>${jadwal.skripsi_id?.judul || 'Judul tidak tersedia'}</h3>
            <p>Tanggal: ${new Date(jadwal.tanggal).toLocaleDateString()}</p>
            <p>Catatan: ${jadwal.catatan || 'Tidak ada catatan'}</p>
        </div>
    `).join('');
}


// Fungsi untuk menampilkan alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.padding = '15px 20px';
    alertDiv.style.borderRadius = '4px';
    alertDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                   type === 'error' ? '#f44336' : '#2196F3';
    alertDiv.style.color = 'white';
    alertDiv.style.zIndex = '1000';
    alertDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }
}