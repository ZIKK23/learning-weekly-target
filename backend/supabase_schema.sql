-- Postgres schema + data for Supabase, converted from backend/capstone.sql (MySQL dump).
-- Run this once in the Supabase SQL editor against a fresh project.

-- Tables created WITHOUT foreign keys first, data loaded, then FKs added at the end
-- (mirrors the original MySQL dump's insert order, which isn't FK-safe otherwise).

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL,
  name VARCHAR(150) NOT NULL,
  est_minutes INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submodules (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE targets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE target_days (
  id SERIAL PRIMARY KEY,
  target_id INTEGER NOT NULL,
  date DATE NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE target_modules (
  id SERIAL PRIMARY KEY,
  target_id INTEGER NOT NULL,
  module_id INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  module_id INTEGER,
  target_id INTEGER NOT NULL,
  date_started TIMESTAMP,
  date_completed TIMESTAMP,
  actual_minutes INTEGER,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_checkins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, checkin_date)
);

CREATE TABLE weekly_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  streak INTEGER DEFAULT 0,
  last_completion_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, week_start)
);

CREATE TABLE submodule_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  submodule_id INTEGER NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, submodule_id)
);

-- updated_at auto-touch (MySQL's "ON UPDATE CURRENT_TIMESTAMP" has no native Postgres equivalent)
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_submodules_updated_at BEFORE UPDATE ON submodules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_targets_updated_at BEFORE UPDATE ON targets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_target_days_updated_at BEFORE UPDATE ON target_days FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_target_modules_updated_at BEFORE UPDATE ON target_modules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_weekly_streaks_updated_at BEFORE UPDATE ON weekly_streaks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_submodule_progress_updated_at BEFORE UPDATE ON submodule_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Data

INSERT INTO users (id, display_name, email, created_at, updated_at) VALUES
(1, 'Tria', 'randistyatria@gmail.com', '2025-11-18 19:36:11', '2025-12-01 21:40:58'),
(2, 'Asah', 'f284d5x1647@student.devacademy.id', '2025-11-18 19:37:44', '2025-11-26 22:31:51'),
(19, 'igihcksn', 'igihcksn@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(20, 'nurrizkiadip', 'nrizki@dicoding.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(21, 'rifath_2SXp', 'rifathali088@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(22, 'ledis_idola_h8Ge', '221113142@students.mikroskil.ac.id', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(23, 'fkaslana', 'kaslanafircan@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(24, 'anggit_andreansyah', 'anggitandreansyah119@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(25, 'jeni_amanda_ABFC', 'jeniamandaa@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(26, 'ramadhan_oktarizaldi_02Qj', 'roktarizaldi@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(27, 'istiabudi73', 'istiabudi@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(28, 'budhisant', 'budhisant@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(29, 'diinggo', 'diinggo14@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(30, 'fahram', 'khaidir@fahram.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(31, 'muftialies', 'iyakiwan19@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(32, 'fakhry', 'fakhry.mmpp@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(33, 'jokoss92', 'johno.smakaduta@gmail.com', '2025-11-26 21:51:01', '2025-11-26 21:51:01'),
(34, 'Saad_Fauzi', 'akunbisnis.sf@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(35, 'silmiathqia', 'silmiathqia@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(36, 'suryani-lestari', 'suryanilestari123@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(37, 'andiirhamm', 'andi.irhamm@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(38, 'fauzulhanif16', 'muhammadfauzulhanif16@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(39, 'anddfian', 'andd.fian@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(40, 'wilson_oey', 'wilsonoey60@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(41, 'bagusangkasawan', 'bagusasp01@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(42, 'akhsaul', 'ikhsanmaulana384@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(43, 'muhhanif99', 'hmuttaqin97@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(44, 'mawann', 'muhammad.himawan73@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(45, 'aslich', 'iwan.aslich@yahoo.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(46, 'rezaikbal', 'rezaikbal2311@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(47, 'andrewbj', 'andrewbjamesie@yahoo.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(48, 'ykbintang', 'ykbintang07@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(49, 'nielshn11', 'lisnarda.siregar1212@gmail.com', '2025-11-26 21:56:39', '2025-11-26 21:56:39'),
(50, 'Leakz', 'produkleakz@gmail.com', '2025-12-02 21:10:28', '2025-12-02 21:10:28');

INSERT INTO classes (id, name, created_at, updated_at) VALUES
(3, 'Memulai Dasar Pemrograman untuk Menjadi Pengembang Software', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(4, 'Pengenalan ke Logika Pemrograman (Programming Logic 101)', '2025-11-20 21:28:43', '2025-11-20 21:28:43');

INSERT INTO modules (id, class_id, name, est_minutes, description, created_at, updated_at) VALUES
(3, 3, 'Persiapan Belajar', 72, 'Memahami HAKI, mekanisme belajar, forum diskusi, glosarium, dan daftar referensi.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(4, 3, 'Memahami Kebutuhan Aplikasi', 49, 'Belajar teori dan metodologi dalam memahami kebutuhan aplikasi dari sisi pengguna beserta dari sisi spesifikasi teknis aplikasi. Implementasi keterampilan ke dalam studi kasus membuat kebutuhan aplikasi dari sisi pengguna maupun dari sisi spesifikasi teknis. Belajar tips sikap kerja saat meneliti, menganalisis, dan mengevaluasi kebutuhan aplikasi.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(7, 3, 'Perencanaan Modifikasi Aplikasi', 79, 'Belajar teori dan metodologi dalam pembuatan persyaratan kebutuhan aplikasi, dalam memahami cara aplikasi bekerja, dan dalam mengerti panduan diagram alur.', '2025-11-20 21:14:41', '2025-11-20 21:14:41'),
(8, 3, 'Mengerti Konsep Dasar Pemrograman', 140, 'Belajar teori sintaksis bahasa pemrograman, variabel, tipe data, logika komputer, dan bahasa pemrograman JavaScript versi ES6. Implementasi keterampilan dengan cara latihan menulis pseudocode dan menulis kode pertama. Belajar tips sikap kerja dalam belajar pemrograman.', '2025-11-20 21:14:41', '2025-11-20 21:14:41'),
(9, 3, 'Modifikasi Aplikasi Perangkat Lunak', 54, 'Belajar bahasa markah HTML versi HTML5 dan bahasa pemrograman CSS versi 3. Implementasi keterampilan melalui studi kasus modifikasi sebuah antarmuka aplikasi perangkat lunak. Belajar tips sikap kerja dalam meningkatkan keahlian sebuah bahasa pemrograman.', '2025-11-20 21:21:05', '2025-11-20 21:21:05'),
(10, 3, 'Dokumentasi Pemrograman dan Pengembangan Aplikasi Perangkat Lunak', 91, 'Belajar teori pengarsipan perangkat lunak, pembuatan gaya penulisan kode, penulisan komentar pada kode, dan pembuatan dokumentasi teknis aplikasi. Implementasi keterampilan melalui studi kasus pengarsipan sebuah perangkat lunak, penyesuaian gaya penulisan kode agar sesuai standar, menambahkan komentar pada kode, dan latihan pembuatan dokumentasi teknis aplikasi. Belajar sikap kerja dalam mengomunikasikan dokumentasi kepada stakeholders (pemegang kepentingan) perusahaan.', '2025-11-20 21:21:05', '2025-11-20 21:21:05'),
(11, 4, 'Pendahuluan', 120, 'Pengenalan istilah logika dan algoritma dan jenis-jenis logika pemrograman dasar.', '2025-11-20 21:28:43', '2025-11-20 21:28:43'),
(12, 4, 'Gerbang Logika', 120, 'Mengetahui apa itu gerbang logika dan jenis-jenisnya seperti AND, OR, NOT, NAND, NOR, XOR, dan XNOR.', '2025-11-20 21:28:43', '2025-11-20 21:28:43'),
(13, 4, 'Pengenalan Dasar Computational Thinking', 120, 'Mengetahui cara penyelesaian masalah menggunakan metode dasar computational thinking meliputi, dekomposisi, pengenalan pola, abstraksi, penulisan algoritma, dan evaluasi.', '2025-11-20 21:34:15', '2025-11-20 21:34:15');

INSERT INTO submodules (id, module_id, title, content, created_at, updated_at) VALUES
(1, 3, 'Persetujuan Hak Cipta', 'Dengan lanjut ke materi berikutnya, Anda menyetujui adanya informasi hak cipta di atas terhadap modul dalam kelas ini.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(2, 3, 'Mekanisme Belajar', 'Selamat datang di Dicoding Academy. Sebelum memulai belajar di kelas ini, Anda perlu tahu tahapan dan cara belajar beserta fasilitas yang tersedia agar proses belajar lebih efektif.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(3, 3, 'Forum Diskusi', 'Ekspektasi Dengan banyaknya jumlah siswa Dicoding Academy, kami tidak mengharapkan siswa untuk membaca semua diskusi atau komentar pada forum diskusi. Sebaliknya, bacalah hal-hal yang menurut Anda menarik dan dapat membantu Anda dalam menyelesaikan kelas. Lebih baik lagi, jika Anda dapat membantu siswa lainnya dengan memberikan jawaban di bidang yang Anda pahami. Berbagi dalam forum diskusi ini dapat pula membantu meningkatkan retensi ilmu Anda. Peraturan paling penting adalah bersikap sopan dan memperlakukan semua siswa lain dan instruktur, dengan hormat. Pelanggaran etika ini dapat berakibat pada dikeluarkannya Anda dari kelas. Anda akan memiliki akses ke forum diskusi kelas selama Anda aktif terdaftar ke kelas ini. Saat masa belajar Anda sudah habis, maka forum diskusi tidak akan dapat diakses. Namun, jika Anda sukses menyelesaikan kelas (lulus dan sampai mendapatkan sertifikat kompetensi dari Dicoding), maka Anda tetap dapat mengakses forum diskusi kelas ini walau masa belajar Anda untuk kelas ini telah habis.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(4, 3, 'Glosarium', 'B Browser Browser atau peramban merupakan sebuah perangkat lunak komputer untuk mencari informasi dalam situs internet. C Compiler Program komputer yang menerjemahkan kode yang ditulis dalam satu bahasa pemrograman ke bahasa lain yang dimengerti oleh mesin. D Debugging Proses mengidentifikasi dan menghilangkan error pada aplikasi.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(5, 3, 'Daftar Referensi', '[1] McKinsey. Unlocking Indonesia''s Digital Opportunity. https://www.mckinsey.com/featured-insights/asia-pacific/unlocking-indonesias-digital-opportunity (diakses pada 09 Juni 2021). [2] R.C. Martin, Clean Code: A Handbook of Agile Software Craftsmanship. United Kingdom: Pearson, 2008, Chapter 1. [3] M. Fowler, Refactoring: Improving the Design of Existing Code. Boston, MA, USA: Addison-Wesley Professional, 2018, Chapter 1.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(6, 4, 'Pengantar Kebutuhan Aplikasi', 'Perkembangan teknologi sekarang ini tumbuh kian pesat dari hari ke hari. Komputer dan handphone menjadi hal yang lumrah dimiliki semua orang saat ini. Hal ini karena teknologi tersebut dapat mempermudah kita untuk mengerjakan semua hal menjadi lebih cepat dan efisien. Apalagi didukung dengan banyaknya aplikasi yang ada di dalamnya.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(7, 4, 'Kebutuhan Aplikasi dari sisi Pengguna', 'Tiap-tiap proses dalam SDLC adalah penting, di mana setiap proses akan memberikan dampak terhadap proses setelahnya. Misalnya jika kita melakukan proses planning, analysis, dan design secara matang, maka proses implementasi dan testing akan bisa dieksekusi secara lebih baik dan juga lancar. Kebalikannya, jika proses implementasi dan testing tidak bisa dilakukan secara baik, maka proses maintenance (pemeliharaan) akan mengalami banyak masalah.Dalam pengembangan aplikasi, untuk mengetahui kebutuhan pengguna secara utuh, biasanya dilakukan proses pembuatan dokumen User Requirements Specification (URS) atau User Requirement Document (URD). Dokumen ini bukan bersifat teknis, melainkan dibikin dengan format agar semua orang dapat membaca dan paham dengan gambaran besarnya.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(8, 4, 'Spesifikasi Teknis Aplikasi dan Cara Menentukannya', 'Sebelumnya kita sudah belajar mengenai User Requirement Specification (URS), yang fungsinya untuk memahami kebutuhan pengguna sebelum membuat aplikasi. Nah kali ini kita akan membahas mengenai Spesifikasi Teknis Aplikasi, yakni dokumen yang menyimpan informasi detail mengenai fungsionalitas dari sistem/aplikasi, servis, dan juga limitasi-limitasinya. Berbeda dengan URS di mana tidak boleh menggunakan jargon teknis, dokumen Spesifikasi Teknis justru akan banyak jargon-jargon yang digunakan. Ini memang karena kebutuhannya sudah mengarah ke sistemnya.', '2025-11-19 19:25:34', '2025-11-19 19:25:34'),
(9, 7, 'Spesifikasi Kebutuhan Perangkat Lunak dan Struktur Penulisannya', 'Apa itu Dokumen SKPL? Pernahkah Anda mendengar istilah Spesifikasi Kebutuhan Perangkat Lunak (SKPL) atau juga bisa disebut dengan Software Requirement Specification (SRS)? Jika belum, tenang saja. Kita akan mengulasnya secara detail disertai studi kasus untuk memperkuat pemahaman Anda. Spesifikasi Kebutuhan Perangkat Lunak (SKPL) adalah sebuah dokumen yang dibuat sebelum mengembangkan sebuah aplikasi perangkat lunak. Dokumen ini menjelaskan cara kerja dan kebutuhan fungsional maupun non-fungsional dari aplikasi yang digunakan pengguna nantinya. ', '2025-11-20 21:14:41', '2025-11-20 21:14:41'),
(10, 7, 'Alur Kerja Aplikasi', 'Berkomunikasi dengan komputer tidak dapat menggunakan bahasa manusia, melainkan menggunakan bahasa pemrograman. Instruksi yang kita berikan akan diproses oleh CPU (Central Processing Unit) yang ada pada komputer. Lalu, bagaimana kode yang kita buat bisa dipahami oleh komputer? Ketika seorang pengembang software menulis dan menjalankan sebuah kode, maka terjadilah proses konversi. Proses tersebut dibedakan menjadi dua yaitu Compile dan Interpret.', '2025-11-20 21:14:41', '2025-11-20 21:14:41'),
(11, 7, 'Penyelesaian Masalah Menggunakan Cara Berpikir Komputasional', 'Setiap orang pasti pernah melakukan kesalahan dalam menulis kode. Oleh karena itu mungkin Anda bertanya, "Bagaimana kalau program yang kita buat mengalami eror?" Sebagai seorang pengembang software kita harus belajar dari pengalaman untuk mengasah kemampuan pemecahan masalah. Ketika pengembang software membuat aplikasi, mereka akan mulai berpikir secara terstruktur layaknya sebuah komputer mengeksekusi setiap perintah. Begitu pula saat memecahkan sebuah permasalahan. Mereka akan mencari solusi dari permasalahan secara terstruktur dan seefisien mungkin. Berikut teknik penyelesaian masalah menggunakan cara berpikir komputasional.', '2025-11-20 21:14:41', '2025-11-20 21:14:41'),
(12, 7, 'Pengenalan Flowchart', 'Familiar dengan Flowchart? Flowchart atau bisa disebut dengan diagram alur merupakan bentuk penggambaran dengan pendekatan visual terkait langkah-langkah dan keputusan untuk melakukan sebuah proses, alur kerja, ataupun algoritma. Setiap langkah dalam urutan proses akan digambarkan dalam bentuk diagram dan dihubungkan dengan garis atau arah panah. Diagram alur ini juga berperan penting dalam kasus yang melibatkan banyak orang secara bersamaan dalam memutuskan sebuah langkah atau fungsionalitas yang diinginkan dari sebuah proyek. Mereka akan lebih jelas, ringkas, dan mengurangi kemungkinan untuk salah tafsir tentang langkah apa yang harus dilakukan.', '2025-11-20 21:14:41', '2025-11-20 21:14:41'),
(13, 8, 'Pengenalan Sintaksis dan Case Sensitive', 'Setiap bahasa pemrograman memiliki kaidahnya masing-masing, seperti bagaimana cara menulisnya, penggunaan huruf besar dan kecil, keyword apa yang sudah ada di bahasa tertentu, dan lain sebagainya. Sedangkan untuk mengakhiri baris kode, beberapa bahasa pemrograman kerap memerlukan tanda baca semicolon alias titik koma, tetapi ada pula yang tidak. Kaidah-kaidah itulah yang dinamakan sintaksis. Sintaksis merupakan aturan-aturan yang ada di dalam bahasa pemrograman. Sintaksis harus benar-benar dipatuhi aturannya supaya kode kita berjalan dengan baik. Di beberapa bahasa pemrograman, sintaksisnya ada yang hampir sama, ada juga yang jauh berbeda.', '2025-11-20 21:14:41', '2025-11-20 21:14:41'),
(14, 8, 'Statement dan Whitespace', 'Aplikasi terdiri dari kumpulan instruksi tunggal yang berkaitan satu sama lain. Misalnya dalam buku resep masakan kita sering menemui instruksi, "Panaskan air hingga 200 derajat celcius.", "Diamkan adonan di dalam kulkas selama 3 jam.", dan banyak lagi instruksi lainnya. Dalam aturan menulis sebuah kode pemrograman, instruksi di atas sering disebut dengan istilah statement. ', '2025-11-20 21:14:41', '2025-11-20 21:14:41'),
(15, 8, 'Keyword dan Pseudocode', 'Tahukah Anda apa sih sebenarnya keyword dalam bahasa pemrograman? Keyword merupakan kata kunci yang telah disediakan oleh sebuah bahasa pemrograman. Keyword tidak bisa berdiri sendiri guna membuat sebuah program yang dapat dijalankan. Kita harus mengkombinasikan keyword dengan logika pemrograman yang ada dengan bahasa yang kita pahami.', '2025-11-20 21:14:41', '2025-11-20 21:14:41'),
(16, 9, 'Pengenalan HTML', 'HTML singkatan dari Hypertext Markup Language. HTML tidak dapat dikatakan sebagai bahasa pemrograman karena tidak ada logika di dalamnya. Ia hanya digunakan untuk menyusun tampilan website supaya sesuai dengan yang dispesifikan dan dapat dibuka dengan browser. Dalam sebuah website biasanya terdapat index.html yang merupakan tampilan default ketika membuka suatu domain. Sebagai contoh, ketika membuka http://www.google.com, sejatinya Anda masuk ke halaman http://www.google.com/index.html. Fungsi utama HTML adalah membuat suatu halaman website menjadi lebih mudah dibaca dan dipahami. Oleh karena itu, di sana terdapat berbagai macam tag yang bisa digunakan untuk memformat teks, seperti heading, paragraf, maupun link.', '2025-11-20 21:21:05', '2025-11-20 21:21:05'),
(17, 9, 'Pengenalan CSS', 'Cascading Style Sheet atau biasa disingkat CSS merupakan W3C standar yang digunakan untuk mengatur visualisasi berkas yang ditulis pada HTML. Pada materi ini kita akan mempelajari penggunaan dasar CSS. Tepatnya mulai dari pembuatan berkas CSS, pengenalan struktur sintaksisnya, hingga menerapkan dasar styling seperti memberikan warna pada sebuah teks. Sintaksis CSS berbeda dengan HTML, tetapi keduanya memiliki persamaan yaitu tidak termasuk dalam pemrograman. CSS hanyalah sebuah declarative language yang digunakan untuk mendeklarasikan suatu nilai yang mengatur seperti apa sebuah elemen HTML ditampilkan pada browser.', '2025-11-20 21:21:05', '2025-11-20 21:21:05'),
(18, 9, 'Penyelesaian Masalah Menggunakan Cara Berpikir Komputasional', 'Setiap orang pasti pernah melakukan kesalahan dalam menulis kode. Oleh karena itu mungkin Anda bertanya, "Bagaimana kalau program yang kita buat mengalami eror?" Sebagai seorang pengembang software kita harus belajar dari pengalaman untuk mengasah kemampuan pemecahan masalah. Ketika pengembang software membuat aplikasi, mereka akan mulai berpikir secara terstruktur layaknya sebuah komputer mengeksekusi setiap perintah. Begitu pula saat memecahkan sebuah permasalahan. Mereka akan mencari solusi dari permasalahan secara terstruktur dan seefisien mungkin. Berikut teknik penyelesaian masalah menggunakan cara berpikir komputasional.', '2025-11-20 21:21:05', '2025-11-20 21:21:05'),
(19, 10, 'Apa itu Pengarsipan Versi Perangkat Lunak', 'Apa itu pengarsipan versi perangkat lunak? Hal ini dapat diartikan sebagai proses mengarsipkan perangkat lunak atau aplikasi yang telah kita buat. Mengapa kita perlu melakukan pengarsipan? Tentunya selain menghindari hilangnya perangkat lunak tersebut, juga memudahkan kita untuk mencari solusi jika terjadi masalah. Dengan melakukan pengarsipan, kita bisa melihat perubahan yang ada. Bahkan jika dalam perubahan terbaru menimbulkan masalah atau bug, kita bisa mengembalikan versi sebelumnya.', '2025-11-20 21:21:05', '2025-11-20 21:21:05'),
(20, 10, 'Pengenalan Style Guide', 'Apa itu Style Guide? Style Guide merupakan kumpulan peraturan mengenai bagaimana cara penulisan kode yang baik bagi developer secara individu maupun tim. Pada style guide tertulis secara lengkap aturan yang harus diikuti oleh developer. Seperti penggunaan double atau single quote, indentasi, semicolon, penamaan variabel, dan lainnya. Style atau gaya sejatinya adalah pilihan masing-masing individu, seperti gaya berpenampilan, berbicara, berjalan, atau dalam hal lainnya. Demikian halnya saat menuliskan kode. Setiap developer berhak menentukan gaya penulisan yang ia ikuti. ', '2025-11-20 21:21:05', '2025-11-20 21:21:05'),
(21, 10, 'Apa itu Komentar pada Kode', 'Sangat penting untuk menuliskan sebuah source code yang mudah dibaca. Walaupun tidak paham teknisnya tetapi kita wajib paham bagaimana potongan kode itu berjalan. Maka dari itu kita dapat menambahkan komentar pada beberapa baris statement yang dirasa cukup penting untuk dijelaskan. Selain itu komentar dalam kode juga berguna untuk memahaminya kembali ketika sudah lama tidak membuka kode tersebut. Misalnya setelah 3 tahun berlalu, Anda berencana untuk menambahkan fitur dan membuka kode lama tersebut. Kemungkinan Anda sedikit lupa tentang baris kode yang ada di sana. Jika dulu Anda telah menambahkan komentar, maka Anda bisa terbantu untuk memahaminya kembali.', '2025-11-20 21:21:05', '2025-11-20 21:21:05'),
(22, 11, 'Apa itu Logika Pemrograman', 'Menurut Technopedia, logika pemrograman adalah sebuah kemampuan dasar yang menerapkan pemahaman operasi logika terhadap data ke dalam ilmu komputer [1]. Tidak berhenti di sana, logika pemrograman juga dapat membantu Anda untuk menyelesaikan masalah (problem solving), baik dalam bidang pemrograman maupun kehidupan sehari-hari. Sangat bermanfaat sekali, bukan? Ada 3 jenis logika pemrograman yang akan kita bahas, antara lain: Logika aritmatika, Logika perbandingan, Logika perulangan.', '2025-11-20 21:28:43', '2025-11-20 21:28:43'),
(23, 11, 'Perbedaan Logika dan Algoritma Pemrograman', 'Logika dan algoritma merupakan dua hal yang berbeda tetapi saling berkaitan satu sama lain. Jika sebelumnya logika pemrograman dapat membantu Anda untuk menyelesaikan permasalahan (problem solving), algoritma bertugas untuk membuat penyelesaiannya lebih terstruktur. Dengan begitu, alur penyelesaian masalah akan lebih tertata dan eksekusinya akan lebih mudah. Sehingga dapat disimpulkan algoritma pemrograman merupakan langkah-langkah penyelesaian masalah yang terangkai secara masuk akal, urut, dan sistematis.', '2025-11-20 21:28:43', '2025-11-20 21:28:43'),
(24, 11, 'Penalaran Logika Induktif dan Deduktif', 'Menurut Stanford Encyclopedia of Philosophy, penalaran logika induktif adalah logika pendukung pembuktian [2]. Jenis penalaran ini melibatkan pembentukan generalisasi berdasarkan pengalaman, pengamatan, dan fakta. Secara sederhana, penalaran induktif merupakan metode berpikir menggunakan pengamatan dan digabungkan dengan pengalaman yang sudah Anda ketahui kebenarannya untuk mendapatkan sebuah kesimpulan. Sedangkan silogisme adalah bentuk, cara berpikir atau menarik simpulan yang terdiri atas premis umum, premis khusus, dan simpulan (misalnya semua manusia akan mati, si A manusia, jadi si A akan mati) [4]. Sehingga bisa dikatakan jika A = B dan B = C, maka hasil kesimpulan dari penalaran logikanya adalah A = C.', '2025-11-20 21:28:43', '2025-11-20 21:28:43'),
(25, 12, 'Apa itu Gerbang Logika', 'Gerbang logika atau logic gate adalah sebuah rangkaian sirkuit digital yang berguna untuk memproses logika boolean (logika yang menghasilkan output benar atau salah). Gerbang logika ini menghasilkan output berupa 0 (salah) atau 1 (benar) berdasarkan input (masukan) yang kita berikan.', '2025-11-20 21:28:43', '2025-11-20 21:28:43'),
(26, 12, 'Gerbang Logika AND', 'Logika AND dilambangkan dengan perkalian (multiply) yang menggunakan tanda titik ("."​) atau tanpa titik karena keduanya sudah menunjukkan perkalian. Sehingga logika AND bisa diekspresikan sebagai X = A.B atau bisa juga ditulis tanpa titik X = AB. ', '2025-11-20 21:28:43', '2025-11-20 21:28:43'),
(27, 12, 'Gerbang Logika OR', 'Logika OR dilambangkan dengan penjumlahan (plus) yang menggunakan tanda plus ("+"). Sehingga logika OR bisa diekspresikan sebagai X = A + B.', '2025-11-20 21:28:43', '2025-11-20 21:28:43'),
(28, 13, 'Pengenalan Computational Thinking', 'Computational thinking bukanlah sebuah istilah tunggal karena di dalamnya terdapat beberapa elemen penting. Elemen tersebut terdiri dari 5 metode yang dapat dilakukan dalam pemecahan sebuah masalah baik dalam pemrograman atau kehidupan sehari-hari. Kelima elemen computational thinking yang akan kita bahas di modul ini antara lain: Memecah permasalahan yang besar menjadi bagian kecil (decomposition), Pelajari pola dari setiap permasalahan (pattern recognition), Mengabstraksikan suatu permasalahan (abstraction), Susun langkah menggunakan algoritma (algorithm), Mengevaluasi solusi yang didapatkan (evaluation).', '2025-11-20 21:34:15', '2025-11-20 21:34:15'),
(29, 13, 'Decomposition', 'Kemampuan memecah permasalahan menjadi bagian-bagian kecil merupakan hal alami yang dimiliki manusia dan sangat berguna untuk banyak hal. Bayangkan ada sebuah mesin pabrik yang besar dan rumit. Menurut Anda bagaimanakah proses pengiriman mesin tersebut dari pihak pembuat hingga sampai di pabrik tersebut? Jika langsung diangkut dalam bentuk yang besar pasti menyusahkan proses pengirimannya. Selain itu juga beresiko rusak di perjalanannya juga. ', '2025-11-20 21:34:15', '2025-11-20 21:34:15'),
(30, 13, 'Pattern Recognition', 'Pattern Recognition merupakan teknik pemecahan masalah dengan melihat perbedaan atau persamaan pola dari berbagai permasalahan. Sehingga kita dapat memprediksi atau memproyeksikan solusi apa yang harus kita lakukan. Ketika kita dihadapkan dengan banyak permasalahan, kita harus bisa mempelajari polanya supaya dapat menyelesaikan dengan cepat. Untuk dapat memperjelas maksud dari Pattern Recognition atau mempelajari pola, mari kita ilustrasikan dengan menggambar kucing.', '2025-11-20 21:34:15', '2025-11-20 21:34:15');

INSERT INTO targets (id, user_id, week_start, week_end, created_at, updated_at) VALUES
(1, 1, '2025-11-17', '2025-11-23', '2025-11-19 19:48:25', '2025-11-19 19:48:25'),
(4, 1, '2025-11-24', '2025-11-30', '2025-11-26 21:25:43', '2025-11-26 21:25:43'),
(5, 2, '2025-11-24', '2025-11-30', '2025-11-26 21:38:59', '2025-11-26 21:38:59'),
(6, 2, '2025-12-01', '2025-12-07', '2025-12-01 21:16:45', '2025-12-01 21:16:45'),
(7, 1, '2025-12-01', '2025-12-07', '2025-12-01 21:30:47', '2025-12-01 21:30:47'),
(9, 50, '2025-12-01', '2025-12-07', '2025-12-02 21:12:15', '2025-12-02 21:12:15');

INSERT INTO target_days (id, target_id, date, day_of_week, created_at, updated_at) VALUES
(1, 1, '2025-11-17', 'Monday', '2025-11-19 19:48:25', '2025-11-19 19:48:25'),
(2, 1, '2025-11-19', 'Wednesday', '2025-11-19 19:48:25', '2025-11-19 19:48:25'),
(3, 1, '2025-11-21', 'Friday', '2025-11-19 19:48:25', '2025-11-19 19:48:25'),
(8, 4, '2025-11-24', 'Monday', '2025-11-26 21:25:43', '2025-11-26 21:25:43'),
(9, 4, '2025-11-28', 'Friday', '2025-11-26 21:25:43', '2025-11-26 21:25:43'),
(10, 5, '2025-11-24', 'Monday', '2025-11-26 21:38:59', '2025-11-26 21:38:59'),
(11, 5, '2025-11-28', 'Friday', '2025-11-26 21:38:59', '2025-11-26 21:38:59'),
(12, 6, '2025-12-01', 'Monday', '2025-12-01 21:16:45', '2025-12-01 21:16:45'),
(13, 6, '2025-12-05', 'Friday', '2025-12-01 21:16:45', '2025-12-01 21:16:45'),
(14, 7, '2025-12-02', 'Tuesday', '2025-12-01 21:30:47', '2025-12-01 21:30:47'),
(15, 9, '2025-12-02', 'Tuesday', '2025-12-02 21:12:15', '2025-12-02 21:12:15'),
(16, 9, '2025-12-03', 'Wednesday', '2025-12-02 21:12:15', '2025-12-02 21:12:15'),
(17, 9, '2025-12-04', 'Thursday', '2025-12-02 21:12:15', '2025-12-02 21:12:15'),
(18, 9, '2025-12-05', 'Friday', '2025-12-02 21:12:15', '2025-12-02 21:12:15');

INSERT INTO target_modules (id, target_id, module_id, status, created_at, updated_at) VALUES
(1, 1, 3, 'completed', '2025-11-19 19:48:25', '2025-11-19 21:34:41'),
(2, 1, 4, 'completed', '2025-11-19 19:48:25', '2025-11-19 22:11:24'),
(3, 4, 7, 'not_started', '2025-11-26 21:25:43', '2025-11-26 21:25:43'),
(4, 4, 8, 'not_started', '2025-11-26 21:25:43', '2025-11-26 21:25:43'),
(5, 5, 7, 'not_started', '2025-11-26 21:38:59', '2025-11-26 21:38:59'),
(6, 5, 8, 'not_started', '2025-11-26 21:38:59', '2025-11-26 21:38:59'),
(7, 6, 7, 'completed', '2025-12-01 21:16:45', '2025-12-01 21:32:58'),
(8, 7, 8, 'completed', '2025-12-01 21:30:47', '2025-12-02 20:29:01'),
(9, 9, 3, 'completed', '2025-12-02 21:12:15', '2025-12-02 21:21:44'),
(10, 9, 4, 'completed', '2025-12-02 21:12:15', '2025-12-03 22:43:22'),
(11, 9, 7, 'not_started', '2025-12-02 21:12:15', '2025-12-02 21:12:15'),
(12, 9, 8, 'not_started', '2025-12-02 21:12:15', '2025-12-02 21:12:15');

INSERT INTO activities (id, user_id, module_id, target_id, date_started, date_completed, actual_minutes, status, created_at, updated_at) VALUES
(1, 1, 3, 1, '2025-11-19 21:27:15', '2025-11-19 21:34:41', 7, 'completed', '2025-11-19 21:27:15', '2025-11-19 21:34:41'),
(2, 1, 3, 1, '2025-11-19 21:50:46', '2025-11-19 22:00:57', 10, 'completed', '2025-11-19 21:50:46', '2025-11-19 22:00:57'),
(3, 1, 3, 1, '2025-11-19 21:50:48', '2025-11-19 22:01:26', 11, 'completed', '2025-11-19 21:50:48', '2025-11-19 22:01:26'),
(4, 1, 3, 1, '2025-11-19 21:59:17', '2025-11-19 22:01:49', 3, 'completed', '2025-11-19 21:59:17', '2025-11-19 22:01:49'),
(5, 1, 4, 1, '2025-11-19 22:02:26', '2025-11-19 22:11:24', 9, 'completed', '2025-11-19 22:02:26', '2025-11-19 22:11:24'),
(6, 1, 4, 1, '2025-11-20 21:55:28', '2025-11-20 21:56:56', 1, 'completed', '2025-11-20 21:55:28', '2025-11-20 21:56:56'),
(7, 1, 4, 1, '2025-11-20 22:26:56', '2025-11-20 22:32:26', 6, 'completed', '2025-11-20 22:26:56', '2025-11-20 22:32:26'),
(8, 2, 4, 1, '2025-11-20 22:34:15', '2025-11-20 23:36:39', 62, 'completed', '2025-11-20 22:34:15', '2025-11-20 23:36:39'),
(9, 1, 3, 1, '2025-11-20 23:35:55', '2025-11-26 21:58:34', 8543, 'completed', '2025-11-20 23:35:55', '2025-11-26 21:58:34'),
(10, 1, 7, 4, '2025-11-26 21:29:23', '2025-11-26 22:08:45', 39, 'completed', '2025-11-26 21:29:23', '2025-11-26 22:08:45'),
(11, 2, 7, 5, '2025-11-26 22:31:51', NULL, NULL, 'in_progress', '2025-11-26 22:31:51', '2025-11-26 22:31:51'),
(12, 2, 7, 6, '2025-12-01 21:26:32', '2025-12-01 21:32:58', 6, 'completed', '2025-12-01 21:26:32', '2025-12-01 21:32:58'),
(13, 2, 7, 6, '2025-12-01 21:34:07', NULL, NULL, 'in_progress', '2025-12-01 21:34:07', '2025-12-01 21:34:07'),
(14, 1, 7, 7, '2025-12-01 21:40:58', '2025-12-01 21:42:10', 1, 'completed', '2025-12-01 21:40:58', '2025-12-01 21:42:10'),
(15, 1, 8, 7, '2025-12-01 22:09:25', '2025-12-01 22:10:27', 1, 'completed', '2025-12-01 22:09:25', '2025-12-01 22:10:27'),
(16, 1, 8, 7, '2025-12-02 20:27:51', '2025-12-02 20:29:01', 1, 'completed', '2025-12-02 20:27:51', '2025-12-02 20:29:01'),
(17, 1, 8, 7, '2025-12-02 21:08:18', '2025-12-02 21:08:39', 0, 'completed', '2025-12-02 21:08:18', '2025-12-02 21:08:39'),
(19, 1, 9, 7, '2025-12-02 21:13:16', '2025-12-02 21:14:46', 2, 'completed', '2025-12-02 21:13:16', '2025-12-02 21:14:46'),
(20, 1, 3, 7, '2025-12-02 21:15:27', '2025-12-02 21:17:50', 2, 'completed', '2025-12-02 21:15:27', '2025-12-02 21:17:50'),
(21, 50, 9, 9, '2025-12-02 21:18:45', '2025-12-02 21:19:31', 1, 'completed', '2025-12-02 21:18:45', '2025-12-02 21:19:31'),
(22, 50, 3, 9, '2025-12-02 21:19:48', '2025-12-02 21:21:43', 2, 'completed', '2025-12-02 21:19:48', '2025-12-02 21:21:43'),
(26, 50, 4, 9, '2025-12-03 22:40:08', '2025-12-03 22:43:22', 3, 'completed', '2025-12-03 22:40:08', '2025-12-03 22:43:22'),
(27, 50, 4, 9, '2025-12-03 22:44:09', '2025-12-03 22:44:15', 0, 'completed', '2025-12-03 22:44:09', '2025-12-03 22:44:15');

INSERT INTO daily_checkins (id, user_id, checkin_date, created_at) VALUES
(1, 1, '2025-11-19', '2025-11-19 21:59:17'),
(3, 1, '2025-11-20', '2025-11-20 21:55:28'),
(5, 2, '2025-11-20', '2025-11-20 22:34:15'),
(7, 1, '2025-11-26', '2025-11-26 21:29:23'),
(8, 2, '2025-11-26', '2025-11-26 22:31:51'),
(9, 2, '2025-12-01', '2025-12-01 21:26:32'),
(11, 1, '2025-12-01', '2025-12-01 21:40:58');

INSERT INTO weekly_streaks (id, user_id, week_start, week_end, streak, last_completion_date, created_at, updated_at) VALUES
(1, 1, '2025-12-01', '2025-12-07', 1, '2025-12-02', '2025-12-02 13:29:01', '2025-12-02 13:29:01'),
(2, 50, '2025-12-01', '2025-12-07', 1, '2025-12-03', '2025-12-02 14:21:44', '2025-12-03 15:24:27');

-- Foreign keys (added after data load so insert order above doesn't need to satisfy them upfront)

ALTER TABLE modules ADD CONSTRAINT fk_modules_class FOREIGN KEY (class_id) REFERENCES classes(id);
ALTER TABLE submodules ADD CONSTRAINT fk_submodules_module FOREIGN KEY (module_id) REFERENCES modules(id);
ALTER TABLE targets ADD CONSTRAINT fk_targets_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE target_days ADD CONSTRAINT fk_target_days_target FOREIGN KEY (target_id) REFERENCES targets(id);
ALTER TABLE target_modules ADD CONSTRAINT fk_target_modules_target FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE;
ALTER TABLE target_modules ADD CONSTRAINT fk_target_modules_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;
ALTER TABLE activities ADD CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE activities ADD CONSTRAINT fk_activities_target FOREIGN KEY (target_id) REFERENCES targets(id);
ALTER TABLE activities ADD CONSTRAINT fk_activities_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE daily_checkins ADD CONSTRAINT fk_daily_checkins_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE weekly_streaks ADD CONSTRAINT fk_weekly_streaks_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE submodule_progress ADD CONSTRAINT fk_submodule_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE submodule_progress ADD CONSTRAINT fk_submodule_progress_submodule FOREIGN KEY (submodule_id) REFERENCES submodules(id) ON DELETE CASCADE;

-- Bump SERIAL sequences past the explicit ids inserted above

SELECT setval(pg_get_serial_sequence('users','id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('classes','id'), COALESCE((SELECT MAX(id) FROM classes), 1));
SELECT setval(pg_get_serial_sequence('modules','id'), COALESCE((SELECT MAX(id) FROM modules), 1));
SELECT setval(pg_get_serial_sequence('submodules','id'), COALESCE((SELECT MAX(id) FROM submodules), 1));
SELECT setval(pg_get_serial_sequence('targets','id'), COALESCE((SELECT MAX(id) FROM targets), 1));
SELECT setval(pg_get_serial_sequence('target_days','id'), COALESCE((SELECT MAX(id) FROM target_days), 1));
SELECT setval(pg_get_serial_sequence('target_modules','id'), COALESCE((SELECT MAX(id) FROM target_modules), 1));
SELECT setval(pg_get_serial_sequence('activities','id'), COALESCE((SELECT MAX(id) FROM activities), 1));
SELECT setval(pg_get_serial_sequence('daily_checkins','id'), COALESCE((SELECT MAX(id) FROM daily_checkins), 1));
SELECT setval(pg_get_serial_sequence('weekly_streaks','id'), COALESCE((SELECT MAX(id) FROM weekly_streaks), 1));
