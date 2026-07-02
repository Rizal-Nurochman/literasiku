# Sequence: Kelola Buku (Admin)

---

## 1. Ringkasan

Sequence ini mencakup seluruh operasi CRUD untuk manajemen koleksi buku perpustakaan yang dilakukan oleh Administrator. Admin dapat melihat daftar buku dengan filter pencarian dan kategori, menambah buku baru (termasuk unggah file PDF), mengedit data buku yang sudah ada, dan menghapus buku dari sistem. Trigger awal adalah navigasi admin ke halaman `/admin/buku`.

**Actor:** Administrator (role: `ADMIN`)
**Trigger:** Admin mengakses route `/admin/buku` atau menekan tombol "Tambah Buku" / "Edit" / "Hapus"

**Dokumen terkait dalam modul ini:**
- [include/kelola_kategori.md](include/kelola_kategori.md) — Manajemen kategori (dependency wajib untuk form buku)
- [extends/file-upload.md](extends/file-upload.md) — Upload file PDF ke ImageKit (sub-flow dari create/edit buku)
- [extends/kelola_peminjaman.md](extends/kelola_peminjaman.md) — Manajemen peminjaman buku fisik & digital (mengubah stok/status buku)

---

## 2. Precondition & Postcondition

| Kondisi | State |
|---|---|
| **Precondition** | Admin sudah login dengan cookie `literasiku_session` valid dan `user.role === 'ADMIN'`. Middleware global (`auth.global.ts`) memastikan session ada; layout `admin.vue` memverifikasi role. |
| **Postcondition (List)** | Data buku dari database ditampilkan dalam tabel dengan pagination. |
| **Postcondition (Create)** | Buku baru tersimpan di tabel `books`. Jika buku memiliki file digital, side-effect `/api/ai/embed` dipanggil. Admin di-redirect ke `/admin/buku`. |
| **Postcondition (Update)** | Data buku di-update di tabel `books`. Jika file URL berubah, side-effect embedding di-trigger. Admin di-redirect ke `/admin/buku`. |
| **Postcondition (Delete)** | Buku dihapus dari tabel `books` (soft-delete via GORM). Admin tetap di halaman list. |
| **Postcondition (Error)** | Toast error ditampilkan sesuai jenis kegagalan. Admin tetap di halaman yang sama. |

---

## 3. Diagram Sequence

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Admin Layout
    participant List as buku/index.vue
    participant Create as buku/create.vue
    participant Edit as buku/[id]/edit.vue
    participant C as useBooks (Composable)
    participant BFF as Nuxt Server Route (BFF)
    participant BE as Go API (Gin)
    participant DB as PostgreSQL

    Admin->>FE: Akses /admin/buku
    FE->>FE: Layout admin.vue → cek role ADMIN
    FE->>List: Render halaman index
    Note over List: useBooksList(query) + useCategories()

    List->>C: useBooksList({ page, limit, search, categoryId })
    C->>BFF: GET /api/books?page=1&limit=10
    BFF->>BE: GET /api/v1/books?page=1&limit=10
    BE->>DB: SELECT ... FROM books ...
    DB-->>BE: books[] + total count
    BE-->>BFF: { status:true, data: { data:[...], page, limit, total, total_pages } }
    BFF-->>C: BooksResponse
    List->>List: Render tabel + pagination

    Admin->>List: Klik "Tambah Buku"
    List->>Create: router.push('/admin/buku/create')

    Note over Create: Form: title, author, publisher, year, isbn,<br/>category_id, stock, status, file upload

    Admin->>Create: Isi form + unggah PDF (opsional)
    Create->>BFF: POST /api/upload (FormData)
    Note over Create,BFF: Lihat extends/file-upload.md untuk detail upload
    BFF-->>Create: { data: { url } }
    Create->>Create: state.file_url = url

    Admin->>Create: Klik "Simpan Buku"
    Create->>C: createBookMutation.mutate(state)
    C->>BFF: POST /api/books (validated body)
    BFF->>BFF: readValidatedBody → createBookSchema
    BFF->>BE: POST /api/v1/books (dengan Bearer token session)
    BE->>BE: Validasi kategori, cek duplikasi ISBN
    BE->>DB: INSERT INTO books
    DB-->>BE: book
    BE-->>BFF: { status:true, data: { id, title, ... } }
    BFF-->>C: BookResponse
    alt book.is_digital_available && book.file_url
        C->>BFF: POST /api/ai/embed { bookId, fileUrl }
    end
    C->>List: router.push('/admin/buku')
    List->>List: invalidateQueries → refetch list

    Admin->>List: Klik ikon Edit pada baris buku
    List->>Edit: router.push('/admin/buku/{id}/edit')

    Edit->>C: useBookDetail(id)
    C->>BFF: GET /api/books/{id}
    BFF->>BE: GET /api/v1/books/{id}
    BE->>DB: SELECT ... FROM books WHERE id = ?
    DB-->>BE: book
    BE-->>BFF: { status:true, data: { id, title, ... } }
    BFF-->>Edit: BookResponse
    Edit->>Edit: Populate state dari data buku

    Admin->>Edit: Ubah data + klik "Simpan Perubahan"
    Edit->>C: updateBookMutation.mutate({ id, data })
    C->>BFF: PATCH /api/books/{id} (validated body)
    BFF->>BE: PATCH /api/v1/books/{id}
    BE->>DB: UPDATE books SET ... WHERE id = ?
    DB-->>BE: book (updated)
    BE-->>BFF: { status:true, data: { ... } }
    BFF-->>C: BookResponse
    C->>List: router.push('/admin/buku')
    List->>List: invalidateQueries → refetch list

    Admin->>List: Klik ikon Hapus → konfirmasi modal
    List->>List: confirmDelete(book) → showDeleteModal
    Admin->>List: Klik "Hapus" di modal
    List->>C: deleteBookMutation.mutate(id)
    C->>BFF: DELETE /api/books/{id}
    BFF->>BE: DELETE /api/v1/books/{id}
    BE->>DB: DELETE FROM books WHERE id = ?
    DB-->>BE: OK
    BE-->>BFF: { status:true, message: "Book deleted successfully" }
    BFF-->>C: null
    C->>List: invalidateQueries → refetch list
    List->>List: showDeleteModal = false
```

---

## 4. Breakdown per Boundary

### Boundary 1: Daftar Buku (`buku/index.vue`)

| Aspek | Detail |
|---|---|
| **File Komponen** | `client/app/pages/admin/buku/index.vue:1-344` |
| **Layout** | `admin` (`client/app/layouts/admin.vue`) — memverifikasi `user.role === 'ADMIN'` via watcher |
| **State/Store** | `page` (ref 1), `limit` (ref 10), `search` (ref ''), `selectedCategoryId` (ref undefined), `showDeleteModal` (ref false), `deleteTarget` (ref null) |
| **Composable** | `useBooks()` → `useBooksList({ page, limit, search, categoryId })`, `deleteBookMutation`; `useCategories()` → `categories` |
| **Trigger** | Page mount → query otomatis via TanStack Query; search debounce 400ms → page reset ke 1; filter kategori → page reset ke 1 |
| **API Call** | `GET /api/books?page=&limit=&search=&category_id=` via `$fetch` di `useBooksList` |
| **Transisi** | "Tambah Buku" → `goToCreate()` → `router.push('/admin/buku/create')`; "Edit" → `goToEdit(id)` → `router.push(\`/admin/buku/${id}/edit\`)`; "Hapus" → `confirmDelete(book)` → open modal |

### Boundary 2: Tambah Buku (`buku/create.vue`)

| Aspek | Detail |
|---|---|
| **File Komponen** | `client/app/pages/admin/buku/create.vue:1-291` |
| **State** | `state` (reactive `CreateBookInput`), `isUploading` (ref false) |
| **Input Form** | `title` (text, required), `author` (text, required), `publisher` (text), `year_published` (number, required), `isbn` (text), `category_id` (select, required), `status` (select, default ACTIVE), `physical_stock` (number), `is_physical_available` (switch), `is_digital_available` (switch), `file_url` (file upload + manual URL) |
| **Schema** | `createBookSchema` dari `shared/schemas/books.schema.ts` |
| **Trigger Aksi** | `onSubmit()` → `createBookMutation.mutate(state)` |
| **API Calls** | `POST /api/books` (simpan buku), opsional `POST /api/upload` (unggah PDF — lihat [extends/file-upload.md](extends/file-upload.md)) |
| **Transisi** | `onSuccess` → `router.push('/admin/buku')`; "Batal" → `goBack()` → `router.push('/admin/buku')` |

### Boundary 3: Edit Buku (`buku/[id]/edit.vue`)

| Aspek | Detail |
|---|---|
| **File Komponen** | `client/app/pages/admin/buku/[id]/edit.vue:1-344` |
| **State** | `bookId` (computed dari route param), `state` (reactive `UpdateBookInput`), `isUploading` (ref false), `hasPopulated` (ref false) |
| **Data Fetch** | `useBookDetail(bookId)` → `GET /api/books/{id}` — enabled hanya jika `id` truthy |
| **Populate** | `watch(book)` → populate `state` dari response, `hasPopulated` mencegah overwrite berulang |
| **Input Form** | Sama persis dengan create, semua field bisa diedit |
| **Schema** | `updateBookSchema` = `createBookSchema.partial()` — semua field opsional |
| **Trigger Aksi** | `onSubmit()` → `updateBookMutation.mutate({ id: bookId, data: state })` |
| **API Calls** | `GET /api/books/{id}` (load data), `PATCH /api/books/{id}` (update), opsional `POST /api/upload` (unggah PDF baru — lihat [extends/file-upload.md](extends/file-upload.md)) |
| **Transisi** | `onSuccess` → `router.push('/admin/buku')` |

### Boundary 4: BFF Server Routes (Nuxt Nitro)

| Aspek | Detail |
|---|---|
| **File** | `client/server/api/books/index.get.ts`, `index.post.ts`, `[id].get.ts`, `[id].patch.ts`, `[id].delete.ts` |
| **GET /api/books** | Public (tidak baca cookie). Forward query params ke `{goApiBaseUrl}/api/v1/books`. |
| **GET /api/books/:id** | Public. Forward ke `{goApiBaseUrl}/api/v1/books/{id}`. |
| **POST /api/books** | Protected: baca cookie `literasiku_session`, validasi body dengan `createBookSchema`, forward dengan `Authorization: Bearer {token}`. |
| **PATCH /api/books/:id** | Protected: baca cookie, validasi body dengan `updateBookSchema`, forward dengan token. |
| **DELETE /api/books/:id** | Protected: baca cookie, forward dengan token. |

### Boundary 5: Backend Go (Handler → Service → Repository)

| Lapisan | File | Peran |
|---|---|---|
| **Handler** | `server/modules/book/handler/book_handler.go:1-173` | Binding JSON, parse param, delegasi ke service, mapping error ke HTTP status |
| **Service** | `server/modules/book/service/book_service.go:1-156` | Validasi bisnis (cek kategori exists, cek duplikasi ISBN), orchestrasi CRUD |
| **Repository** | `server/modules/book/repository/book_repository.go:1-78` | Akses database via GORM |

---

## 5. Alur Detail End-to-End

### 5.1. Melihat Daftar Buku

1. Admin mengakses `/admin/buku`. Middleware global `auth.global.ts:4-16` mengecek cookie `literasiku_session`, layout `admin.vue:23-33` memverifikasi `user.role === 'ADMIN'`.
2. `buku/index.vue:18-23` memanggil `useBooksList({ page, limit, search, selectedCategoryId })`.
3. `useBooks.ts:9-26` menjalankan `useQuery` dengan key `['books', 'list', page, limit, search, categoryId]`, memanggil `$fetch<BooksResponse>('/api/books', { query: {...} })`.
4. BFF `server/api/books/index.get.ts` meneruskan query params ke `{goApiBaseUrl}/api/v1/books?page=...`.
5. Go handler `book_handler.go:69-101` membaca `page`, `limit`, `search`, `category_id` dari query string.
6. Service `book_service.go:89-99` menjalankan `bookRepo.FindAll(page, limit, search, categoryID)`.
7. Repository `book_repository.go:38-59` menjalankan query dengan `ILIKE` untuk search, filter `category_id`, pagination `OFFSET/LIMIT`, dan `ORDER BY created_at DESC`.
8. Response dikembalikan sebagai `PaginatedResponse` → dikirim ke client → dirender di tabel.

### 5.2. Mencari dan Filter

1. Admin mengetik di input search → `watch(search)` di `buku/index.vue:95-100` → debounce 400ms → `page.value = 1`.
2. Admin memilih kategori dari `USelectMenu` → `watch(selectedCategoryId)` → `page.value = 1`.
3. Perubahan `page`, `search`, atau `selectedCategoryId` memicu `useBooksList` refetch otomatis (query key berubah).

### 5.3. Menambah Buku

1. Admin klik "Tambah Buku" → `goToCreate()` → `router.push('/admin/buku/create')`.
2. `buku/create.vue:73-79` submit → `createBookMutation.mutate(state)`.
3. `useBooks.ts:36-60` mutation → `$fetch('POST /api/books', { body: input })`.
4. BFF `server/api/books/index.post.ts:7-31` validasi body dengan `createBookSchema`, baca cookie session, forward ke Go API dengan Bearer token.
5. Go handler `book_handler.go:30-48` bind JSON ke `dto.BookRequest`, panggil `bookService.Create()`.
6. Service `book_service.go:35-76`:
   - Cek kategori exists via `categoryRepo.FindByID(req.CategoryID)`.
   - Jika ISBN tidak kosong, cek duplikasi via `bookRepo.ExistsByISBN(req.ISBN, nil)`.
   - Build entity `Book`, default status `"ACTIVE"`.
   - `bookRepo.Create(book)` → GORM INSERT.
   - Re-fetch `bookRepo.FindByID(book.ID)` untuk dapat data lengkap.
7. Response `http.StatusCreated` → BFF extract `res.data` → client `onSuccess`.
8. `useBooks.ts:41-51`: invalidate query key `['books']`, toast sukses. Jika `data.is_digital_available && data.file_url`, side-effect `POST /api/ai/embed { bookId, fileUrl }` dipanggil (fire-and-forget, error di-swallow).
9. Admin di-redirect ke `/admin/buku` → list refetch otomatis.

### 5.4. Unggah File PDF

Alur upload file PDF merupakan sub-flow dari create/edit buku. Detail lengkap ada di [extends/file-upload.md](extends/file-upload.md).

Ringkasan:
1. Admin pilih file PDF → `handleFileUpload(event)` di `buku/create.vue:47-71` atau `edit.vue:50-74`.
2. `FormData` dikirim ke `POST /api/upload` (BFF → Go → ImageKit CDN).
3. Response `res.url` disimpan ke `state.file_url`.
4. URL ini kemudian dikirim sebagai bagian dari payload `POST /api/books` atau `PATCH /api/books/{id}`.

### 5.5. Mengedit Buku

1. Admin klik ikon Edit → `goToEdit(id)` → `router.push('/admin/buku/{id}/edit')`.
2. `buku/[id]/edit.vue:16` panggil `useBookDetail(bookId)` → `useQuery` key `['books', 'detail', id]`.
3. BFF `server/api/books/[id].get.ts` forward ke `GET /api/v1/books/{id}`.
4. Go service `book_service.go:78-87` → `bookRepo.FindByID(id)`.
5. `watch(book)` di `buku/[id]/edit.vue:78-93` populate `state`.
6. Admin edit form → submit → `updateBookMutation.mutate({ id: bookId, data: state })`.
7. BFF `server/api/books/[id].patch.ts` validasi body dengan `updateBookSchema`, forward dengan token.
8. Go service `book_service.go:102-145`:
   - Cek buku exists → `bookRepo.FindByID(id)`.
   - Cek kategori exists.
   - Jika ISBN berubah, cek duplikasi via `bookRepo.ExistsByISBN(newISBN, &id)`.
   - Update semua field, `bookRepo.Update(book)` → `db.Save(book)`.
   - Re-fetch untuk response.
9. Sama seperti create: toast sukses, invalidate query, redirect ke list.

### 5.6. Menghapus Buku

1. Admin klik ikon Hapus → `confirmDelete(book)` → `showDeleteModal = true`.
2. Modal konfirmasi muncul dengan nama buku yang akan dihapus.
3. Admin klik "Hapus" → `executeDelete()` → `deleteBookMutation.mutate(deleteTarget.id)`.
4. BFF `server/api/books/[id].delete.ts` forward ke `DELETE /api/v1/books/{id}` dengan token.
5. Go service `book_service.go:147-156`: cek buku exists, `bookRepo.Delete(id)` → `db.Delete(&entities.Book{}, id)`.
6. GORM soft-delete (default) — record tidak benar-benar dihapus, `deleted_at` di-set.
7. `onSuccess`: invalidate query `['books']`, toast sukses, modal ditutup.

---

## 6. Kontrak Request/Response

### GET /api/books (List)

| Aspek | Detail |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/books` |
| **Header** | Tidak perlu auth (public) |
| **Query Params** | `page` (int, default 1), `limit` (int, default 10, max 100), `search` (string), `category_id` (int) |
| **Response Sukses** | `{ status: true, message: "Books retrieved successfully", data: { data: BookResponse[], page: number, limit: number, total: number, total_pages: number } }` |
| **HTTP 200** | Array buku + metadata pagination |

### GET /api/books/:id (Detail)

| Aspek | Detail |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/books/:id` |
| **Header** | Tidak perlu auth (public) |
| **Response Sukses (200)** | `{ status: true, message: "Book retrieved successfully", data: BookResponse }` |
| **Response Error (404)** | `{ status: false, message: "Failed to get book", error: "book not found" }` |

### POST /api/books (Create)

| Aspek | Detail |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/books` |
| **Header** | `Cookie: literasiku_session=<token>` (BFF forward sebagai Bearer) |
| **Request Body** | `{ title: string, author: string, publisher?: string, year_published: number, isbn?: string, category_id: number, physical_stock: number, is_physical_available: boolean, is_digital_available: boolean, status?: "ACTIVE"|"INACTIVE"|"DAMAGED"|"LOST", file_url?: string }` |
| **Response Sukses (201)** | `{ status: true, message: "Book created successfully", data: BookResponse }` |
| **Response Error (400)** | Field tidak valid, ISBN duplikat, kategori tidak ditemukan |
| **Response Error (401)** | Token session tidak valid |

### PATCH /api/books/:id (Update)

| Aspek | Detail |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/api/books/:id` |
| **Header** | `Cookie: literasiku_session=<token>` |
| **Request Body** | Partial dari `BookRequest` (semua field opsional via `partial()`) |
| **Response Sukses (200)** | `{ status: true, message: "Book updated successfully", data: BookResponse }` |
| **Response Error (400)** | Field tidak valid, ISBN duplikat, kategori tidak ditemukan |
| **Response Error (404)** | Buku tidak ditemukan |

### DELETE /api/books/:id (Delete)

| Aspek | Detail |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/api/books/:id` |
| **Header** | `Cookie: literasiku_session=<token>` |
| **Response Sukses (200)** | `{ status: true, message: "Book deleted successfully", data: null }` |
| **Response Error (404)** | Buku tidak ditemukan |
| **Response Error (500)** | Gagal menghapus (constraint foreign key, dll) |

### BookResponse Shape

```json
{
  "id": 1,
  "title": "Pengantar Sistem Informasi",
  "author": "John Doe",
  "publisher": "Penerbit Literasi",
  "year_published": 2024,
  "isbn": "978-123-456-789",
  "category_id": 2,
  "physical_stock": 5,
  "is_physical_available": true,
  "is_digital_available": true,
  "status": "ACTIVE",
  "file_url": "https://ik.imagekit.io/literasiku/literasiku/books/pengantar-si.pdf",
  "created_at": "2026-07-02T10:00:00Z",
  "updated_at": "2026-07-02T10:00:00Z"
}
```

---

## 7. Error Handling & Edge Case

### 7.1. Backend Service Errors

| Skenario | Deteksi | HTTP Status | Pesan Error |
|---|---|---|---|
| **Kategori tidak ditemukan** (Create/Update) | `categoryRepo.FindByID` → `gorm.ErrRecordNotFound` | 400 | `"category not found"` |
| **ISBN duplikat** (Create) | `bookRepo.ExistsByISBN(isbn, nil)` → true | 400 | `"ISBN already exists"` |
| **ISBN duplikat** (Update, ISBN berubah) | `bookRepo.ExistsByISBN(isbn, &id)` → true | 400 | `"ISBN already exists"` |
| **Buku tidak ditemukan** (GetByID / Update / Delete) | `bookRepo.FindByID` → `gorm.ErrRecordNotFound` | 404 / 400 | `"book not found"` |
| **Body tidak valid** (binding error) | `ctx.ShouldBindJSON` → error | 400 | `"Failed to parse request"` + detail binding |
| **ID tidak valid** (not a number) | `strconv.ParseUint` → error | 400 | `"Invalid book ID"` |

### 7.2. Client-side Error Display

Setiap mutation di `useBooks.ts` memiliki `onError` handler:

```ts
onError: (error: any) => {
  toast.add({
    title: 'Gagal menambahkan buku', // atau memperbarui / menghapus
    description: error?.data?.statusMessage ?? error?.message ?? 'Terjadi kesalahan',
    color: 'error',
    icon: 'i-lucide-circle-x'
  })
}
```

Error dari BFF (via `throwError` di `apiCall.ts`) melempar `createError` dengan `statusCode` + `statusMessage` dari response Go. Client membaca `error.data?.statusMessage` sebagai priority pertama.

### 7.3. Edge Cases

| Edge Case | Penanganan |
|---|---|
| **Search kosong** | Query tetap jalan tanpa filter ILIKE, return semua buku |
| **Category filter = undefined** | Parameter `category_id` tidak dikirim, backend skip filter |
| **ISBN tidak diisi** | Skip pengecekan duplikasi ISBN di service (`req.ISBN != ""`) |
| **Status default** | Jika status tidak dikirim di create, service set `"ACTIVE"` |
| **File URL dihapus di edit** | `file_url` bisa di-set ke string kosong; schema Zod menerima `''` |
| **Debounce search** | 400ms debounce mencegah request berlebihan saat mengetik |
| **Delete constraint** | Jika buku memiliki relasi (loans, files), GORM `OnDelete:RESTRICT` akan mencegah delete; error 500 |
| **Upload gagal** | File upload terpisah dari save buku. Error upload tidak menghalangi submit form (user bisa input URL manual) |
| **Query limit > 100** | Service memotong ke 100 (`if limit > 100 { limit = 100 }`) |
| **Page < 1** | Service reset ke 1 (`if page < 1 { page = 1 }`) |

---

## 8. File Terkait

### Frontend

| File | Path (relatif terhadap repo root) |
|---|---|
| Halaman Daftar Buku | `client/app/pages/admin/buku/index.vue` |
| Halaman Tambah Buku | `client/app/pages/admin/buku/create.vue` |
| Halaman Edit Buku | `client/app/pages/admin/buku/[id]/edit.vue` |
| Layout Admin | `client/app/layouts/admin.vue` |
| Composable Buku | `client/app/composables/useBooks.ts` |
| Composable Kategori | `client/app/composables/useCategories.ts` |
| Schema Buku (Zod) | `client/shared/schemas/books.schema.ts` |
| Types Buku (FE) | `client/shared/types/books.ts` |
| BFF GET List | `client/server/api/books/index.get.ts` |
| BFF POST Create | `client/server/api/books/index.post.ts` |
| BFF GET Detail | `client/server/api/books/[id].get.ts` |
| BFF PATCH Update | `client/server/api/books/[id].patch.ts` |
| BFF DELETE | `client/server/api/books/[id].delete.ts` |
| BFF Upload | `client/server/api/upload/index.post.ts` |
| Server Utils | `client/server/utils/apiCall.ts` |
| Middleware Auth Global | `client/app/middleware/auth.global.ts` |
| Nuxt Config | `client/nuxt.config.ts` |

### Backend

| File | Path (relatif terhadap repo root) |
|---|---|
| Book Handler | `server/modules/book/handler/book_handler.go` |
| Book Service | `server/modules/book/service/book_service.go` |
| Book Repository | `server/modules/book/repository/book_repository.go` |
| Book DTO | `server/modules/book/dto/book_dto.go` |
| Book Entity | `server/database/entities/book.go` |
| Upload Handler | `server/modules/upload/handler/upload_handler.go` |
| Category Entity | `server/database/entities/book_category.go` |
| Router | `server/router/router.go` |
| Auth Middleware | `server/middlewares/authentication.go` |
| Admin RBAC Middleware | `server/middlewares/rbac.go` |
| Response Utils | `server/pkg/utils/response.go` |
| Main Entry | `server/cmd/main.go` |

---

## 9. Related Docs

- [../../register.md](../../register.md) — Alur autentikasi (session cookie pattern)
- [include/kelola_kategori.md](include/kelola_kategori.md) — Manajemen kategori (dependency kategori untuk form buku)
- [extends/file-upload.md](extends/file-upload.md) — Upload file PDF ke ImageKit (sub-flow dari create/edit buku)
- [extends/kelola_peminjaman.md](extends/kelola_peminjaman.md) — Manajemen peminjaman buku fisik & digital (mengubah stok/status buku)
- `docs/domains/catalog.md` — Katalog buku dari sisi user (bila ada)
- `server/router/router.go:56-68` — Route registration untuk books (public GET, admin-only POST/PATCH/DELETE)
