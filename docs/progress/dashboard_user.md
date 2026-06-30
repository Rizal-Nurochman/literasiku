# Progress Report: Dashboard User (Katalog & Riwayat Peminjaman)

## Deskripsi Fitur
Laporan ini merangkum penyelesaian antarmuka pengguna (UI) dan integrasi sistem pada sisi *Dashboard User*, yang melingkupi tiga fungsionalitas inti:
1. **Katalog Buku**: Menelusuri seluruh koleksi buku, mencari, memfilter berdasarkan kategori & ketersediaan, serta melihat detail buku.
2. **Aksi Peminjaman**: Pengajuan pinjaman buku fisik maupun digital secara instan.
3. **Riwayat & Pembaca Digital (*Digital Reader*)**: Memantau daftar historis pinjaman (berikut status denda/tenggat waktu) dan membaca buku digital secara langsung di dalam aplikasi (bila masa peminjaman masih berlaku).

## Status Implementasi
- **Status:** Selesai (Termasuk *Type Checking* / Bebas Error TypeScript)
- **Tanggal:** 1 Juli 2026

---

## 1. Integrasi API & State Management
Seluruh aliran data telah diamankan menggunakan arsitektur *Nitro API Proxy* yang secara otomatis menempelkan autentikasi sesi (`literasiku_session`) ke server Go-Gin.

### Tipe Data (`client/shared/types`)
- Diperbarui `loans.ts` dengan menyertakan atribut tambahan `book_title` yang dikirim dari *backend*.
- Membuat `files.ts` untuk merepresentasikan data lampiran dokumen (PDF/Gambar).
- Menyuntikkan tipe generik `PaginatedResponse<T>` di dalam `api.ts` untuk menangani struktur halaman tabel API.

### Endpoints (Nitro Server `client/server/api`)
- `POST /api/loans/physical/index.post.ts` & `POST /api/loans/digital/index.post.ts`: Mengirim permintaan pinjam.
- `GET /api/loans/physical/my.get.ts` & `GET /api/loans/digital/my.get.ts`: Mengambil tabel historis ber-paginasi.
- `GET /api/loans/digital/access/[book_id].get.ts`: Memvalidasi kelayakan baca (mencegah eksploitasi URL).
- `GET /api/files/book/[book_id].get.ts`: Menarik rute `file_path` (PDF URL) spesifik untuk di-*render*.

### Vue Query Hooks (`client/app/composables`)
- `useLoans.ts`: Menghimpun seluruh kueri peminjaman (`useMyPhysicalLoans`, `useDigitalAccess`, dll) dan mutasi (pengajuan pinjam).
- `useFiles.ts`: Menyediakan `useBookFiles` yang aman dengan pengecekan reaktif (*disabled* sebelum ID valid).

---

## 2. Pembangunan Antarmuka (UI Components & Pages)
Mengadopsi *best practices* pengembangan antarmuka skala besar, halaman dipecah secara modular di direktori `client/app/components/dashboard/user/`.

### Modul Katalog (`/dashboard/katalog/index.vue`)
- **`CatalogHeader.vue`**: Kepala hero visual dengan efek transisi gerak (mendukung opsi *reduced-motion*).
- **`CatalogFilters.vue`**: Saringan reaktif yang memungkinkan filter ganda (Pencarian Teks + Tombol Kategori + Status Stok).
- **`BookCard.vue`**: Kartu representasi tunggal yang mengkalkulasi dan mencetak *badges* ketersediaan fisik vs digital (*real-time* berdasarkan angka `physical_stock`).
- **`CatalogEmptyState.vue`**: Penanganan elegan saat tabel koleksi kosong.
- **Halaman Detail (`[id].vue`)**: Laman spesifik dengan gambar sampul besar, pratinjau ISBN/penerbit, dan eksekusi instan tombol **Ajukan Pinjam Fisik** atau **Baca Digital** yang langsung mengalihkan navigasi ke Riwayat.

### Modul Riwayat (`/dashboard/riwayat/index.vue`)
Menggunakan struktur `UTabs` (Nuxt UI v4) untuk menengahi dua tabel:
- **`PhysicalHistory.vue`**: Melacak siklus peminjaman buku cetak dengan format warna kustom (*green* = RETURNED, *red* = OVERDUE/UNPAID).
- **`DigitalHistory.vue`**: Menyajikan log akses (*ACTIVE*, *EXPIRED*). Menyematkan tombol pintar **"Baca Sekarang"** yang hanya ter-render jika akses berlabel *ACTIVE*.

### Modul Baca Digital (*Digital Reader*) (`/dashboard/riwayat/baca/[book_id].vue`)
- Bertindak sebagai pelindung sekaligus proyektor. Halaman ini mencegat *render* utama untuk menanyai API (`CheckAccess`). Jika tidak ada izin, akan melempar *Toast Error* dan mengusir *User* keluar.
- Jika lolos, halaman akan melukis *PDF Preview* menggunakan kanvas bawaan browser (`<object>`). Ini memberikan sensasi membaca tanpa jeda berkat rasio layar-penuh yang minimalis.

## Kesimpulan & Stabilitas Kode
Seluruh bagian depan (frontend) untuk skenario sirkulasi perpustakaan (pencarian → pinjam → baca) telah stabil. Skrip tambahan *TypeScript type checking* juga telah membuktikan bahwa seluruh alur pengolahan variabel ini bersih dari celah kebocoran/bentrok tipe data (*Exit code: 0*). Kode dipastikan 100% tanpa adanya *comment code* sesuai instruksi gaya koding.
