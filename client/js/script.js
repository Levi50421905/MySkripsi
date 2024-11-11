let signup = document.querySelector(".signup");
let login = document.querySelector(".login");
let slider = document.querySelector(".slider");
let formSection = document.querySelector(".form-section");

signup.addEventListener("click", () => {
    slider.classList.add("moveslider");
    formSection.classList.add("form-section-move");
});

login.addEventListener("click", () => {
    slider.classList.remove("moveslider");
    formSection.classList.remove("form-section-move");
});

// Fungsi untuk menampilkan error
function showError(formId, message) {
    const errorDiv = document.getElementById(formId + 'Error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Fungsi untuk validasi form
function validateForm(formData) {
    const errors = [];
    
    if (!formData.get('nama')?.trim()) {
        errors.push('Nama wajib diisi');
    }
    
    if (!formData.get('email')?.trim()) {
        errors.push('Email wajib diisi');
    } else if (!formData.get('email').match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
        errors.push('Format email tidak valid');
    }
    
    if (!formData.get('password')?.trim()) {
        errors.push('Password wajib diisi');
    } else if (formData.get('password').length < 6) {
        errors.push('Password minimal 6 karakter');
    }
    
    if (!formData.get('nim_nidn')?.trim()) {
        errors.push('NIM/NIDN wajib diisi');
    }
    
    if (!formData.get('role') || !['mahasiswa', 'dosen'].includes(formData.get('role'))) {
        errors.push('Peran wajib dipilih dan harus valid');
    }
    
    return errors;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    console.log('Data yang akan dikirim:', {
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    });

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password'),
                role: formData.get('role') // Pastikan role diambil dari form
            }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            window.location.href = '/client/public/dashboard.html';
        } else {
            showError('login', data.message || 'Login gagal');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('login', 'Terjadi kesalahan saat login');
    }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Validasi form
    const errors = validateForm(formData);
    if (errors.length > 0) {
        showError('signup', errors.join('\n'));
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        const data = await response.json();

        if (response.ok) {
            alert('Registrasi berhasil! Silakan login.');
            e.target.reset();
            // Pindah ke form login
            slider.classList.remove("moveslider");
            formSection.classList.remove("form-section-move");
        } else {
            if (data.errors) {
                const errorMessages = data.errors.map(err => err.msg).join('\n');
                showError('signup', errorMessages);
            } else {
                showError('signup', data.message || 'Registrasi gagal');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showError('signup', 'Terjadi kesalahan saat mendaftar');
    }
});