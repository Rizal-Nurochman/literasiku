# Konklusi Proyek — Literasiku

## Digital Library with AI Agent

---

## 1. Ringkasan Proyek

**Literasiku** adalah Sistem Informasi Perpustakaan Digital Berbasis Web yang mengintegrasikan manajemen perpustakaan konvensional (buku fisik) dengan akses buku digital dan AI Agent chatbot ("Lixi"). Proyek ini mengadopsi arsitektur **BFF (Backend for Frontend)** dengan Nuxt 4 sebagai frontend/server-side rendering dan Go/Gin sebagai REST API backend, didukung PostgreSQL sebagai database utama.

---

## 2. Arsitektur Sistem

### 2.1. Three-Tier dengan BFF Pattern

```
Browser → Nuxt 4 (SSR + BFF Proxy) → Go/Gin API → PostgreSQL
                              ↕
                     AI Layer (Pinecone + HF + LLM)
```

| Layer | Teknologi | Peran |
|-------|-----------|-------|
| **Presentation** | Nuxt 4, Vue 3, Nuxt UI v4, Tailwind CSS v4 | SSR, routing, komponen UI, state management (Vue Query) |
| **BFF** | Nuxt Server Routes (`server/api/*`) | Validasi Zod, proxy ke Go API, auth cookie, SSE streaming |
| **Backend API** | Go 1.25, Gin Framework, GORM | Business logic, database operations, JWT auth |
| **Database** | PostgreSQL 15 | Data utama (users, books, loans, files, categories) |
| **AI Pipeline** | Hugging Face, Pinecone, Flaz API (LLM) | Embedding, vector search, RAG, streaming chat |
| **File Storage** | ImageKit CDN | PDF digital books, asset delivery |

### 2.2. Alur Data End-to-End

**Flow umum:** Client → Nuxt BFF (validasi Zod + cookie session) → Go API (middleware JWT → handler → service → repository) → PostgreSQL

Semua komunikasi frontend ke backend **wajib** melalui Nuxt BFF — tidak ada akses langsung ke Go API dari browser. Pola ini memberikan:
- **Security**: Backend URL tidak terekspos, internal API key untuk BFF→Go
- **Dual Validation**: Zod di client (UX) + Zod di BFF (security) + Gin binding di Go
- **Session Management**: Cookie `literasiku_session` dikelola di BFF

---

## 3. Domain & Use Case Lengkap

### 3.1. Authentication & Authorization

| Use Case | Actor | Endpoint | Middleware |
|----------|-------|----------|------------|
| Register | Publik | `POST /auth/register` | Public |
| Login | Publik | `POST /auth/login` | Public |
| Logout | USER, ADMIN | `POST /auth/logout` | JWT |

**Mekanisme Session:**
- Login → Go generate JWT (HS256, claims: `user_id`, `role`) → Nuxt set cookie `literasiku_session` + localStorage `literasiku_user`
- Subsequent requests → BFF baca cookie → forward sebagai `Authorization: Bearer` ke Go
- Middleware global `auth.global.ts` proteksi route `/dashboard/*` dan `/admin/*`
- Layout `admin.vue` tambahan guard role `ADMIN`

### 3.2. Manajemen Buku (Admin)

| Use Case | Endpoint | Validasi Kunci |
|----------|----------|----------------|
| List Buku | `GET /books` | Public (pagination, search, filter kategori) |
| Detail Buku | `GET /books/:id` | Public |
| Create Buku | `POST /books` | Admin, ISBN unique, kategori exist |
| Update Buku | `PATCH /books/:id` | Admin, ISBN unique exclude self |
| Delete Buku | `DELETE /books/:id` | Admin (soft delete via GORM) |

**Side-effect saat create/update buku digital:**
1. Upload PDF → ImageKit (via `POST /api/uploads`) → return URL
2. Simpan `file_url` di tabel `books`
3. Fire-and-forget `POST /api/ai/embed` untuk RAG embedding ke Pinecone

### 3.3. Manajemen Kategori (Admin)

CRUD terpisah dengan endpoint `GET/POST/PATCH/DELETE /categories`. Kategori wajib ada sebelum buku dibuat (foreign key `category_id`).

### 3.4. Manajemen Anggota (Admin)

| Use Case | Endpoint | Notes |
|----------|----------|-------|
| List Anggota | `GET /users` | Search by name/email/membership, filter role |
| Edit Anggota | `PATCH /users/:id` | Update profile, status (ACTIVE/INACTIVE/BLOCKED) |
| Hapus Anggota | `DELETE /users/:id` | Soft delete, FK constraint jika punya loans |

### 3.5. Peminjaman Buku Fisik (Anggota → Admin)

**Flow:** Anggota ajukan → stok cek (`physical_stock > 0`) → loan dibuat (`status: BORROWED`) → stok dikurangi

| Use Case | Actor | Endpoint |
|----------|-------|----------|
| Pinjam Fisik | USER | `POST /loans/physical` |
| Riwayat Saya | USER | `GET /loans/physical/my` |
| List Semua | ADMIN | `GET /loans/physical` |
| Kembalikan | ADMIN | `PATCH /loans/physical/:id/return` |
| Bayar Denda | ADMIN | `PATCH /loans/physical/:id/pay-fine` |

**Aturan Bisnis:**
- Due date: default 7 hari
- Stok: dikurangi saat pinjam (`physical_stock--`), dikembalikan saat return (`physical_stock++`)
- Denda: `overdueDays * 1000` per hari (hitung otomatis saat return)
- Validasi: buku exist → stok > 0 → tidak ada pinjaman aktif untuk buku yang sama

### 3.6. Peminjaman Buku Digital (Anggota)

**Flow:** Anggota ajukan → cek `is_digital_available` → cek `file_url` atau `files` table → cek duplikat akses aktif → loan dibuat (`access_status: ACTIVE`)

| Use Case | Actor | Endpoint |
|----------|-------|----------|
| Pinjam Digital | USER | `POST /loans/digital` |
| Riwayat Saya | USER | `GET /loans/digital/my` |
| List Semua | ADMIN | `GET /loans/digital` |
| Cek Akses | USER | `GET /loans/digital/access/:book_id` |
| Revoke | ADMIN | `PATCH /loans/digital/:id/revoke` |

**Aturan Bisnis:**
- Due date: default 7 hari, max 30 hari
- **Tidak ada batas peminjam simultan** — tidak mengurangi stok
- Auto-expire saat `end_date < NOW()` (dicek di `CheckAccess`)
- Validasi: digital tersedia → file exist (`file_url` atau `files` table) → belum punya akses aktif

### 3.7. Baca Buku Digital (Anggota)

**Flow:** Buka reader → cek akses (`GET /loans/digital/access/:book_id`) → load PDF dari ImageKit CDN (langsung, tidak via BFF)

**Sumber PDF (fallback chain):**
```
book.file_url (tabel books) ?? files[0].file_path (tabel files) ?? null
```

### 3.8. AI Chatbot Lixi

| Use Case | Endpoint | Teknologi |
|----------|----------|-----------|
| Agent Chat | `POST /api/ai/agent` | SSE streaming, tool calling |
| Simple RAG | `POST /api/ai/chat` | Non-streaming, book-specific |
| Embedding | `POST /api/ai/embed` | Background, fire-and-forget |

**Tools yang tersedia:**
| Tool | Role | Fungsi |
|------|------|--------|
| `list_books` | USER, ADMIN | Cari katalog buku via Go API |
| `search_book_content` | USER, ADMIN | RAG semantic search via Pinecone |
| `my_loans` | USER | Cek peminjaman sendiri |
| `all_loans` | ADMIN | Semua peminjaman |
| `list_members` | ADMIN | Daftar anggota |

### 3.9. Laporan & Statistik (Admin)

4 data source paralel: total buku (limit 1), total anggota (limit 1), semua loan fisik (limit 200), semua loan digital (limit 200). Agregasi client-side dengan computed properties. Ekspor CSV client-side.

---

## 4. Struktur Modular

### 4.1. Backend (Go) — Pattern per Modul

```
modules/<domain>/
├── dto/<domain>_dto.go          # Request/response structs
├── handler/<domain>_handler.go  # Gin HTTP handlers
├── service/<domain>_service.go  # Business logic
└── repository/<domain>_repository.go  # GORM database queries
```

**Modul:** auth, book, category, user, physical_loan, digital_loan, file, upload, health

**Cross-module dependencies:**
- `digital_loan/service` → book repository (find book), file repository (check PDF)
- `physical_loan/service` → book repository (find book, update stock)
- `file/service` → book repository (validate book exists)
- `book/service` → category repository (validate category)
- `auth/service` → JWT service (token generation)

### 4.2. Frontend (Nuxt) — Pattern per Halaman

```
pages/<domain>/<page>.vue  →  composables/  →  server/api/<domain>/  →  Go API
```

**Shared layer** (`client/shared/`): Zod schemas + TypeScript types — digunakan bersama oleh client dan BFF untuk validasi konsisten.

---

## 5. Validasi Bertahap (Defense in Depth)

Setiap input melewati hingga 3 lapis validasi:

| Layer | Tools | Lokasi |
|-------|-------|--------|
| 1. Client-side UX | Zod schema + Nuxt UI `UForm` | `components/*.vue` |
| 2. BFF Security | `readValidatedBody` Zod | `server/api/*.ts` |
| 3. Go Backend | Gin `ShouldBindJSON` + binding tags | `handler/*.go` |

---

## 6. Error Handling Architecture

### Frontend
- **Mutation errors**: `onError` callback → toast dengan `err?.data?.message || err.message`
- **Query errors**: Vue Query `isError` state → komponen alert
- **Network errors**: `apiCall` utility → `createError` Nuxt → FE catch

### Backend (Go)
- **Response envelope**: Semua response Go menggunakan `utils.BuildResponseSuccess` / `BuildResponseFailed` dengan format `{ status, message, data/error }`
- **Error mapping**: Handler mapping service error ke HTTP status code (400/401/403/404/409/500)
- **Middleware chain**: Authenticate (JWT) → AdminOnly (RBAC) → Handler

### BFF (Nuxt Server Routes)
- **`apiCall`**: Tuple pattern `[error, res]` — safe call tanpa try-catch
- **`throwError`**: Mapping Go response error ke `createError` Nuxt

---

## 7. Keamanan

| Aspek | Implementasi |
|-------|-------------|
| **Password** | bcrypt (`DefaultCost`) via `helpers/password.go` |
| **JWT** | HS256, claims: `user_id`, `role`, `iss`, `iat` — tanpa expiry |
| **Session** | Cookie `literasiku_session` (sameSite: lax), localStorage cache |
| **RBAC** | Middleware `AdminOnly` di route admin; Layout `admin.vue` guard |
| **Route Protection** | `auth.global.ts` middleware untuk `/dashboard/*` dan `/admin/*` |
| **Credential Abstraction** | Login error `ErrInvalidCredentials` tidak membedakan email not found vs wrong password |
| **BFF Isolation** | Go API tidak terekspos ke client; internal API key untuk BFF→Go |

---

## 8. Data Model (Entity Relationships)

```
users 1──* physical_loans
users 1──* digital_loans
users 1──* chat_history

books 1──* physical_loans
books 1──* digital_loans
books 1──* files
books 1──* chat_history
books *──1 categories

digital_loans 1──* chat_history
```

---

## 9. Key Technical Decisions & Trade-offs

| Keputusan | Alasan | Trade-off |
|-----------|--------|-----------|
| **BFF Pattern** | Security, session management terpusat, validasi ganda | Latency tambahan 1 hop, kompleksitas deployment |
| **Go + Gin** | Performance, type safety, concurrency model | Development speed lebih lambat dari Node.js |
| **Nuxt 4 SSR** | SEO, initial load performance | Lebih kompleks dari SPA murni |
| **JWT tanpa expiry** | Sederhana, tanpa refresh token mechanism | Tidak aman untuk production — perlu refresh token |
| **Vue Query** | Cache invalidation otomatis, SSR hydration | Bundle size, learning curve |
| **ImageKit CDN** | PDF delivery tanpa beban server, transformasi gambar | External dependency, biaya |
| **Fire-and-forget embed** | Tidak blocking create/update buku | Error embedding tidak terlihat user |
| **Loan data limit 200** | Sederhana, tanpa infinite scroll | Tidak scale untuk perpustakaan besar |
| **`file_url` + `files` table** | Dual source of truth untuk file digital | Inkonsistensi data, perlu fallback logic |

---

## 10. Status & Celah (Gap Analysis)

### ✅ Sudah diimplementasi
- Auth (register, login, logout) dengan JWT + bcrypt
- CRUD buku + kategori + user (admin)
- Peminjaman fisik (pinjam, return, denda)
- Peminjaman digital (pinjam, revoke, check access)
- PDF reader dengan verifikasi akses
- AI Chatbot Lixi (agent + simple RAG + embedding)
- Laporan & statistik admin
- Upload file ke ImageKit
- Dokumentasi sequence diagram 16 use case

### ❌ Belum diimplementasi / Celah
1. **Testing** — Tidak ada automated test (backend Go maupun frontend Vue)
2. **JWT expiry & refresh token** — Token tidak memiliki expiry, tidak ada refresh mechanism
3. **Auto-generate membership_number** — Nomor anggota hanya diisi via seed, tidak auto-generate saat registrasi
4. **Self-delete protection** — Admin bisa menghapus dirinya sendiri
5. **Infinite scroll / server-side pagination** — Limit 200 untuk data loan, tidak scale
6. **Production deployment** — Belum ada CI/CD, container orchestration production, atau monitoring
7. **Error embedding feedback** — Fire-and-forget embed tidak memberikan feedback jika gagal
8. **Role edit protection** — Tidak ada proteksi jika admin mengubah role-nya sendiri
9. **Mobile responsiveness** — Belum diuji secara menyeluruh
10. **File orphan cleanup** — Hapus buku tidak menghapus file PDF dari ImageKit

---

## 11. Kesimpulan Akhir

Literasiku adalah aplikasi perpustakaan digital **full-stack** yang mengintegrasikan:

- **Manajemen perpustakaan konvensional** — CRUD buku/kategori/anggota, peminjaman fisik dengan denda
- **Akses digital modern** — Peminjaman digital, PDF viewer, auto-expire
- **AI Agent cerdas** — Chatbot Lixi dengan RAG, tool calling, dan SSE streaming

Arsitektur **BFF + Go API** memberikan pemisahan concern yang bersih, keamanan berlapis, dan performance backend yang baik. Pola **handler → service → repository** di Go dan **page → composable → BFF** di Nuxt membuat codebase terstruktur dan mudah dimaintain.

Dokumentasi **16 sequence diagram** untuk setiap use case memberikan gambaran end-to-end yang lengkap, mencakup precondition, postcondition, breakdown per boundary, kontrak API, error handling, dan file reference — memudahkan developer baru untuk memahami sistem secara menyeluruh.

Proyek ini siap untuk langkah selanjutnya: **penambahan automated testing, production deployment, dan penyempurnaan fitur keamanan** (JWT expiry, refresh token, self-delete protection).
