# Literasiku Server

Literasiku Server adalah HTTP API berbasis Gin untuk sistem perpustakaan digital dan fisik. Project memakai GORM sebagai ORM dan MySQL sebagai database default.

## Install Dependency

```bash
go mod tidy
```

## Database MySQL

Buat database terlebih dahulu:

```sql
CREATE DATABASE literasiku_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Environment

Salin `.env.example` menjadi `.env`, lalu sesuaikan nilai koneksi database.

```env
PORT=8080

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=literasiku_db
DB_CHARSET=utf8mb4
DB_PARSE_TIME=True
DB_LOC=Local

APP_ENV=development
```

## Menjalankan Server

```bash
go run ./cmd/api
```

Server berjalan di `:8080` secara default, atau mengikuti nilai `PORT`.

## Endpoint

- `GET /`
- `GET /api/health`

## Catatan

- Gin digunakan sebagai HTTP server.
- GORM digunakan sebagai ORM utama.
- AutoMigrate membuat table berdasarkan CDM Literasiku.
- Health check melakukan ping ke database dan mengembalikan status koneksi.
- Field `users.password_hash` disiapkan untuk auth; jangan simpan password plaintext. Gunakan bcrypt saat implementasi auth.
