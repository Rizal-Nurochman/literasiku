# Literasiku - Digital Library with AI Agent

![Nuxt](https://img.shields.io/badge/Nuxt-Frontend-00DC82?logo=nuxt&logoColor=white)
![Go](https://img.shields.io/badge/Go-Backend-00ADD8?logo=go&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![AI Agent](https://img.shields.io/badge/AI-Agent-111827)
![Digital Library](https://img.shields.io/badge/Digital-Library-2563EB)

**Literasiku** adalah aplikasi **Sistem Informasi Perpustakaan Digital Berbasis Web** dengan dukungan **AI Agent** untuk membantu pengelolaan perpustakaan modern, peminjaman buku fisik, peminjaman buku digital, pembacaan PDF internal, dan chatbot pembaca buku.

Tagline: **Digital Library with AI Agent**

## Deskripsi Project

Literasiku adalah aplikasi perpustakaan digital berbasis web yang membantu admin mengelola koleksi buku, anggota, transaksi peminjaman fisik, peminjaman digital, akses PDF, dan membantu anggota membaca serta memahami buku melalui fitur AI Agent atau chatbot pembaca buku.

Project ini bukan sekadar template Nuxt. Project ini dikembangkan sebagai sistem informasi perpustakaan yang terintegrasi dari sisi frontend, backend, database, storage file PDF, hingga layanan AI untuk membaca konteks isi buku digital.

## Tujuan Project

Tujuan utama Literasiku adalah mengembangkan aplikasi sistem informasi perpustakaan berbasis web yang dapat menggantikan proses perpustakaan konvensional menjadi lebih terintegrasi, efisien, dan mudah diakses melalui browser.

Sistem ini dirancang untuk mendukung:

- Katalog buku online.
- Peminjaman buku fisik.
- Peminjaman buku digital.
- PDF viewer internal.
- Hak akses digital terbatas.
- Chatbot AI yang menjawab pertanyaan berdasarkan isi buku yang sedang dibaca.
- Dashboard admin untuk mengelola buku, anggota, transaksi, stok, denda, dan laporan.

## Latar Belakang

Perpustakaan konvensional masih memiliki beberapa keterbatasan dalam proses operasional sehari-hari. Anggota sering kali harus datang langsung untuk mencari buku, proses peminjaman dan pengembalian masih dilakukan secara manual, pengecekan stok buku belum real-time, akses buku digital belum terkontrol, dan pengguna dapat mengalami kesulitan memahami isi buku tanpa bantuan tambahan.

Literasiku dibuat sebagai solusi berbasis web agar:

- Anggota dapat mencari katalog buku secara online.
- Anggota dapat mengajukan peminjaman buku fisik.
- Anggota dapat meminjam buku digital dan membaca PDF langsung di website.
- Admin dapat mengelola data buku, anggota, transaksi, stok, denda, dan laporan.
- Chatbot AI dapat membantu anggota memahami isi buku digital.

## Fitur Utama

### Authentication & Authorization

- Login admin.
- Login anggota.
- Role-based access control.
- Proteksi halaman berdasarkan role.

### Manajemen Buku

- Tambah buku.
- Edit buku.
- Hapus atau nonaktifkan buku.
- Lihat daftar buku.
- Kelola informasi bibliografis:
  - Judul.
  - Penulis.
  - Penerbit.
  - Tahun terbit.
  - ISBN.
  - Kategori.
  - Stok fisik.
  - Status digital.

### Manajemen Anggota

- Tambah anggota.
- Edit anggota.
- Nonaktifkan anggota.
- Generate nomor anggota.
- Lihat riwayat peminjaman anggota.

### Katalog Online

- Lihat daftar buku.
- Cari buku berdasarkan judul, penulis, atau kategori.
- Lihat status stok fisik.
- Lihat status ketersediaan digital.

### Peminjaman Buku Fisik

- Anggota mengajukan peminjaman fisik.
- Sistem memvalidasi stok buku.
- Sistem memvalidasi status anggota.
- Sistem memvalidasi tunggakan denda.
- Sistem mencatat tanggal pinjam dan jatuh tempo.
- Sistem mengurangi stok buku.
- Admin mencatat pengembalian.
- Sistem menghitung denda keterlambatan.
- Sistem mengembalikan stok buku setelah dikembalikan.

### Peminjaman Buku Digital

- Anggota mengajukan peminjaman digital.
- Sistem memvalidasi ketersediaan file PDF.
- Sistem memberikan hak akses PDF selama masa peminjaman.
- Setelah masa peminjaman habis, akses PDF dicabut.
- File PDF tidak boleh diunduh langsung.

### PDF Viewer

- Anggota membaca buku digital langsung di website.
- PDF hanya ditampilkan jika anggota memiliki akses aktif.
- PDF viewer berada di halaman pembaca internal.

### AI Chatbot Pembaca Buku

- Chatbot hanya aktif di halaman pembaca PDF.
- Chatbot menjawab berdasarkan konteks buku yang sedang dibaca.
- Chatbot dapat membantu menjelaskan konsep, meringkas bagian tertentu, atau mencari informasi penting dari isi buku.
- Chatbot bukan chatbot umum untuk seluruh website.

## Aktor Sistem

### Admin

Admin memiliki hak akses penuh untuk:

- Login ke dashboard admin.
- Mengelola data buku.
- Mengelola koleksi digital.
- Mengunggah file PDF buku.
- Mengelola data anggota.
- Memantau transaksi peminjaman.
- Mencatat pengembalian buku fisik.
- Melihat denda keterlambatan.
- Melihat laporan dan riwayat peminjaman.

### Anggota

Anggota memiliki hak akses terbatas untuk:

- Login ke sistem.
- Melihat katalog buku.
- Mencari buku berdasarkan judul, penulis, atau kategori.
- Melihat detail dan ketersediaan buku.
- Mengajukan peminjaman buku fisik.
- Mengajukan peminjaman buku digital.
- Membaca PDF melalui PDF viewer internal.
- Menggunakan chatbot pembaca buku.
- Melihat status dan riwayat peminjaman.

## Arsitektur Sistem

Literasiku menggunakan pendekatan **three-tier architecture** yang memisahkan presentation layer, business logic layer, dan data layer.

### Presentation Layer

Frontend menggunakan:

- Nuxt.js.
- Nuxt UI.
- Tailwind CSS.
- TypeScript.
- Vue Composition API.

### Business Logic Layer

Backend menggunakan:

- Go / Golang.
- GIN Framework.
- REST API.
- JWT Authentication.
- Role-based Middleware.

### Data Layer

Database menggunakan:

- PostgreSQL.

File dan AI support:

- File Storage untuk PDF.
- PDF Viewer Library.
- AI Chatbot Service.
- Vector Database opsional seperti Pinecone atau pgvector.
- Embedding model / NLP model untuk membaca isi buku.

## Tech Stack

| Area | Teknologi |
| --- | --- |
| Frontend | Nuxt.js, Nuxt UI, Tailwind CSS, TypeScript, Vue |
| Backend | Go, GIN Framework, REST API |
| Database | PostgreSQL |
| AI / Chatbot | AI API / LLM Provider, Embedding model, Vector database opsional |
| Tools | Git, GitHub, VS Code, Figma, Draw.io |

## Struktur Folder

Struktur repository saat ini:

```txt
.
├── client/
│   ├── app/
│   │   ├── assets/
│   │   │   └── css/
│   │   │       └── main.css
│   │   ├── components/
│   │   │   └── AppLogo.vue
│   │   ├── pages/
│   │   │   └── index.vue
│   │   ├── app.config.ts
│   │   └── app.vue
│   ├── public/
│   ├── nuxt.config.ts
│   ├── package.json
│   └── README.md
├── server/
│   └── go.mod
└── Readme.md
```

Struktur backend masih dapat dikembangkan menjadi:

```txt
server/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── config/
│   ├── database/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── books/
│   │   ├── members/
│   │   ├── physical-loans/
│   │   ├── digital-loans/
│   │   ├── pdf-access/
│   │   └── chatbot/
│   └── routes/
└── go.mod
```

## Workflow Sistem

### Workflow Login

```mermaid
flowchart TD
    A[User membuka aplikasi] --> B[Login sebagai Admin atau Anggota]
    B --> C[Sistem validasi kredensial]
    C --> D{Role valid?}
    D -->|Admin| E[Dashboard Admin]
    D -->|Anggota| F[Dashboard Anggota]
    D -->|Tidak valid| G[Tampilkan error login]
```

### Workflow Peminjaman Buku Fisik

```mermaid
flowchart TD
    A[Anggota login] --> B[Cari buku di katalog]
    B --> C[Pilih buku fisik]
    C --> D[Sistem cek stok]
    D --> E[Sistem cek status anggota dan denda]
    E --> F{Valid?}
    F -->|Ya| G[Catat transaksi peminjaman]
    G --> H[Kurangi stok buku]
    H --> I[Tampilkan status peminjaman aktif]
    F -->|Tidak| J[Tampilkan alasan gagal]
```

### Workflow Peminjaman Digital dan PDF Viewer

```mermaid
flowchart TD
    A[Anggota login] --> B[Cari buku digital]
    B --> C[Ajukan peminjaman digital]
    C --> D[Sistem cek status digital dan file PDF]
    D --> E{Valid?}
    E -->|Ya| F[Buat hak akses PDF]
    F --> G[Buka PDF Viewer]
    G --> H[Anggota membaca buku]
    H --> I[Anggota bertanya ke chatbot]
    I --> J[Chatbot menjawab berdasarkan konteks buku]
    E -->|Tidak| K[Tampilkan akses ditolak]
```

## Database Design

Entitas utama yang direncanakan:

- `users`
- `members`
- `books`
- `book_categories`
- `book_files`
- `physical_loans`
- `digital_loans`
- `fines`
- `pdf_access_logs`
- `chatbot_histories`

Contoh ERD sederhana:

```mermaid
erDiagram
    USERS {
        uuid id PK
        string name
        string email
        string password_hash
        string role
        datetime created_at
        datetime updated_at
    }

    MEMBERS {
        uuid id PK
        uuid user_id FK
        string member_number
        string identity_number
        string phone
        string address
        string status
    }

    BOOKS {
        uuid id PK
        string title
        string author
        string publisher
        int published_year
        string isbn
        int physical_stock
        boolean is_digital_available
        datetime created_at
        datetime updated_at
    }

    BOOK_FILES {
        uuid id PK
        uuid book_id FK
        string file_path
        string file_type
        int file_size
        datetime uploaded_at
    }

    PHYSICAL_LOANS {
        uuid id PK
        uuid member_id FK
        uuid book_id FK
        date borrowed_at
        date due_date
        date returned_at
        string status
        decimal fine_amount
    }

    DIGITAL_LOANS {
        uuid id PK
        uuid member_id FK
        uuid book_id FK
        datetime access_start
        datetime access_end
        string status
    }

    CHATBOT_HISTORIES {
        uuid id PK
        uuid member_id FK
        uuid book_id FK
        text question
        text answer
        datetime created_at
    }

    USERS ||--o| MEMBERS : has
    BOOKS ||--o{ BOOK_FILES : has
    MEMBERS ||--o{ PHYSICAL_LOANS : creates
    BOOKS ||--o{ PHYSICAL_LOANS : borrowed
    MEMBERS ||--o{ DIGITAL_LOANS : creates
    BOOKS ||--o{ DIGITAL_LOANS : accessed
    MEMBERS ||--o{ CHATBOT_HISTORIES : asks
    BOOKS ||--o{ CHATBOT_HISTORIES : context
```

## API Endpoint Plan

### Auth

```txt
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Admin - Books

```txt
GET    /api/admin/books
POST   /api/admin/books
GET    /api/admin/books/:id
PUT    /api/admin/books/:id
DELETE /api/admin/books/:id
POST   /api/admin/books/:id/pdf
```

### Admin - Members

```txt
GET    /api/admin/members
POST   /api/admin/members
GET    /api/admin/members/:id
PUT    /api/admin/members/:id
PATCH  /api/admin/members/:id/deactivate
GET    /api/admin/members/:id/loans
```

### Catalog

```txt
GET /api/catalog/books
GET /api/catalog/books/:id
```

### Physical Loans

```txt
POST /api/loans/physical
GET  /api/loans/physical/me
POST /api/admin/loans/physical/:id/return
```

### Digital Loans

```txt
POST /api/loans/digital
GET  /api/loans/digital/me
GET  /api/reader/books/:bookId/pdf
```

### Chatbot

```txt
POST /api/reader/books/:bookId/chat
GET  /api/reader/books/:bookId/chat/history
```

## Environment Variables

Contoh file `.env.example`:

```env
APP_ENV=development
APP_PORT=8080

DATABASE_URL=postgres://postgres:postgres@localhost:5432/literasiku?sslmode=disable

JWT_SECRET=change-me
JWT_EXPIRES_IN=24h

PDF_STORAGE_PATH=./storage/pdfs

AI_PROVIDER=openai
AI_API_KEY=your-api-key
AI_MODEL=gpt-4o-mini

VECTOR_DB_PROVIDER=pgvector
VECTOR_DB_URL=postgres://postgres:postgres@localhost:5432/literasiku?sslmode=disable

CLIENT_BASE_URL=http://localhost:3000
SERVER_BASE_URL=http://localhost:8080
```

## Cara Menjalankan Project

### Frontend

```bash
cd client
pnpm install
pnpm dev
```

Frontend Nuxt berjalan secara default di:

```txt
http://localhost:3000
```

### Backend

```bash
cd server
go mod tidy
go run ./cmd/api
```

Catatan: backend saat ini masih berada pada tahap awal. Struktur endpoint, database schema, middleware, dan business logic akan dikembangkan sesuai roadmap.

### Quality Check Frontend

```bash
cd client
pnpm lint
pnpm typecheck
```

## Roadmap Pengembangan

### Phase 1 - Project Foundation

- Setup Nuxt frontend.
- Setup Go module backend.
- Setup PostgreSQL.
- Setup struktur folder backend.
- Setup environment config.

### Phase 2 - Authentication

- Login admin.
- Login anggota.
- JWT middleware.
- Role-based access control.

### Phase 3 - Admin Dashboard

- CRUD buku.
- CRUD anggota.
- Upload PDF.
- Lihat transaksi.

### Phase 4 - Catalog & Borrowing

- Katalog buku.
- Search/filter buku.
- Peminjaman fisik.
- Pengembalian dan denda.

### Phase 5 - Digital Library

- Peminjaman digital.
- PDF viewer.
- Hak akses PDF terbatas.
- Auto-expired digital access.

### Phase 6 - AI Agent

- Ekstraksi teks PDF.
- Chunking isi buku.
- Embedding.
- Vector search.
- Chatbot berdasarkan konteks buku.
- Riwayat percakapan.

### Phase 7 - Finalization

- Testing.
- UI polish.
- Deployment.
- Dokumentasi API.
- Laporan final.

## Status Project Saat Ini

```txt
Current Status:
- Frontend Nuxt sudah tersedia
- Branding Literasiku sudah mulai diterapkan
- UI masih perlu diganti dari todo template menjadi landing page dan dashboard perpustakaan
- Backend Go module sudah tersedia
- Backend endpoint, database schema, dan business logic masih perlu dikembangkan
- Root README sudah disiapkan sebagai dokumentasi utama project
```

## Tim Pengembang

Project ini dikembangkan sebagai aplikasi **Sistem Informasi Perpustakaan Digital Berbasis Web** dengan fokus pada pengelolaan perpustakaan modern, akses buku digital, dan AI Agent pembaca buku.

Aturan kontribusi pengembangan:

- Gunakan branch terpisah untuk setiap fitur.
- Gunakan format commit yang jelas.
- Jangan commit file `.env`.
- Jangan commit file PDF besar ke repository jika belum ada storage strategy.
- Pastikan lint dan typecheck frontend berjalan.
- Pastikan backend dapat dijalankan tanpa error sebelum merge.

## Lisensi

Lisensi project akan ditentukan sesuai kebutuhan pengembangan dan distribusi aplikasi.
