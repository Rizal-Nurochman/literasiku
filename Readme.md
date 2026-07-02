# Literasiku - Digital Library with AI Agent

![Nuxt](https://img.shields.io/badge/Nuxt-Frontend-00DC82?logo=nuxt&logoColor=white)
![Go](https://img.shields.io/badge/Go-Backend-00ADD8?logo=go&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![AI Agent](https://img.shields.io/badge/AI-Agent-111827)
![Digital Library](https://img.shields.io/badge/Digital-Library-2563EB)

**Literasiku** adalah aplikasi **Sistem Informasi Perpustakaan Digital Berbasis Web** dengan dukungan **AI Agent** untuk membantu pengelolaan perpustakaan modern, peminjaman buku fisik, peminjaman buku digital, pembacaan PDF internal, dan chatbot pembaca buku.

## Aktor & Use Case

### Admin
- Login
- Kelola Data Buku (termasuk Kelola Kategori, Unggah File PDF, Kelola Stok Fisik)
- Kelola Data Anggota (edit, nonaktifkan, hapus — create via registrasi publik)
- Catat Pengembalian Buku Fisik (termasuk Hitung Denda Keterlambatan)
- Lihat Riwayat dan Laporan Peminjaman

### Anggota
- Login & Registrasi
- Cari dan Lihat Katalog Buku
- Ajukan Peminjaman Buku Fisik
- Ajukan Peminjaman Buku Digital
- Baca Buku Digital (termasuk Bertanya ke Chatbot)
- Lihat Riwayat Peminjaman Saya

### Chatbot AI (Lixi)
- Bertanya ke Chatbot (extend Baca Buku Digital & Pinjam Buku Digital)
- Agentic tool calling: pencarian katalog, RAG konten buku, data peminjaman real-time

## Fitur Utama

### Authentication & Authorization
- Login/register dengan JWT token (`literasiku_session` cookie)
- Role-based access control (USER / ADMIN)
- Proteksi halaman berdasarkan role via middleware

### Manajemen Buku (Admin)
- CRUD buku dengan field: judul, penulis, penerbit, tahun terbit, ISBN, kategori, stok fisik, status digital
- Upload file PDF ke ImageKit CDN (sub-flow dari create/edit)
- Kelola kategori buku (CRUD terpisah)
- Hapus buku (soft-delete / hard-delete)

### Katalog Online (Anggota)
- Grid buku dengan cover image
- Search by judul/penulis/ISBN (real-time debounce)
- Filter kategori (dropdown multiselect)
- Filter ketersediaan (fisik/digital) — client-side
- Pagination (server-side offset/limit)

### Peminjaman Buku Fisik
- Validasi: buku exist → stok > 0 → tidak ada pinjaman aktif
- Stok dikurangi saat peminjaman (`PhysicalStock--`)
- Due date: default 7 hari
- Pengembalian oleh admin dengan kalkulasi denda otomatis
- Denda: `overdueDays * 1000` per hari
- Stok dikembalikan (`PhysicalStock++`) setelah return

### Peminjaman Buku Digital
- Validasi: digital tersedia → file PDF exist → tidak ada akses aktif
- Akses terbatas (default 7 hari), tidak ada batas peminjam simultan
- Tidak mengurangi stok
- Admin dapat revoke akses digital
- Auto-expire saat melewati end_date (di-check saat akses reader)

### PDF Viewer
- PDF di-load langsung dari ImageKit CDN (tidak via BFF/API)
- Verifikasi akses via `GET /api/v1/loans/digital/access/:book_id` (parallel)
- Auto-expire: jika `end_date < NOW()` → status `EXPIRED`, akses ditolak
- Vue-PDF-Embed viewer

### AI Chatbot (Lixi)
- Panel slideover di dashboard (floating button sparkles)
- SSE streaming response
- Agentic tool calling:
  - `list_books` — cari katalog buku
  - `search_book_content` — RAG pencarian semantik konten buku (Pinecone)
  - `my_loans` — peminjaman user saat ini
  - `all_loans` — semua peminjaman (admin)
  - `list_members` — daftar anggota (admin)
- Embedding via Hugging Face, vector search di Pinecone
- LLM: Flaz API (OpenAI-compatible)

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                   Client (Nuxt)                      │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐  │
│  │ Dashboard │ │ Catalog  │ │ Reader + AI Chat    │  │
│  │ (Admin)   │ │ (Member) │ │ (PDF + Lixi Agent)  │  │
│  └────┬─────┘ └────┬─────┘ └──────────┬──────────┘  │
│       │            │                  │              │
│       └────────────┼──────────────────┘              │
│                    │  Nuxt BFF (server/api/*)         │
│                    │  + Fetch langsung CDN            │
└────────────────────┼──────────────────────────────────┘
                     │ HTTP REST
                     ▼
┌─────────────────────────────────────────────────────┐
│               Backend (Go + GIN)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐│
│  │  Auth    │ │  Book    │ │  Physical/Digital     ││
│  │  Module  │ │  Module  │ │  Loan Module          ││
│  └──────────┘ └──────────┘ └──────────────────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐│
│  │  User    │ │  File    │ │  Embed + AI (future) ││
│  │  Module  │ │  Module  │ │                      ││
│  └──────────┘ └──────────┘ └──────────────────────┘│
└────────────────────┬──────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   ┌────────────┐      ┌──────────────┐
   │ PostgreSQL  │      │  ImageKit    │
   │  Database   │      │  CDN (PDF)   │
   └────────────┘      └──────────────┘

   AI Pipeline:
   ┌────────┐   ┌──────────┐   ┌────────┐   ┌────────┐
   │ Hugging│──>│ Pinecone │──>│  Flaz  │──>│  SSE   │
   │ Face   │   │ (Vector) │   │ (LLM)  │   │ Stream │
   └────────┘   └──────────┘   └────────┘   └────────┘
```

## Tech Stack

| Area | Teknologi |
|---|---|
| Frontend | Nuxt 4, Nuxt UI v3, Tailwind CSS v4, TypeScript, Vue 3 |
| Backend | Go 1.x, GIN Framework, REST API |
| Database | PostgreSQL |
| PDF Storage | ImageKit CDN |
| AI / Chatbot | Flaz API (OpenAI-compatible), Hugging Face Embedding, Pinecone Vector DB |
| Tools | Git, GitHub, VS Code |

## Struktur Folder

```
.
├── client/                     # Nuxt frontend
│   ├── app/
│   │   ├── assets/css/
│   │   ├── components/         # Vue components (dashboard, ui, etc.)
│   │   ├── composables/        # useLoans.ts, useBooks.ts, etc.
│   │   ├── layouts/            # dashboard.vue, default.vue
│   │   ├── pages/              # Route pages
│   │   │   ├── admin/          # Admin pages (anggota, buku, kategori, peminjaman, laporan)
│   │   │   ├── auth/           # Login, Register
│   │   │   └── dashboard/      # Member pages (katalog, riwayat, baca)
│   │   ├── server/             # Nuxt BFF (api/* handlers)
│   │   ├── app.config.ts
│   │   └── app.vue
│   ├── public/                 # Static assets
│   ├── nuxt.config.ts
│   └── package.json
├── server/                     # Go backend
│   ├── cmd/api/
│   │   └── main.go
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/               # Login, Register, Logout
│   │   ├── user/               # User CRUD (admin)
│   │   ├── book/               # Book CRUD (admin) + public search
│   │   ├── category/           # Category CRUD (admin) + public list
│   │   ├── file/               # Book file CRUD
│   │   ├── upload/             # ImageKit upload handler
│   │   ├── physical_loan/      # Borrow, Return, Pay Fine
│   │   └── digital_loan/       # Borrow, Revoke, Check Access
│   ├── router/
│   │   └── router.go           # All route definitions
│   └── go.mod
├── docs/
│   └── sequence/               # Sequence diagram docs (use case per file)
│       ├── login.md
│       ├── register.md
│       ├── admin/
│       │   ├── kelola_anggota.md
│       │   ├── laporan.md
│       │   └── kelola_buku/
│       │       ├── kelola_buku.md
│       │       ├── include/
│       │       │   └── kelola_kategori.md
│       │       └── extends/
│       │           ├── file_upload.md
│       │           ├── catat_pengembalian.md
│       │           └── kelola_peminjaman.md
│       └── anggota/
│           ├── cari_katalog.md
│           ├── pinjam_fisik.md
│           ├── pinjam_digital.md
│           ├── baca_digital.md
│           │   └── extends/
│           │       └── ai_chat.md
│           └── riwayat_peminjaman.md
└── Readme.md
```

## API Endpoints (Implementasi Aktual)

Semua endpoint berada di bawah prefix `/api/v1`.

### Auth (public)
| Method | Path | Handler | Auth |
|---|---|---|---|
| POST | `/auth/register` | `AuthHandler.Register` | Public |
| POST | `/auth/login` | `AuthHandler.Login` | Public |
| POST | `/auth/logout` | `AuthHandler.Logout` | JWT |

### Books
| Method | Path | Handler | Role |
|---|---|---|---|
| GET | `/books` | `BookHandler.GetAll` | Public |
| GET | `/books/:id` | `BookHandler.GetByID` | Public |
| POST | `/books` | `BookHandler.Create` | Admin |
| PATCH | `/books/:id` | `BookHandler.Update` | Admin |
| DELETE | `/books/:id` | `BookHandler.Delete` | Admin |

### Categories
| Method | Path | Handler | Role |
|---|---|---|---|
| GET | `/categories` | `CategoryHandler.GetAll` | Public |
| GET | `/categories/:id` | `CategoryHandler.GetByID` | Public |
| POST | `/categories` | `CategoryHandler.Create` | Admin |
| PATCH | `/categories/:id` | `CategoryHandler.Update` | Admin |
| DELETE | `/categories/:id` | `CategoryHandler.Delete` | Admin |

### Files (Book PDF metadata)
| Method | Path | Handler | Role |
|---|---|---|---|
| GET | `/files/book/:book_id` | `FileHandler.GetByBookID` | JWT |
| GET | `/files/:id` | `FileHandler.GetByID` | JWT |
| POST | `/files` | `FileHandler.Create` | Admin |
| PATCH | `/files/:id` | `FileHandler.Update` | Admin |
| DELETE | `/files/:id` | `FileHandler.Delete` | Admin |

### Users
| Method | Path | Handler | Role |
|---|---|---|---|
| GET | `/users/me` | `UserHandler.Me` | JWT |
| PATCH | `/users/me` | `UserHandler.UpdateMe` | JWT |
| GET | `/users` | `UserHandler.GetAll` | Admin |
| GET | `/users/:id` | `UserHandler.GetByID` | Admin |
| PATCH | `/users/:id` | `UserHandler.Update` | Admin |
| DELETE | `/users/:id` | `UserHandler.Delete` | Admin |

### Physical Loans
| Method | Path | Handler | Role |
|---|---|---|---|
| POST | `/loans/physical` | `PhysicalLoanHandler.Borrow` | JWT |
| GET | `/loans/physical/my` | `PhysicalLoanHandler.GetMyLoans` | JWT |
| GET | `/loans/physical/:id` | `PhysicalLoanHandler.GetByID` | JWT |
| GET | `/loans/physical` | `PhysicalLoanHandler.GetAll` | Admin |
| PATCH | `/loans/physical/:id/return` | `PhysicalLoanHandler.Return` | Admin |
| PATCH | `/loans/physical/:id/pay-fine` | `PhysicalLoanHandler.PayFine` | Admin |

### Digital Loans
| Method | Path | Handler | Role |
|---|---|---|---|
| POST | `/loans/digital` | `DigitalLoanHandler.Borrow` | JWT |
| GET | `/loans/digital/my` | `DigitalLoanHandler.GetMyLoans` | JWT |
| GET | `/loans/digital/:id` | `DigitalLoanHandler.GetByID` | JWT |
| GET | `/loans/digital/access/:book_id` | `DigitalLoanHandler.CheckAccess` | JWT |
| GET | `/loans/digital` | `DigitalLoanHandler.GetAll` | Admin |
| PATCH | `/loans/digital/:id/revoke` | `DigitalLoanHandler.Revoke` | Admin |

### Upload (ImageKit)
| Method | Path | Handler | Role |
|---|---|---|---|
| POST | `/uploads` | `UploadHandler.Upload` | Admin |

## Cara Menjalankan

### Frontend
```bash
cd client
pnpm install
pnpm dev
```

Frontend berjalan di `http://localhost:3000`.

### Backend
```bash
cd server
go mod tidy
go run ./cmd/api
```

Backend berjalan di `http://localhost:8080`.

### Quality Check
```bash
cd client
pnpm lint
pnpm typecheck
```

## Environment Variables

```env
APP_ENV=development
APP_PORT=8080
DATABASE_URL=postgres://postgres:postgres@localhost:5432/literasiku?sslmode=disable
JWT_SECRET=change-me
JWT_EXPIRES_IN=24h
IMAGEKIT_PUBLIC_KEY=your-key
IMAGEKIT_PRIVATE_KEY=your-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
AI_API_KEY=your-flaz-api-key
AI_MODEL=gpt-4o-mini
PINECONE_API_KEY=your-key
PINECONE_ENVIRONMENT=your-env
PINECONE_INDEX=literasiku
CLIENT_BASE_URL=http://localhost:3000
SERVER_BASE_URL=http://localhost:8080
```

## Status Project

```txt
✅ Frontend Nuxt: landing page, dashboard admin & anggota, katalog, reader PDF, AI chat
✅ Backend Go: auth, CRUD buku/kategori, user management, physical & digital loans
✅ API endpoints untuk semua use case utama
✅ Dokumentasi sequence diagram untuk setiap use case (docs/sequence/)
❌ Belum ada test otomatis (backend & frontend)
❌ Belum ada deployment production
```

## Tim Pengembang

Project ini dikembangkan sebagai aplikasi **Sistem Informasi Perpustakaan Digital Berbasis Web** dengan fokus pada pengelolaan perpustakaan modern, akses buku digital, dan AI Agent pembaca buku.

Aturan kontribusi:
- Gunakan branch terpisah untuk setiap fitur
- Format commit yang jelas
- Jangan commit file `.env`
- Pastikan lint dan typecheck frontend berjalan
- Pastikan backend dapat dijalankan tanpa error sebelum merge

## Lisensi

Lisensi akan ditentukan sesuai kebutuhan pengembangan dan distribusi aplikasi.
