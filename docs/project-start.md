# Literasiku — Panduan Memulai Proyek

**Literasiku** adalah aplikasi **Sistem Informasi Perpustakaan Digital Berbasis Web** dengan dukungan **AI Agent** (chatbot "Lixi") untuk membantu pengelolaan perpustakaan modern, peminjaman buku fisik & digital, pembacaan PDF internal, dan chatbot pemahaman buku.

Tagline: *Digital Library with AI Agent*

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Memulai Cepat (Docker)](#memulai-cepat-docker)
- [Setup Manual](#setup-manual)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend (Go/Gin)](#2-backend-gogin)
  - [3. Frontend (Nuxt 4)](#3-frontend-nuxt-4)
  - [4. Database Seeding](#4-database-seeding)
- [Referensi Environment Variables](#referensi-environment-variables)
- [Scripts & Perintah Penting](#scripts--perintah-penting)
- [Struktur Proyek](#struktur-proyek)
- [Workflow Pengembangan](#workflow-pengembangan)
- [Troubleshooting](#troubleshooting)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                              │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Nuxt 4 SSR (client/)                        │
│  ┌──────────┬──────────┬──────────┬──────────────────┐   │
│  │  Pages   │Composable│  Nuxt UI  │  Server Routes   │   │
│  │ (Vue 3)  │  (Vue    │ (UI v4)  │  (BFF Proxy)     │   │
│  │          │  Query)  │          │                   │   │
│  └──────────┴──────────┴──────────┴──────────────────┘   │
│                    │                                       │
│  ┌─────────────────▼──────────────────────────────────┐   │
│  │        AI Layer (LangChain + Pinecone + HF)         │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP (via Server Routes)
┌──────────────────▼──────────────────────────────────────────┐
│             Go/Gin API (server/)                             │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐  │
│  │ Auth │ Book │Member│Physical│Digital│ File │Upload│Health│ │
│  │      │      │(User)│ Loan  │ Loan  │      │      │      │  │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘  │
│                    │                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                 PostgreSQL                                    │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Teknologi |
|-------|-----------|
| Frontend | Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4, Nuxt UI v4 |
| State & Fetch | TanStack Vue Query 5, `useState` |
| Validasi | Zod 4 |
| Animasi | VueUse Motion 3 |
| AI / RAG | LangChain, Pinecone, HuggingFace Transformers, Flaz LLM |
| Backend | Go 1.25, Gin Framework, GORM |
| Database | PostgreSQL 15 |
| Autentikasi | JWT (golang-jwt v5) |

---

## Persyaratan Sistem

Sebelum memulai, pastikan sistem Anda memiliki:

| Tools | Versi Minimal | Catatan |
|-------|--------------|---------|
| **Go** | 1.25+ | Backend API |
| **Node.js** | 22+ | Frontend Nuxt |
| **Yarn** | 1.22 | Package manager frontend |
| **PostgreSQL** | 15+ | Database utama |
| **Docker** | 24+ | Opsional — untuk containerized setup |
| **Docker Compose** | v2+ | Opsional — orkestrasi container |

---

## Memulai Cepat (Docker)

Cara tercepat untuk menjalankan seluruh stack (database + backend + frontend) adalah dengan Docker Compose.

### 1. Clone & masuk direktori

```bash
git clone <repository-url>
cd literasiku
```

### 2. Konfigurasi environment

Buat file `.env` di root proyek (atau salin dari template):

```bash
# Di root proyek (bukan di client/ atau server/)
cat > .env << 'EOF'
DB_PASSWORD=rahasia123
JWT_SECRET=super_secret_jwt_key_here
NUXT_GO_INTERNAL_API_KEY=kunci_rahasia_internal
EOF
```

### 3. Jalankan semua service

```bash
docker compose up -d
```

Perintah ini akan menjalankan 3 container:

| Container | Port | Deskripsi |
|-----------|------|-----------|
| `literasiku_db` | 5432 | PostgreSQL 15 |
| `server` | 8080 | Go API (dengan Air hot-reload) |
| `client` | 3000 | Nuxt 4 frontend (dengan dev server) |

### 4. Seeding database

Setelah container berjalan, seed database dengan data awal:

```bash
docker compose exec go-api go run ./cmd/seed
```

Atau melalui container server dengan flag:

```bash
docker compose exec go-api go run ./cmd/main.go --seed
```

### 5. Akses aplikasi

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Health Check | http://localhost:8080/api/v1/health |

### 6. Login dengan akun seed

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@literasiku.test | rahasia123 |
| Anggota | budi@literasiku.test | rahasia123 |
| Anggota | siti@literasiku.test | rahasia123 |

### Menghentikan container

```bash
docker compose down
```

Untuk menghapus volume database juga:

```bash
docker compose down -v
```

---

## Setup Manual

### 1. Clone Repository

```bash
git clone <repository-url>
cd literasiku
```

---

### 2. Backend (Go/Gin)

#### a. Persiapan database

Pastikan PostgreSQL berjalan. Buat database:

```bash
createdb literasiku_db
```

Atau via psql:

```sql
CREATE DATABASE literasiku_db;
```

#### b. Konfigurasi environment backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` dan isi konfigurasi database serta JWT secret minimal:

```env
PORT=8080
APP_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<password-postgres-anda>
DB_NAME=literasiku_db
DB_SSLMODE=disable
DB_TIMEZONE=Asia/Jakarta

JWT_SECRET=<ganti-dengan-string-acak-yang-aman>
```

#### c. Install dependencies & jalankan

```bash
go mod tidy
go run ./cmd/main.go
```

Server akan:
1. Load konfigurasi dari `.env`
2. Koneksi ke PostgreSQL
3. Auto-migrasi tabel-tabel database
4. Menjalankan Gin HTTP server di port 8080

**Hot-reload dengan Air** (opsional):

```bash
go install github.com/air-verse/air@latest
air -c .air.toml
```

---

### 3. Frontend (Nuxt 4)

#### a. Konfigurasi environment frontend

```bash
cd client
cp .env.example .env
```

Minimal yang perlu diisi di `client/.env`:

```env
NUXT_GO_API_BASE_URL=http://localhost:8080
```

Jika ingin fitur AI Agent aktif, isi juga:

```env
NUXT_PINECONE_API_KEY=<pinecone-api-key>
FLAZ_API_KEY=<flaz-api-key>
HUGGINGFACE_API_KEY=<huggingface-api-key>
```

#### b. Install dependencies & jalankan

```bash
yarn install
yarn dev
```

Frontend akan berjalan di http://localhost:3000.

> **Catatan:** Pastikan backend sudah berjalan sebelum frontend diakses, karena Nuxt akan memanggil server routes saat SSR.

---

### 4. Database Seeding

Untuk mengisi data awal (kategori, user, buku, file):

**Manual (dari direktori `server/`):**

```bash
go run ./cmd/main.go --seed
```

Atau via seed script terpisah:

```bash
go run ./cmd/seed/main.go
```

**Data seed yang dimuat:**

- **Kategori:** Teknologi, Pendidikan, Sastra, Riset (dari `server/database/seeders/json/categories.json`)
- **User:** 1 admin + 2 anggota (dari `server/database/seeders/json/users.json`)
  - Admin: admin@literasiku.test / rahasia123
  - Anggota: budi@literasiku.test / rahasia123
  - Anggota: siti@literasiku.test / rahasia123
- **Buku:** 20+ buku contoh (dari `server/database/seeders/json/books.json`)
- **Files:** Mapping file ke buku digital (dari `server/database/seeders/json/files.json`)

> Semua seeder bersifat **idempotent** — aman dijalankan berkali-kali. Data hanya akan dibuat jika belum ada (berdasarkan email untuk user, ISBN untuk buku, dan name untuk kategori).

---

## Referensi Environment Variables

### Backend (`server/.env`)

| Variable | Default | Wajib | Deskripsi |
|----------|---------|-------|-----------|
| `PORT` | `8080` | Tidak | Port HTTP server |
| `APP_ENV` | `development` | Tidak | Environment mode |
| `DATABASE_URL` | `""` | Opsional | DSN langsung (prioritas utama, untuk Neon/Supabase) |
| `DB_HOST` | `localhost` | Ya* | Host PostgreSQL (*jika `DATABASE_URL` tidak diisi) |
| `DB_PORT` | `5432` | Ya* | Port PostgreSQL |
| `DB_USER` | `postgres` | Ya* | User PostgreSQL |
| `DB_PASSWORD` | `""` | Ya* | Password PostgreSQL |
| `DB_NAME` | `literasiku_db` | Ya* | Nama database |
| `DB_SSLMODE` | `disable` | Tidak | SSL mode koneksi |
| `DB_TIMEZONE` | `Asia/Jakarta` | Tidak | Timezone database |
| `JWT_SECRET` | `""` | **Ya** | Secret key untuk JWT signing |
| `IMAGEKIT_PRIVATE_KEY` | `""` | Tidak | ImageKit untuk upload file |
| `FINE_RATE_PER_DAY` | `1000` | Tidak | Denda per hari (Rupiah) |

### Frontend (`client/.env`)

| Variable | Default | Wajib | Deskripsi |
|----------|---------|-------|-----------|
| `NODE_ENV` | `development` | Tidak | Environment mode |
| `PORT` | `3000` | Tidak | Port dev server |
| `HOST` | `0.0.0.0` | Tidak | Bind address |
| `LOG_LEVEL` | `info` | Tidak | Level logging server-side |
| `NUXT_GO_API_BASE_URL` | `http://localhost:8080` | **Ya** | URL backend Go API |
| `NUXT_GO_INTERNAL_API_KEY` | `""` | Tidak | API key untuk internal call |
| `NUXT_PINECONE_API_KEY` | `""` | Untuk AI | Pinecone vector DB key |
| `NUXT_PINECONE_INDEX_NAME` | `literasiku` | Tidak | Pinecone index name |
| `NUXT_PINECONE_NAMESPACE` | `default` | Tidak | Pinecone namespace |
| `NUXT_RAG_MIN_SCORE` | `0.3` | Tidak | Minimum similarity score untuk RAG |
| `NUXT_RAG_MAX_REFERENCES` | `8` | Tidak | Maksimal referensi RAG |
| `FLAZ_BASE_URL` | `https://ai.flaz.id/v1` | Tidak | Base URL LLM (OpenAI compatible) |
| `FLAZ_API_KEY` | `""` | Untuk AI | API key LLM |
| `LLM_MODEL` | `MiniMax-M2.7-highspeed` | Tidak | Model LLM yang digunakan |
| `HUGGINGFACE_API_KEY` | `""` | Untuk AI | API key HuggingFace untuk embedding |

---

## Scripts & Perintah Penting

### Frontend (dari `client/`)

| Perintah | Deskripsi |
|----------|-----------|
| `yarn dev` | Jalankan dev server (port 3000) |
| `yarn build` | Build untuk production |
| `yarn preview` | Preview production build |
| `yarn lint` | Jalankan ESLint |
| `yarn typecheck` | TypeScript type checking via vue-tsc |
| `yarn postinstall` | `nuxt prepare` (generate types) |
| `nuxt typecheck` | Type check Nuxt project |
| `nuxt prepare` | Generate Nuxt types |

### Backend (dari `server/`)

| Perintah | Deskripsi |
|----------|-----------|
| `go run ./cmd/main.go` | Jalankan server API |
| `go run ./cmd/main.go --seed` | Jalankan + seeding data awal |
| `go run ./cmd/seed/main.go` | Seeding saja (tanpa server) |
| `go mod tidy` | Rapikan dependensi Go |
| `air -c .air.toml` | Jalankan dengan hot-reload |
| `go build -o ./tmp/main ./cmd/main.go` | Build binary |

### Docker

| Perintah | Deskripsi |
|----------|-----------|
| `docker compose up -d` | Jalankan semua service |
| `docker compose up -d --build` | Build ulang & jalankan |
| `docker compose down` | Hentikan semua service |
| `docker compose down -v` | Hentikan + hapus volume |
| `docker compose logs -f` | Ikuti log semua service |
| `docker compose logs -f client` | Log frontend saja |
| `docker compose logs -f go-api` | Log backend saja |
| `docker compose exec go-api go run ./cmd/seed` | Seed via container |
| `docker compose exec db psql -U postgres literasiku_db` | Akses psql ke DB |

---

## Struktur Proyek

### Root

```
literasiku/
├── client/              # Frontend Nuxt 4
│   ├── app/             # Kode aplikasi Vue
│   ├── server/          # Server routes (BFF proxy ke Go API)
│   ├── shared/          # Types & Zod schemas (shared client/server)
│   ├── nuxt.config.ts   # Konfigurasi Nuxt
│   ├── package.json     # Dependencies
│   ├── tsconfig.json    # TypeScript config
│   └── Dockerfile       # Docker image frontend
├── server/              # Backend Go/Gin
│   ├── cmd/             # Entry points (main.go, seed)
│   ├── database/        # Migrations, config, entities, seeders
│   ├── modules/         # Domain modules (handler, service, repository, dto)
│   │   ├── auth/
│   │   ├── book/
│   │   ├── category/
│   │   ├── digital_loan/
│   │   ├── file/
│   │   ├── health/
│   │   ├── physical_loan/
│   │   ├── upload/
│   │   └── user/
│   ├── middlewares/      # JWT auth, CORS, RBAC
│   ├── pkg/             # Helpers & utilities
│   ├── router/          # Route definitions
│   ├── go.mod
│   └── Dockerfile
├── docker-compose.yml   # Orkestrasi lokal
└── Readme.md
```

### Frontend (`client/app/`)

```
app/
├── app.vue                    # Root component + SEO meta
├── app.config.ts              # Nuxt UI color mapping (sea/cyan/zinc)
├── error.vue                  # Global error page dengan aurora effect
├── assets/css/main.css        # Global CSS (Tailwind, custom palettes, animasi)
├── components/
│   ├── auth/                  # AuthFormCard, AuthModal, AuthPageShell
│   ├── common/                # AppCursor
│   ├── dashboard/user/        # BookCard, CatalogHeader, CatalogFilters, dll.
│   ├── landing/               # 9 section landing page
│   └── layout/                # AppNavbar, AppFooter, AIAssistant, ThemeModeToggle
├── composables/               # useAuth, useBooks, useLoans, useCategories, dll.
├── constants/                 # Data statis: features, stats, navigation, footer, dll.
├── layouts/
│   ├── default.vue            # Landing page (navbar + footer)
│   ├── dashboard.vue          # User dashboard (sidebar + navbar)
│   └── admin.vue              # Admin panel (sidebar + role guard)
├── middleware/
│   └── auth.global.ts         # Route guard (session cookie check)
├── pages/
│   ├── index.vue              # Landing page
│   ├── auth/                  # login.vue, register.vue
│   ├── dashboard/             # index, katalog/[id], riwayat, profil
│   └── admin/                 # buku, anggota, peminjaman, kategori, laporan, denda
├── plugins/
│   └── vue-query.ts           # TanStack Vue Query (SSR dehydrated/hydrate)
└── types/
    └── landing.ts             # Tipe data landing page
```

### Backend (`server/modules/`)

Setiap modul mengikuti pola **handler → service → repository**:

```
modules/<domain>/
├── dto/<domain>_dto.go          # Data Transfer Objects (request/response)
├── handler/<domain>_handler.go  # HTTP handlers (Gin context)
├── repository/<domain>_repository.go  # Database queries (GORM)
└── service/<domain>_service.go  # Business logic
```

Modul yang tersedia:
- **auth** — Login, register, logout, JWT
- **book** — CRUD buku
- **category** — CRUD kategori
- **user** — Manajemen user/admin
- **physical_loan** — Peminjaman fisik
- **digital_loan** — Peminjaman digital
- **file** — Manajemen file PDF
- **upload** — Upload file (multipart)
- **health** — Health check endpoint

---

## Workflow Pengembangan

### Branch & Commit

```bash
# Buat branch fitur
git checkout -b feat/nama-fitur

# Commit dengan format jelas
git commit -m "feat: menambahkan fitur pencarian buku"

# Sebelum push, pastikan lint & typecheck
cd client && yarn lint && yarn typecheck
```

### Alur Kerja Sehari-hari

1. **Backend dulu, frontend kemudian** — Karena SSR Nuxt memanggil API saat render
2. **Jalankan backend** dengan `air` untuk hot-reload
3. **Jalankan frontend** dengan `yarn dev` (juga hot-reload)
4. **Gunakan docker compose** jika perlu database terisolasi

### Quality Checks

```bash
# Frontend
cd client
yarn lint          # ESLint
yarn typecheck     # TypeScript check

# Backend
cd server
go vet ./...       # Static analysis
go test ./...      # Run tests (jika ada)
```

### Routing & Proteksi Akses

Akses route ditentukan oleh middleware global + layout:

```
/ (public)              → layout: default
/auth/login (public)    → layout: default
/auth/register (public) → layout: default
/dashboard/* (user)     → layout: dashboard (session required)
/admin/* (admin)        → layout: admin (session + role ADMIN required)
```

---

## Troubleshooting

### Database

| Masalah | Solusi |
|---------|--------|
| `failed to connect database` | Pastikan PostgreSQL berjalan dan kredensial di `.env` benar |
| `password authentication failed` | Cek `DB_PASSWORD` di `server/.env` |
| `database "literasiku_db" does not exist` | Buat database: `createdb literasiku_db` |
| Port 5432 sudah dipakai | Cek dengan `lsof -i :5432`, stop service lain atau ganti port |

### Backend

| Masalah | Solusi |
|---------|--------|
| `go: not found` | Pastikan Go 1.25+ sudah terinstall dan di PATH |
| `failed to load .env file` | Buat `server/.env` dari `.env.example` |
| `JWT_SECRET is empty` | Isi `JWT_SECRET` di `server/.env` dengan string acak |
| Port 8080 sudah dipakai | Ganti `PORT` di `server/.env` atau hentikan service lain |

### Frontend

| Masalah | Solusi |
|--------|--------|
| `Cannot find module` | Jalankan `yarn install` |
| `NUXT_GO_API_BASE_URL not set` | Isi `NUXT_GO_API_BASE_URL` di `client/.env` |
| CORS error | Pastikan backend CORS middleware mengizinkan origin frontend |
| `401 Unauthorized` terus | Login ulang, atau hapus cookie `literasiku_session` |
| Halaman dashboard redirect terus ke login | Periksa cookie `literasiku_session` di browser, login ulang |

### Docker

| Masalah | Solusi |
|--------|--------|
| `permission denied` pada volume | Pastikan `user: "1000:1000"` di compose sesuai UID lokal |
| Container `client` crash | Jalankan `docker compose logs client` untuk detail error |
| Container `go-api` crash | Jalankan `docker compose logs go-api` untuk detail error |
| Hot-reload tidak bekerja | Pastikan `air` terinstall di dalam container (`go install github.com/air-verse/air@latest`) |
| Port sudah dipakai | Hentikan container lain yang menggunakan port 3000/5432/8080 |

### AI / RAG

| Masalah | Solusi |
|--------|--------|
| AI Agent tidak merespons | Pastikan `FLAZ_API_KEY` dan `HUGGINGFACE_API_KEY` terisi di `client/.env` |
| Pinecone error | Pastikan `NUXT_PINECONE_API_KEY` valid dan index `literasiku` sudah dibuat |
| Embedding gagal | Periksa log di server route `client/server/api/ai/embed.post.ts` |

### Reset Data

```bash
# Hapus & buat ulang database
docker compose down -v  # Hapus semua volume
docker compose up -d    # Buat ulang dari awal
docker compose exec go-api go run ./cmd/seed  # Seed ulang

# Atau manual via psql
dropdb literasiku_db
createdb literasiku_db
cd server && go run ./cmd/main.go --seed
```

---

## Akun Default (Setelah Seed)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@literasiku.test | rahasia123 |
| **Anggota** | budi@literasiku.test | rahasia123 |
| **Anggota** | siti@literasiku.test | rahasia123 |

---

## Endpoint API Utama

Semua endpoint ada di bawah prefix `/api/v1/`.

### Publik (tanpa auth)

```
GET  /api/v1/health
GET  /api/v1/books          # Daftar buku (dengan pagination & search)
GET  /api/v1/books/:id      # Detail buku
GET  /api/v1/categories     # Daftar kategori
```

### Auth

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
```

### User (perlu session)

```
GET  /api/v1/users/me
PATCH /api/v1/users/me

POST /api/v1/loans/physical
GET  /api/v1/loans/physical/my
POST /api/v1/loans/digital
GET  /api/v1/loans/digital/my
GET  /api/v1/loans/digital/access/:book_id
```

### Admin (perlu role ADMIN)

```
GET/POST    /api/v1/books
GET/PUT/DELETE /api/v1/books/:id
GET/POST    /api/v1/categories
GET/PUT/DELETE /api/v1/categories/:id
GET/POST    /api/v1/users
GET/PUT/DELETE /api/v1/users/:id
GET/PATCH   /api/v1/loans/physical
PATCH       /api/v1/loans/physical/:id/return
PATCH       /api/v1/loans/physical/:id/pay-fine
GET/PATCH   /api/v1/loans/digital
PATCH       /api/v1/loans/digital/:id/revoke
POST        /api/v1/uploads
```

---

## Dokumen Terkait

- [Frontend Architecture Overview](../docs/architecture.md) — Detail arsitektur frontend
- [Landing Page Domain](../docs/domains/landing.md) — Domain landing page
- [Auth Domain](../docs/domains/auth.md) — Domain autentikasi
- [Dashboard Home Domain](../docs/domains/dashboard-home.md) — Domain dashboard user
- [Catalog Domain](../docs/domains/catalog.md) — Domain katalog buku
