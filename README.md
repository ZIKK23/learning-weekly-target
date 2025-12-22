# Learning Weekly Target App (Capstone Project)

Aplikasi web untuk membantu siswa mengelola target belajar mingguan, memantau progres submodule (termasuk fitur _streak_), dan menjadwalkan aktivitas belajar harian.

## 👥 Anggota Tim

Capstone Project ini dikembangkan oleh:

| ID              | Nama                       | Role                 |
| --------------- | -------------------------- | -------------------- |
| **F156D5Y0256** | Arby Ali Amaludin          | Front-End & Back-End |
| **F012D5Y0756** | Hilmi Zikri                | Front-End & Back-End |
| **F284D5X1647** | Randistya Fitria           | Front-End & Back-End |
| **F290D5X0066** | Afiyah Nabilah Putri       | Front-End & Back-End |
| **F284D5X0321** | Ayu Aisyah Fatimatu Syahra | Front-End & Back-End |

---

## 🚀 Fitur Utama

Aplikasi ini memiliki berbagai fitur untuk menunjang produktivitas belajar siswa:

1.  **Weekly Targets**: Menentukan target modul yang ingin diselesaikan dalam satu minggu.
2.  **Progress Tracking**: Memantau perkembangan belajar mulai dari kelas, modul, hingga submodule secara detail.
3.  **Streak System**: Gamifikasi dengan sistem _streak_ (api 🔥) yang bertambah setiap kali menyelesaikan satu modul penuh.
4.  **Leaderboard**: Melihat peringkat siswa berdasarkan konsistensi belajar (streak tertinggi).

---

## 💻 Tech Stack

Teknologi yang digunakan dalam pengembangan aplikasi ini:

- **Frontend**: React (Vite), Tailwind CSS/Raw CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL (via phpMyAdmin)
- **Authentication**: JWT (JSON Web Token)

---

## 📖 Cara Penggunaan

Berikut adalah alur umum penggunaan aplikasi:

1.  **Registrasi/Login**: Masuk menggunakan akun siswa yang sudah terdaftar.
2.  **Set Target Mingguan**: Pada awal minggu, pilih modul-modul yang ingin dipelajari.
3.  **Mulai Belajar**: Buka Dashboard, pilih kelas, dan mulai baca materi per submodule.
4.  **Selesaikan Submodule**: Klik tombol "Next" di akhir materi submodule untuk menandainya selesai.
5.  **Cek Streak**: Jika semua submodule dalam satu modul selesai, streak harian/mingguanmu akan bertambah!
6.  **Kelola Jadwal**: Gunakan fitur "Manage Schedule" untuk mengatur kapan kamu akan belajar hari ini.

---

## 🛠️ Cara Install & Menjalankan Project

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal.

### 1️⃣ Persiapan Database (phpMyAdmin)

1.  Pastikan **XAMPP** (atau database server MySQL lainnya) sudah terinstall dan berjalan (Start module **Apache** dan **MySQL**).
2.  Buka browser dan akses [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3.  Buat database baru dengan nama: **`capstone`**
4.  Klik tab **Import**.
5.  Klik **Choose File** dan pilih file SQL yang ada di direktori project:
    `.../learning-weekly-target1/backend/capstone.sql`
6.  Klik **Import** (atau **Go** di bagian bawah).
7.  Pastikan semua tabel (termasuk `submodule_progress`) berhasil dibuat tanpa error.

### 2️⃣ Jalankan Backend (Server)

1.  Buka terminal/cmd dan masuk ke folder `backend`.
    ```bash
    cd backend
    ```
2.  Install library/dependencies (jika belum pernah):
    ```bash
    npm install
    ```
3.  Konfigurasi Environment (Opsional):
    - Pastikan file `.env` di folder backend sudah sesuai dengan setting database kamu (default biasanya user: `root`, pass: kosong).
4.  Jalankan server:
    ```bash
    npm start
    ```
    _Output sukses:_ `Server running on http://localhost:3000`

### 3️⃣ Jalankan Frontend (Client)

1.  Buka terminal **baru** (jangan matikan terminal backend).
2.  Masuk ke direktori root project.
    ```bash
    cd ..
    # atau jika dari awal: cd learning-weekly-target1
    ```
3.  Install dependencies (jika belum pernah):
    ```bash
    npm install
    ```
4.  Jalankan aplikasi frontend:
    ```bash
    npm run dev
    ```
5.  Buka link yang muncul di terminal (biasanya [http://localhost:5173](http://localhost:5173)) di browser kamu.
