# 🔒 Indigo Admin Web (`indigo-admin-web`)
> **Repository 2 — Portal Internal Monitoring, Kurasi Mentor & Preview Pitch Deck Privat untuk Indigo Game (`game.indigo.id`)**  
> *Final Project Divisi Web Development — MSIB Mandiri VINIX7 (November 2026)*

---

## 📌 1. Ikhtisar Arsitektur (Repo 2 dari 2)

Aplikasi ini merupakan **Repository 2 (`indigo-admin-web`)** dari arsitektur **Multi-Repo + Shared Database** Indigo Game:

- Terhubung ke **1 pusat database & storage Supabase yang sama** dengan `indigo-public-web` (Repo 1).
- Memiliki hak akses penuh (**CRUD**: `SELECT`, `UPDATE`, `DELETE`) terhadap tabel `game_submissions`, `submission_reviews`, dan `contact_messages`.
- **Akses Eksklusif Pitch Deck Privat:** Membuka dan menampilkan preview dokumen PDF Pitch Deck dari **Private Storage Bucket (`pitch-decks`)** yang tidak dapat diakses oleh user publik.
- Dilengkapi `robots.txt` (`Disallow: /`) dan meta `noindex, nofollow` agar tidak diindeks oleh mesin pencari publik.

---

## 🗺️ 2. Struktur Halaman (`indigo-admin-web`)

| Route | Halaman | Deskripsi |
| :--- | :--- | :--- |
| `/login` | **Autentikasi** | Login staf/mentor terintegrasi dengan Supabase Auth & akun demo internal (`admin@indigo.id` / `IndigoAdmin2026!`). |
| `/dashboard` | **Dashboard Utama** | Ringkasan metrik pendaftaran (*Total, Pending, Under Review, Accepted, Rejected*), distribusi platform, & 5 pendaftar terbaru. |
| `/submissions` | **Daftar Pendaftar** | Tabel lengkap seluruh pendaftar, fitur pencarian, filter status & platform, hapus data, serta tombol **Export CSV**. |
| `/submissions/[id]` | **Detail & Review** | **Fitur Utama:** Tampilan detail profil Game Director & Startup, **Embedded PDF Pitch Deck Viewer (Private Storage)**, tombol unduh PDF, tautan video/demo, ubah status kurasi, dan **Form Skor Penilaian Mentor (1–5)**. |
| `/inbox` | **Kotak Masuk** | Daftar pesan kolaborasi yang dikirim dari halaman `/contact` pada `indigo-public-web`. |

---

## 🚀 3. Cara Menjalankan di Lokal (Port 3001)

Agar dapat berjalan bersamaan dengan `indigo-public-web` (yang berjalan di port `3000`), aplikasi admin ini diatur berjalan pada port **`3001`**:

```bash
cd indigo-admin-web
npm install
npm run dev
```
Buka **`http://localhost:3001`** di browser Anda.
