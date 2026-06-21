# Literasiku Server

Literasiku Server adalah HTTP API berbasis Gin untuk sistem perpustakaan digital dan fisik. Project memakai GORM sebagai ORM dan PostgreSQL sebagai database default.

## Install Dependency

```bash
go mod tidy
```

## Database PostgreSQL

Buat database terlebih dahulu:

```sql
CREATE DATABASE literasiku_db;
```

Pastikan user `postgres` punya akses ke database tersebut.

## Environment

Salin `.env.example` menjadi `.env`, lalu sesuaikan nilai koneksi database.

```env
PORT=8080

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=literasiku_db
DB_SSLMODE=disable
DB_TIMEZONE=Asia/Jakarta

APP_ENV=development

JWT_SECRET=
```

## Menjalankan Server

```bash
go run ./cmd/api
```

Server berjalan di `:8080` secara default, atau mengikuti nilai `PORT`.

## Endpoint

- `GET /`
- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout` (Bearer token)

## Catatan

- Gin digunakan sebagai HTTP server.
- GORM digunakan sebagai ORM utama dengan driver PostgreSQL.
- AutoMigrate membuat table berdasarkan CDM Literasiku.
- Health check melakukan ping ke database dan mengembalikan status koneksi.
- Field `users.password_hash` digunakan untuk auth; password disimpan sebagai bcrypt hash.
- JWT yang diterbitkan tidak memiliki expiry (tidak kadaluarsa). Disimpan sebagai HS256 dengan secret dari `JWT_SECRET`.
