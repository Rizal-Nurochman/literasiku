# Progress Report: Implementasi Modul Admin Buku (Frontend)

**Tanggal:** 30 Juni 2026
**Fokus:** Mengintegrasikan fungsionalitas CRUD Buku di halaman Admin Frontend (Nuxt) dengan Backend (Go) tanpa mengubah kode backend.

## 1. Analisis Awal & Perencanaan
Berdasarkan dokumen arsitektur (`docs/client.md` dan `docs/server.md`), ditemukan beberapa _gap_ antara frontend dan backend:
- Frontend belum memiliki jalur komunikasi (API Proxy) yang aman untuk meneruskan token otentikasi ke backend khusus untuk entitas buku dan kategori.
- Composable `useBooks.ts` sebelumnya hanya berupa _stub_ kosong yang belum memanfaatkan Vue Query.
- Halaman UI Admin untuk manajemen buku (`/admin/buku`) masih berupa halaman kosong yang belum terhubung dengan schema validasi (`zod`) maupun API.

## 2. Implementasi Nuxt Nitro API Proxy Layer
Untuk menjembatani komunikasi Vue dengan Go Backend dan menyisipkan JWT Token dengan aman, telah dibuat endpoint proxy di sisi server Nuxt:
- `[NEW]` `client/server/api/books/index.get.ts` — Mengambil daftar buku (termasuk query parameters untuk pagination, search, dan filter kategori).
- `[NEW]` `client/server/api/books/[id].get.ts` — Mengambil detail buku spesifik berdasarkan ID.
- `[NEW]` `client/server/api/books/index.post.ts` — Menyisipkan _Authorization header_ dari cookie session untuk membuat buku baru.
- `[NEW]` `client/server/api/books/[id].patch.ts` — Menyisipkan _Authorization header_ untuk memperbarui data buku.
- `[NEW]` `client/server/api/books/[id].delete.ts` — Menyisipkan _Authorization header_ untuk menghapus buku.
- `[NEW]` `client/server/api/categories/index.get.ts` — Mengambil daftar kategori buku yang akan digunakan untuk dropdown di form.

## 3. Implementasi Composables (State Management)
Telah diimplementasikan composable menggunakan `@tanstack/vue-query` untuk mengelola state dan cache request API:
- `[MODIFY]` `client/app/composables/useBooks.ts` — Menyediakan `useBooksList`, `useBookDetail`, `createBookMutation`, `updateBookMutation`, dan `deleteBookMutation`. Termasuk penanganan otomatis untuk _cache invalidation_ (refresh data) dan memunculkan toast notifikasi (berhasil/gagal).
- `[NEW]` `client/shared/types/categories.ts` & `client/app/composables/useCategories.ts` — Menyediakan tipe data dan fungsi `useCategoriesList` untuk kebutuhan form.

## 4. Implementasi Frontend UI Pages
Seluruh antarmuka admin untuk buku telah dibangun menggunakan Nuxt UI v4:
- `[MODIFY]` `client/app/pages/admin/buku/index.vue`
  - Menampilkan `table` daftar buku secara dinamis.
  - Fitur pencarian (_debounced search_) dan filter dropdown kategori.
  - Navigasi Pagination.
  - Tombol aksi Edit dan Hapus, dilengkapi dengan modal konfirmasi penghapusan (_Delete Confirmation Modal_).
- `[NEW]` `client/app/pages/admin/buku/create.vue`
  - Halaman untuk menambahkan buku baru.
  - Terintegrasi dengan `<UForm>` dan `createBookSchema` (Zod) untuk validasi di sisi klien.
  - Dropdown kategori dimuat secara dinamis melalui API backend.
- `[NEW]` `client/app/pages/admin/buku/[id]/edit.vue`
  - Halaman untuk mengedit buku.
  - Secara otomatis memuat data eksisting ke dalam form (`state` terisi dari hasil fetching).
  - Validasi form menggunakan `updateBookSchema`.

## 5. Perbaikan Bug & Verifikasi
- Melakukan perbaikan _type checking_ (TypeScript) pada halaman `index.vue`, yaitu menghapus atribut `ui` yang tidak valid pada komponen `UPagination` dan mengganti penggunaan composable `refDebounced` yang tidak dikenali dengan implementasi `setTimeout` standar agar tidak menimbulkan error saat di-_build_.
- Melakukan validasi kode menyeluruh dengan menjalankan `npx nuxi typecheck` dimana tidak ditemukan lagi _error_ pada modul yang baru saja dibangun.
- Menjalankan _development server_ (`npm run dev`) untuk memastikan aplikasi dapat dikompilasi dengan lancar.

## Kesimpulan
Seluruh fungsionalitas utama untuk modul "Manajemen Buku" di sisi Admin (Frontend) telah berhasil diimplementasikan sepenuhnya sesuai dengan schema data dan alur otorisasi (JWT) yang diminta oleh Backend Go, tanpa mengubah satu baris pun kode pada sistem Backend.

## 6. Implementasi PDF Upload & AI Background Embedding
Sebagai kelanjutan dari fitur manajemen buku, sistem telah di-upgrade dengan kapabilitas AI:
- **Backend Go**:
  - Menambahkan field `file_url` pada entitas dan DTO `Book`.
  - Mengintegrasikan ImageKit SDK v2 untuk menangani proses upload file ke CDN ImageKit secara aman.
  - Membuat endpoint `POST /api/v1/uploads` dengan middleware admin dan otentikasi.
- **Frontend Proxy & UI**:
  - Membuat Proxy server `POST /api/upload` di Nuxt Nitro untuk meneruskan file multipart/form-data.
  - Memperbarui halaman `create.vue` dan `[id]/edit.vue` untuk memunculkan input upload file PDF dinamis saat flag `is_digital_available` aktif. Menampilkan juga indikator proses unggahan.
- **AI RAG Pipeline**:
  - Membuat worker endpoint di Nuxt Nitro `POST /api/ai/embed.post.ts`.
  - Mengimplementasikan alur ekstraksi teks dari PDF menggunakan `pdf-parse`, _chunking_ dengan `RecursiveCharacterTextSplitter`, serta vektor _embedding_ melalui transformer lokal (`@huggingface/transformers`).
  - Menyimpan _knowledge vector_ tersebut ke Pinecone secara batch (v8 SDK format: `{ records: vectors }`).
  - Proses berjalan otomatis dan efisien di _background layer_ (melalui IIFE asynchronous) saat admin menyimpan buku yang tersedia dalam bentuk digital dan memiliki file digital.
  - Memperbaiki tipe dan validasi TS pada model chat/embedding lama (`chat.post.ts`).
- **Validasi Keseluruhan**:
  - Backend berhasil di-_build_ (`go build`).
  - Klien Nuxt lulus verifikasi _typecheck_ (`npx nuxi typecheck`) secara penuh tanpa error pada tipe _Blob_ dan FormData.

Kesimpulan akhir: Sistem RAG Literasiku kini terhubung penuh dari proses upload file di admin, penyimpanan di ImageKit, hingga *auto-indexing* vektor dokumen ke Pinecone.
