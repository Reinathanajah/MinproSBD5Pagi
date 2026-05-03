---
title: SBD Minpro 5

---

# Project Proposal: Mini-Project NoSQL Database Kelompok 5

**1. Assigned Paradigm & Tool**
* **Assigned Paradigm:** Document Store
* **Tool of Choice:** MongoDB

---

**2. Real-World Case Study**
* **Company:** Periplus (sebagai inspirasi arsitektur)
* **Use Case Researched:** Manajemen katalog e-commerce berskala masif dengan operasi yang *read-heavy*. Periplus sebagai toko buku daring terbesar di Indonesia mengelola ratusan ribu SKU buku dengan atribut yang sangat bervariasi, buku baru hadir dengan fitur digital seperti e-book, voucher akses, dan CD resource, sementara buku lama hanya memiliki metadata dasar seperti judul, pengarang, dan tahun terbit.

  Sistem relasional konvensional tidak efisien dalam skenario ini karena mengharuskan skema tabel yang seragam. Setiap penambahan atribut baru pada buku edisi terbaru memaksa migrasi skema (`ALTER TABLE`) yang berdampak pada seluruh baris tabel, termasuk jutaan entri buku lama yang tidak membutuhkan kolom tersebut. Akibatnya, tabel menjadi penuh dengan nilai `NULL` yang memboroskan alokasi memori dan memperlambat performa *query*.

  Periplus membutuhkan arsitektur yang mampu membedakan penanganan buku baru yang kaya fitur dan buku lama yang minim data. Untuk buku lama, pendekatan yang dibutuhkan adalah *less effort*, tidak perlu memaksakan migrasi ke skema baru yang kompleks, melainkan cukup melakukan *mounting* data eksisting apa adanya ke dalam basis data dengan struktur minimalis.

* **Mengapa Document Store (MongoDB)?**
  MongoDB dipilih karena beberapa keunggulan yang secara langsung menjawab permasalahan di atas:
  * **Schema Flexibility:** Setiap dokumen dalam satu *collection* dapat memiliki struktur field yang berbeda. Buku baru dan buku lama dapat hidup berdampingan dalam satu *collection* `books` tanpa *NULL-padding* atau migrasi skema.
  * **Embedding & Referencing:** MongoDB memungkinkan data yang sering diakses bersama (seperti ulasan terbaru) untuk di-*embed* langsung dalam dokumen buku, mengurangi jumlah *round-trip* ke database secara drastis.
  * **Horizontal Scalability:** MongoDB mendukung *sharding* secara native, memungkinkan distribusi beban *read* ke banyak node seiring bertambahnya jumlah pengguna.
  * **Materialized View Native Support:** Pola *pre-aggregated summary document* jauh lebih natural dan mudah diimplementasikan di MongoDB dibanding `MATERIALIZED VIEW` pada basis data relasional yang memerlukan *refresh* terjadwal dan tetap terikat skema rigid.

---

**3. Creative Project Idea**
* **Title:** **Folio - Tiered Dynamic Bookstore Catalog**
* **Domain:** E-Commerce / Retail Information System

  *"Folio"* adalah nama yang merujuk pada satuan lembar kertas dalam dunia percetakan buku, dipilih sebagai nama netral yang tidak terikat pada *brand* yang sudah ada, namun tetap merepresentasikan domain toko buku secara kuat.

---

**4. Problem Statement**

* **What your system does:**

  Folio adalah sistem *backend* dan antarmuka katalog buku tingkat lanjut yang menerapkan arsitektur **Data Tiering** berbasis MongoDB. Sistem membagi seluruh inventaris buku ke dalam dua tingkatan penyimpanan yang berbeda secara struktural:
  
  * **Hot Shelf** : Dokumen dengan skema kaya fitur, mencakup atribut digital (`features`), *embedded review* terbaru (maks. 5), `average_rating` pra-kalkulasi, dan `click_count`. Skema ini dioptimalkan untuk akses *read* yang cepat tanpa komputasi tambahan di sisi aplikasi.
  * **Cold Shelf** : Dokumen hasil *mounting* data minimalis untuk buku lama. Hanya field esensial yang diinisialisasi (`title`, `author`, `price`, `stock`, `genres`, `published_year`, `shelf_status`, `click_count`). Field opsional seperti `features` dan `has_more_comments` tidak diinisialisasi sama sekali, menghemat alokasi memori secara masif dalam skala jutaan dokumen.

  Selain arsitektur *Data Tiering*, sistem menerapkan dua mekanisme lanjutan:

  * **Mekanisme Promosi Cold → Hot Shelf:** Secara periodik, *background worker* membaca *collection* `click_logs` dan menghitung jumlah klik per buku dalam 30 hari terakhir. Jika jumlah klik suatu buku dari *Cold Shelf* melampaui threshold tertentu (misalnya 500 klik dalam 30 hari), worker memicu proses *shelf promotion* secara otomatis: menambahkan field `features`, `recent_comments`, dan `has_more_comments`, lalu mengubah `shelf_status` menjadi `"hot"`. Dengan mekanisme ini, buku lama yang kembali viral mendapatkan perlakuan *Hot Shelf* tanpa intervensi manual dari administrator.
  * **Arsitektur Materialized View via Summary Blobs:** Sistem menyimpan pra-kalkulasi agregasi silang dalam *collection* terpisah bernama `summary_blobs`. Terdapat 5 jenis kombinasi kategori blob: `waktu_alfabet`, `waktu_genre`, `genre_alfabet`, `waktu_rating` (*All Times Great*), dan `genre_rating` (*Top Leading*). Setiap blob menyimpan metrik `average_click_rate` dan daftar buku yang di-*embed* secara parsial (cukup untuk render kartu katalog). Nilai `average_click_rate` dan `average_rating` diperbarui secara periodik oleh *background worker* yang membaca *collection* `click_logs`, memastikan beban *write* tidak menghantam koleksi blob langsung di setiap klik pengguna.

  Ketika pelanggan memilih sebuah topik navigasi (misalnya **"Waktu"**), sistem tidak melakukan komputasi `JOIN` atau `SORT` pada jutaan dokumen buku. Alih-alih, sistem menjalankan satu *query* sederhana ke koleksi `summary_blobs`:

```javascript
  db.summary_blobs.find({ primary_topic: "waktu" }).sort({ average_click_rate: -1 })
```

  Hasilnya adalah halaman katalog yang termuat secara instan, menampilkan blob-blob dengan interaksi tertinggi di posisi teratas.

* **Who it is for:**
  * **Pelanggan** (end-user, usia 18–45 tahun, pengguna e-commerce aktif) yang membutuhkan pengalaman menjelajah katalog buku lintas-kategori secara instan tanpa *loading* berat, bahkan ketika inventaris mencapai jutaan judul.
  * **Administrator toko** yang memerlukan fleksibilitas penuh dalam mengelola inventaris buku lama dan baru secara bersamaan, menambah atribut baru pada buku edisi terbaru tanpa harus mendesain ulang arsitektur tabel atau melakukan migrasi masif yang berisiko.

---

**5. Conceptual Data Model**

Struktur data dirancang menggunakan prinsip *schema-less* MongoDB dengan kombinasi tiga strategi: **Embedding**, **Referencing**, dan **Materialized Views**. Pemilihan strategi per *collection* didasarkan pada pola akses (*access pattern*) yang dominan, bukan hanya normalitas data.

**A. Dokumen Buku Baru (Hot Shelf)**

Buku baru memiliki struktur lengkap. Ulasan dibatasi maksimal 5 terbaru menggunakan teknik *Embedding* untuk menghindari *unbounded array problem*, kondisi di mana satu dokumen tumbuh tanpa batas dan melampaui batas dokumen MongoDB (16 MB). Field `has_more_comments` di-set `true` secara otomatis oleh aplikasi ketika jumlah ulasan di *collection* `comments` untuk `book_id` yang bersangkutan melebihi 5. Field `average_rating` disimpan langsung (bukan dihitung *on-the-fly*) untuk menghindari agregasi mahal saat render katalog.

```json
{
  "_id": "ObjectId('book_hot_001')",
  "title": "Mastering Distributed Systems",
  "author": "Jane Doe",
  "price": 320000,
  "stock": 142,
  "published_year": 2026,
  "shelf_status": "hot",
  "click_count": 1280,
  "features": ["E-Book", "CD-Resource", "Access_Voucher"],
  "genres": ["Computer Science", "Engineering"],
  "average_rating": 4.7,
  "recent_comments": [
    {"user": "Wahib", "rating": 5, "text": "Sangat komprehensif!"},
    {"user": "Coki", "rating": 4, "text": "Bagus untuk referensi."}
  ],
  "has_more_comments": true,
  "last_updated": "ISODate('2026-04-28T10:00:00Z')"
}
```

**B. Dokumen Buku Lama (Cold Shelf - Data Mounting)**

Hasil *mounting* dari arsip buku lama. Field yang tidak relevan (`features`, `has_more_comments`) tidak diinisialisasi sama sekali, menghemat alokasi memori secara masif dalam skala jutaan dokumen. Field `click_count` tetap ada untuk keperluan monitoring threshold promosi Cold → Hot.

```json
{
  "_id": "ObjectId('book_cold_999')",
  "title": "Sejarah DOS 1.0",
  "author": "John Smith",
  "price": 85000,
  "stock": 3,
  "published_year": 1995,
  "shelf_status": "cold",
  "click_count": 12,
  "genres": ["History", "Technology"],
  "last_updated": "ISODate('2026-04-28T10:00:00Z')"
}
```

**C. Dokumen Ulasan Ekstensif - Collection `comments` (Referencing)**

Dipanggil hanya ketika `has_more_comments == true` pada dokumen *Hot Shelf*. Strategi *Referencing* dipilih di sini karena ulasan dapat tumbuh tanpa batas, tidak cocok untuk di-*embed* seluruhnya dalam dokumen buku. Query default: `find({ book_id: ... }).sort({ rating: -1 }).limit(10)`.

```json
{
  "_id": "ObjectId('comment_001')",
  "book_id": "ObjectId('book_hot_001')",
  "user": "Gorga",
  "rating": 5,
  "text": "Penjelasan materinya sangat detail dan mudah dipahami.",
  "created_at": "ISODate('2026-04-20T08:30:00Z')"
}
```

**D. Collection `click_logs` (Event Source untuk Background Worker)**

Setiap interaksi klik pengguna dicatat di sini secara *append-only*. *Background worker* membaca dan memproses *collection* ini secara periodik (setiap 5 menit) untuk memperbarui `average_click_rate` pada *Summary Blobs*, `click_count` pada dokumen buku, serta memicu promosi *shelf* jika threshold terpenuhi.

```json
{
  "_id": "ObjectId('log_001')",
  "book_id": "ObjectId('book_hot_001')",
  "user_session": "sess_abc123",
  "clicked_at": "ISODate('2026-04-28T09:45:00Z')"
}
```

**E. Materialized View — Collection `summary_blobs`**

Terdapat 5 jenis kombinasi kategori blob: `waktu_alfabet`, `waktu_genre`, `genre_alfabet`, `waktu_rating` (*All Times Great*), dan `genre_rating` (*Top Leading*). Setiap blob menyimpan metrik `average_click_rate`, field `last_refreshed` sebagai penanda kapan *worker* terakhir memperbarui dokumen, dan daftar buku yang di-*embed* secara parsial — hanya field yang cukup untuk render kartu katalog (judul, pengarang, harga, rating), bukan seluruh dokumen buku.

*Contoh 1: Blob Waktu - Rating (All Times Great)*
```json
{
  "_id": "ObjectId('blob_time_rating_2026')",
  "blob_type": "waktu_rating",
  "primary_topic": "waktu",
  "label": "All Times Great 2026",
  "average_click_rate": 15420,
  "last_refreshed": "ISODate('2026-04-28T09:50:00Z')",
  "books_embedded": [
    {
      "title": "Mastering Distributed Systems",
      "author": "Jane Doe",
      "average_rating": 4.9,
      "price": 320000,
      "book_id": "ObjectId('book_hot_001')"
    },
    {
      "title": "Advanced Linux Kernel",
      "author": "Linus B.",
      "average_rating": 4.8,
      "price": 275000,
      "book_id": "ObjectId('...')"
    }
  ]
}
```

*Contoh 2: Blob Genre - Alfabet*
```json
{
  "_id": "ObjectId('blob_genre_alpha_cs')",
  "blob_type": "genre_alfabet",
  "primary_topic": "genre",
  "label": "Computer Science (A-Z)",
  "average_click_rate": 8900,
  "last_refreshed": "ISODate('2026-04-28T09:50:00Z')",
  "books_embedded": [
    {
      "title": "Algorithms Illuminated",
      "author": "Tim R.",
      "price": 210000,
      "book_id": "ObjectId('...')"
    },
    {
      "title": "Mastering Distributed Systems",
      "author": "Jane Doe",
      "price": 320000,
      "book_id": "ObjectId('book_hot_001')"
    }
  ]
}
```

**Logika Routing Pengguna:** Ketika pelanggan menavigasi aplikasi dan memilih topik **"Waktu"**, sistem tidak melakukan komputasi *JOIN/SORT* pada jutaan koleksi buku. Alih-alih, sistem menjalankan *query* ke koleksi *Summary Blobs*:

```javascript
db.summary_blobs.find({ primary_topic: "waktu" }).sort({ average_click_rate: -1 })
```

Hasilnya, sistem menyajikan dokumen-dokumen *blob* (seperti *All Times Great* atau *Waktu-Genre*) yang memiliki interaksi (*customer referencing*) tertinggi di posisi teratas secara instan.

---

**6. Role Distribution**

| Nama                       | NPM        | Tanggung Jawab                              |
| -------------------------- | ---------- | ------------------------------------------- |
| Andhika Fadhlan Wijanarko  | 2306267164 | Backend Development & Database Architecture |
| Marshal Aufa Diliyana      | 2406346913 | Backend Development & API Integration       |
| Reinathan Ezkhiel          | 2406397675 | Data Engineering & Database Seeding         |
| Arkaan Pasya Seplitara              | 2406408073 | Frontend Development & UI/UX       |
| Diandra Pramesti Wicaksono | 2406342360 | Frontend Development & System Testing       |

---

## Backend 

```
backend/
├── .env
├── server.js              ← trust proxy, cron shelf eval tiap 30 menit
├── models/
│   ├── User.js            ← hidden metrics (default: undefined), genre prefs
│   ├── Book.js            ← cold/hot shelf, click logs, optional attrs, recycling
│   └── BookByUsers.js     ← wide-column antisipasi, mass-assignable
├── middleware/
│   ├── auth.js            ← JWT guard
│   └── adminOnly.js       ← admin role guard
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── userRoutes.js
│   └── searchRoutes.js
├── controllers/
│   ├── authController.js  ← register (validasi password ketat), login
│   ├── bookController.js  ← add/archive/delete(recycle), click, comment+like, rate, checkout, optional attr
│   ├── userController.js  ← profile, library
│   └── searchController.js← homepage random, search paginated, 7 materialized views
└── utils/
    ├── seedAdmin.js        ← admin@gmail.com seeded on startup
    ├── shelfManager.js     ← prune click logs (cold 150/hot 250), embed prune, top-10 shelf eval
    ├── weightedRating.js   ← Bayesian 3D (score × volume × time decay) + sentiment regex
    └── materializeViews.js ← 7 agregasi view + hotBooks + mostCommented + mostViewed
```

**Endpoint:**
| Method | URL | Auth |
|--------|-----|------|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | User |
| GET | `/api/books` | — |
| GET | `/api/books/:id` | — |
| POST | `/api/books/add` | Admin |
| PATCH | `/api/books/:id/archive` | Admin |
| DELETE | `/api/books/:id` | Admin |
| POST | `/api/books/:id/click` | User |
| POST | `/api/books/:id/comment` | User |
| POST | `/api/books/:id/comment/:cid/like` | User |
| POST | `/api/books/:id/rate` | User |
| POST | `/api/books/:id/checkout` | User |
| POST | `/api/books/:id/attribute` | Admin |
| GET | `/api/search/homepage` | — |
| GET | `/api/search/search?q=&genre=&year=&page=` | — |
| GET | `/api/search/hot` | — |
| GET | `/api/search/most-commented` | — |
| GET | `/api/search/most-viewed` | — |
| GET | `/api/search/view/:viewType` | — |

---

## Struktur Frontend

```
frontend/src/
├── api/axios.js           ← JWT interceptor + auto-logout
├── context/AuthContext.jsx← login/register/logout/isAdmin
├── constants/data.js      ← 21 jobs, 193 negara PBB, 24 genre
├── components/
│   ├── Navbar.jsx         ← 3-tier Gramedia navbar (utility bar + search + category nav)
│   ├── Footer.jsx         ← 4-column footer
│   ├── BookCard.jsx       ← 3:4 ratio card, hover scale, hot badge
│   └── StarRating.jsx     ← full/half/empty stars
└── pages/
    ├── HomePage.jsx       ← hero slider + 4 section grid (New, Hot, Commented, Viewed)
    ├── SearchPage.jsx     ← sidebar filter + pagination
    ├── BookDetailPage.jsx ← dynamic attributes, rating, comments, like, admin controls
    ├── LoginPage.jsx      ← show/hide password
    ├── RegisterPage.jsx   ← live password checklist, Other job border merah, dropdown negara
    ├── ProfilePage.jsx    ← biodata + horizontal library + recent comments
    ├── LibraryPage.jsx    ← full library grid
    └── AdminPage.jsx      ← form tambah buku + genre multi-select
```

