# Kelola Data Anggota

## 1. Ringkasan

Admin dapat mengelola data anggota perpustakaan melalui halaman daftar anggota, mencakup: melihat daftar anggota dengan pencarian dan filter peran, mengedit profil dan status anggota, serta menghapus anggota dari sistem. Angular ini menggunakan data user yang sudah teregistrasi (termasuk yang mendaftar lewat halaman register publik) dan memberikan akses edit field seperti nama, email, nomor telepon, alamat, serta kontrol status aktivasi (`ACTIVE`/`INACTIVE`/`BLOCKED`). Nomor anggota (`membership_number`) di-generate saat registrasi atau seed, dan bisa dicari oleh admin melalui fitur search.

**Actor:** Admin (ADMIN)

**Trigger:** Admin membuka halaman `/admin/anggota` atau mengklik tombol edit/hapus pada baris anggota di tabel.

---

## 2. Precondition & Postcondition

### Precondition
- Admin sudah login dengan session valid (`literasiku_session` cookie berisi JWT token)
- Role admin terverifikasi (`ADMIN`) oleh middleware RBAC
- Backend Go API dan database PostgreSQL berjalan
- Data anggota sudah ada di database (via registrasi publik, seed, atau migrasi)

### Postcondition — Sukses (List)
- `useUsers` query cache berisi daftar anggota paginated
- Tabel `UTable` menampilkan data dengan badge status yang sesuai

### Postcondition — Sukses (Edit)
- Data user di database terupdate sesuai field yang dikirim
- Vue Query cache `['users']` di-invalidate → tabel re-render otomatis
- Toast "Pengguna berhasil diperbarui"

### Postcondition — Sukses (Hapus)
- User di-*soft delete* dari database
- Vue Query cache `['users']` di-invalidate
- Toast "Pengguna berhasil dihapus"

### Postcondition — Gagal
- Cache tidak berubah
- Toast error dengan pesan dari API ditampilkan
- Modal edit/hapus tetap terbuka atau tertutup tergantung skenario

---

## 3. Diagram Sequence

```mermaid
sequenceDiagram
    actor Admin
    participant ListPage as pages/admin/anggota/index.vue
    participant UseUsers as composables/useUsers.ts
    participant NuxtBFF as server/api/users/
    participant AuthMid as middlewares/authentication.go
    participant RBAC as middlewares/rbac.go
    participant GoHandler as modules/user/handler/user_handler.go
    participant GoService as modules/user/service/user_service.go
    participant GoRepo as modules/user/repository/user_repository.go
    participant DB as PostgreSQL

    Note over Admin,DB: ─── BOUNDARY 1: LIST ANGGOTA ───

    Admin->>ListPage: Buka /admin/anggota
    ListPage->>UseUsers: useUsers({ page, limit, search, role })
    UseUsers->>UseUsers: computed queryKey ['users', page, limit, search, role]
    UseUsers->>NuxtBFF: GET /api/users?page=1&limit=10
    NuxtBFF->>NuxtBFF: getCookie 'literasiku_session' → Bearer token
    NuxtBFF->>AuthMid: GET /api/v1/users (Authorization)
    AuthMid->>AuthMid: Validasi & parse JWT
    AuthMid->>RBAC: ctx.Get("role") == "ADMIN"?
    RBAC-->>AuthMid: role == "ADMIN" → ctx.Next()
    AuthMid->>GoHandler: GetAll(ctx)
    GoHandler->>GoHandler: Parse query: page, limit, search, role
    GoHandler->>GoService: GetAll(ctx, page, limit, search, role)
    GoService->>GoService: Sanitasi: page>=1, limit[1-100]
    GoService->>GoRepo: FindAll(page, limit, search, role)
    GoRepo->>DB: SELECT COUNT(*) FROM users WHERE ...
    GoRepo->>DB: SELECT * FROM users WHERE ... ORDER BY created_at DESC LIMIT ? OFFSET ?
    DB-->>GoRepo: []User + total count
    GoRepo-->>GoService: users, total, nil
    GoService-->>GoService: Map []User → []UserResponse
    GoService-->>GoHandler: []UserResponse, total, nil
    GoHandler-->>GoHandler: Hitung totalPages
    GoHandler-->>RBAC: 200 { status, message, data: PaginatedResponse }
    RBAC-->>AuthMid: Response
    AuthMid-->>NuxtBFF: Response
    NuxtBFF-->>NuxtBFF: res.data → UsersResponse
    NuxtBFF-->>UseUsers: UsersResponse { data, page, limit, total, total_pages }
    UseUsers-->>UseUsers: usersQuery.data → computed users & total
    UseUsers-->>ListPage: Reactive users[], total
    ListPage-->>ListPage: Render UTable + UPagination

    Note over Admin,DB: ─── BOUNDARY 2: SEARCH & FILTER ───

    Admin->>ListPage: Isi input search "budi"
    Admin->>ListPage: Pilih filter role "USER"
    Admin->>ListPage: Klik "Cari" atau Enter
    ListPage->>ListPage: search.value = searchInput.value
    ListPage->>ListPage: page.value = 1
    ListPage->>UseUsers: Reactive update: search, page
    UseUsers->>UseUsers: queryKey berubah → auto refetch
    UseUsers->>NuxtBFF: GET /api/users?page=1&limit=10&search=budi&role=USER
    NuxtBFF->>GoHandler: GET /api/v1/users?page=1&limit=10&search=budi&role=USER
    GoHandler->>GoService: GetAll(ctx, 1, 10, "budi", "USER")
    GoService->>GoRepo: FindAll(1, 10, "budi", "USER")
    GoRepo->>DB: SELECT ... WHERE (full_name ILIKE '%budi%' OR email ILIKE '%budi%' OR membership_number ILIKE '%budi%') AND role = 'USER'
    DB-->>GoRepo: Filtered users
    GoRepo-->>GoService: users, total
    GoService-->>GoHandler: []UserResponse, total
    GoHandler-->>NuxtBFF: 200 { data: [...] }
    NuxtBFF-->>UseUsers: UsersResponse terfilter
    UseUsers-->>ListPage: users[] = filtered
    ListPage-->>ListPage: Render ulang UTable

    Note over Admin,DB: ─── BOUNDARY 3: EDIT ANGGOTA ───

    Admin->>ListPage: Klik icon edit pada baris anggota
    ListPage->>ListPage: openEditModal(user)
    ListPage->>ListPage: selectedUser = user; state diisi data user
    ListPage-->>Admin: Modal edit terbuka

    Admin->>ListPage: Ubah field (misal: status → "BLOCKED")
    Admin->>ListPage: Klik "Simpan Perubahan"
    ListPage->>ListPage: onSubmiEdit()
    ListPage->>ListPage: updateUserSchema.parse(state) [Zod]
    alt Validasi Zod gagal
        ListPage-->>Admin: UForm tampilkan error field
    end
    ListPage->>UseUsers: updateMutation.mutateAsync({ id, data: state })
    UseUsers->>NuxtBFF: PATCH /api/users/{id} (body: UpdateUserInput)
    NuxtBFF->>NuxtBFF: readValidatedBody(event, updateUserSchema.parse)
    NuxtBFF->>AuthMid: PATCH /api/v1/users/{id} (Authorization)
    AuthMid->>AuthMid: Validasi JWT
    AuthMid->>RBAC: Check ADMIN role
    RBAC-->>AuthMid: OK
    AuthMid->>GoHandler: Update(ctx)
    GoHandler->>GoHandler: ParseUint(id), ShouldBindJSON → UpdateUserRequest
    alt Binding error
        GoHandler-->>AuthMid: 400 { error: "Failed to parse request" }
        AuthMid-->>NuxtBFF: 400
        NuxtBFF-->>UseUsers: createError (statusCode: 400)
        UseUsers-->>ListPage: updateMutation.onError → err.data.message
        ListPage-->>Admin: Toast error "Gagal memperbarui pengguna"
    end
    GoHandler->>GoService: Update(ctx, id, req)
    GoService->>GoRepo: FindByID(id)
    GoRepo->>DB: SELECT * FROM users WHERE id = ?
    DB-->>GoRepo: User or ErrRecordNotFound
    alt User not found
        GoRepo-->>GoService: gorm.ErrRecordNotFound
        GoService-->>GoHandler: error "user not found"
        GoHandler-->>AuthMid: 400
    end
    GoService->>GoService: Cek email unik jika berubah
    GoService->>GoRepo: ExistsByEmail(newEmail, &id)
    GoRepo->>DB: SELECT COUNT(*) FROM users WHERE email = ? AND id != ?
    DB-->>GoRepo: count
    alt Email sudah dipakai user lain
        GoService-->>GoHandler: error "email already exists"
        GoHandler-->>AuthMid: 400
    end
    GoService->>GoService: Update field: FullName, Username, Email, Phone, Address, Status
    GoService->>GoRepo: Update(user) → db.Save(user)
    GoRepo->>DB: UPDATE users SET full_name=?, email=?, status=? WHERE id=?
    DB-->>GoRepo: OK
    GoRepo-->>GoService: nil
    GoService-->>GoService: Map to UserResponse
    GoService-->>GoHandler: *UserResponse, nil
    GoHandler-->>AuthMid: 200 { status, message, data: UserResponse }
    AuthMid-->>NuxtBFF: Response
    NuxtBFF-->>NuxtBFF: res.data → UserResponse
    NuxtBFF-->>UseUsers: UserResponse
    UseUsers->>UseUsers: onSuccess: toast.add "Pengguna berhasil diperbarui"
    UseUsers->>UseUsers: queryClient.invalidateQueries(['users'])
    UseUsers-->>ListPage: updateMutation resolved
    ListPage->>ListPage: isEditModalOpen = false
    ListPage-->>Admin: Modal tertutup, toast sukses, tabel re-render

    Note over Admin,DB: ─── BOUNDARY 4: HAPUS ANGGOTA ───

    Admin->>ListPage: Klik icon hapus pada baris anggota
    ListPage->>ListPage: openDeleteModal(user)
    ListPage-->>Admin: Modal konfirmasi "Hapus Anggota"

    Admin->>ListPage: Klik "Hapus"
    ListPage->>ListPage: onConfirmDelete()
    ListPage->>UseUsers: deleteMutation.mutateAsync(id)
    UseUsers->>NuxtBFF: DELETE /api/users/{id}
    NuxtBFF->>AuthMid: DELETE /api/v1/users/{id}
    AuthMid->>AuthMid: Validasi JWT
    AuthMid->>RBAC: Check ADMIN role
    RBAC-->>AuthMid: OK
    AuthMid->>GoHandler: Delete(ctx)
    GoHandler->>GoHandler: ParseUint(id)
    GoHandler->>GoService: Delete(ctx, id)
    GoService->>GoRepo: FindByID(id)
    alt User not found
        GoService-->>GoHandler: error "user not found"
        GoHandler-->>AuthMid: 400
    end
    GoService->>GoRepo: Delete(id) → db.Delete(&User{}, id)
    alt User memiliki relasi (loans, dll)
        GoRepo->>DB: Error constraint FK → gagal
        GoRepo-->>GoService: foreign key violation error
        GoService-->>GoHandler: error
        GoHandler-->>AuthMid: 400
    else Tidak ada relasi
        GoRepo->>DB: UPDATE users SET deleted_at = NOW() WHERE id = ?
        DB-->>GoRepo: Rows affected = 1
        GoRepo-->>GoService: nil
        GoService-->>GoHandler: nil
    end
    GoHandler-->>AuthMid: 200 { status: true, message: "User deleted successfully" }
    AuthMid-->>NuxtBFF: Response
    NuxtBFF-->>UseUsers: { success: true }
    UseUsers->>UseUsers: onSuccess: toast.add "Pengguna berhasil dihapus"
    UseUsers->>UseUsers: queryClient.invalidateQueries(['users'])
    UseUsers-->>ListPage: deleteMutation resolved
    ListPage->>ListPage: isDeleteModalOpen = false
    ListPage-->>Admin: Toast sukses, tabel re-render
```

---

## 4. Breakdown per Boundary

### Boundary 1: Daftar Anggota (List Page)

| Atribut | Detail |
|---------|--------|
| **File komponen** | `pages/admin/anggota/index.vue` |
| **Layout** | `admin` (dengan sidebar admin, navbar, role guard) |
| **State/store** | `useUsers()` → `users`, `total`, `isLoading` |

Halaman ini adalah entry point utama untuk manajemen anggota. Admin melihat tabel berisi seluruh user (baik `USER` maupun `ADMIN`) dengan kolom: ID, Nama Lengkap, Email, Peran, Status, Terdaftar Pada, dan Aksi.

**State lokal:**
| State | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| `page` | `ref(1)` | 1 | Halaman pagination saat ini |
| `limit` | `ref(10)` | 10 | Item per halaman |
| `search` | `ref('')` | `""` | Query pencarian (trigger refetch) |
| `searchInput` | `ref('')` | `""` | Binding input field (belum commit) |
| `roleFilter` | `ref('ALL')` | ALL | Filter peran (ALL/USER/ADMIN) |

**Trigger aksi:** Halaman dimuat → Vue Query `useUsers` otomatis fetch data.

**Transisi:** Data dari composable di-render ke `UTable` dengan `UPagination` di footer.

---

### Boundary 2: Pencarian & Filter

| Atribut | Detail |
|---------|--------|
| **File komponen** | `pages/admin/anggota/index.vue` |
| **Trigger** | `@keyup.enter` pada `UInput` atau klik tombol "Cari" |

**Input yang ditampilkan:**
- `UInput` dengan icon search — placeholder "Cari anggota..."
- `USelect` untuk filter peran: `Semua Peran (ALL)`, `Admin (ADMIN)`, `Anggota (USER)`

**Fungsi search:**
```ts
// pages/admin/anggota/index.vue:82-85
const onSearch = () => {
  search.value = searchInput.value  // commit input ke reactive search
  page.value = 1                     // reset ke halaman 1
}
```

**Fungsi filter role:**
```ts
// pages/admin/anggota/index.vue:41
watch(roleFilter, () => { page.value = 1 })  // reset page saat filter berubah
```

**Komposisi reactive query key:**
```ts
// composables/useUsers.ts:11
const queryKey = computed(() => ['users', params?.page?.value, params?.limit?.value, params?.search?.value, params?.role?.value])
```
Query key berubah → Vue Query auto refetch → tabel re-render.

**Pencarian dilakukan oleh Go Repository:** `full_name ILIKE ? OR email ILIKE ? OR membership_number ILIKE ?`

**Transisi:** Tidak ada — filter/search langsung meng-update tabel yang sama.

---

### Boundary 3: Edit Anggota (Modal)

| Atribut | Detail |
|---------|--------|
| **File komponen** | `pages/admin/anggota/index.vue` (inline modal) |
| **Zod schema** | `shared/schemas/users.schema.ts` → `updateUserSchema` |
| **Mutation** | `useUsers().updateMutation` |

**Trigger:** Admin klik tombol edit (icon `i-lucide-edit`) pada baris anggota → `openEditModal(user)` dipanggil.

**`openEditModal(user: UserResponse)` — `pages/admin/anggota/index.vue:66-75`:**
```ts
const openEditModal = (user: UserResponse) => {
  selectedUser.value = user
  state.full_name = user.full_name || ''
  state.username = user.username || ''
  state.email = user.email || ''
  state.phone_number = user.phone_number || ''
  state.address = user.address || ''
  state.status = user.status || 'ACTIVE'
  isEditModalOpen.value = true
}
```

**Form di modal (`UForm` dengan `updateUserSchema`):**
| Field | Type | Binding | Validasi Zod |
|-------|------|---------|-------------|
| Nama Lengkap | `UInput` text | `state.full_name` | `min(1).max(100)` |
| Username | `UInput` text | `state.username` | `min(3).max(50)` |
| Email | `UInput` email | `state.email` | `email().max(100)` |
| Nomor Telepon | `UInput` text | `state.phone_number` | `max(20)` |
| Status | `USelect` | `state.status` | `enum: ACTIVE/INACTIVE/BLOCKED` |
| Alamat | `UInput` text | `state.address` | `string()` (opsional) |

**Fungsi submit — `pages/admin/anggota/index.vue:87-97`:**
```ts
const onSubmitEdit = async () => {
  if (!selectedUser.value) return
  await updateMutation.mutateAsync({ 
    id: selectedUser.value.id, 
    data: { 
      full_name: state.full_name, username: state.username, email: state.email,
      phone_number: state.phone_number, address: state.address, status: state.status
    } 
  })
  isEditModalOpen.value = false
}
```

**Success callback** (`composables/useUsers.ts:50-57`):
```ts
onSuccess: () => {
  toast.add({ title: 'Pengguna berhasil diperbarui', color: 'success', icon: 'i-lucide-check-circle' })
  queryClient.invalidateQueries({ queryKey: ['users'] })
}
```

**Transisi sukses:** `isEditModalOpen = false` → modal tertutup → cache invalidate → tabel re-render dengan data baru.

---

### Boundary 4: Hapus Anggota (Modal)

| Atribut | Detail |
|---------|--------|
| **File komponen** | `pages/admin/anggota/index.vue` (inline modal) |
| **Mutation** | `useUsers().deleteMutation` |

**Trigger:** Admin klik tombol hapus (icon `i-lucide-trash`) pada baris anggota → `openDeleteModal(user)`.

**Fungsi konfirmasi — `pages/admin/anggota/index.vue:99-103`:**
```ts
const onConfirmDelete = async () => {
  if (!selectedUser.value) return
  await deleteMutation.mutateAsync(selectedUser.value.id)
  isDeleteModalOpen.value = false
}
```

**UI modal:**
- Header: "Hapus Anggota" dengan teks merah
- Body: "Apakah Anda yakin ingin menghapus anggota **{nama}**? Tindakan ini tidak dapat dibatalkan."
- Footer: tombol "Batal" (neutral ghost) dan "Hapus" (error, dengan loading state)

**Success callback** (`composables/useUsers.ts:63-69`):
```ts
onSuccess: () => {
  toast.add({ title: 'Pengguna berhasil dihapus', color: 'success', icon: 'i-lucide-check-circle' })
  queryClient.invalidateQueries({ queryKey: ['users'] })
}
```

**Transisi sukses:** `isDeleteModalOpen = false` → toast sukses → cache invalidate → tabel re-render.

---

## 5. Alur Detail End-to-End

### 5.1 List Anggota

| Step | Pelaku | Aksi | File:Function |
|------|--------|------|---------------|
| 1 | Admin | Buka URL `/admin/anggota` | Browser navigation |
| 2 | FE | Middleware global cek `literasiku_session` | `middleware/auth.global.ts:5-10` |
| 3 | FE | Layout `admin.vue` — role guard: cek `role === 'ADMIN'` | `layouts/admin.vue` watch |
| 4 | FE | `useUsers({ page, limit, search, role })` dipanggil | `pages/admin/anggota/index.vue:27-38` |
| 5 | FE | `useQuery({ queryKey: ['users', 1, 10, '', ''], queryFn })` | `composables/useUsers.ts:13-24` |
| 6 | FE | `fetch('/api/users?page=1&limit=10')` via `useRequestFetch` | `composables/useUsers.ts:22` |
| 7 | Nuxt | `defineEventHandler` — baca cookie, forward ke Go | `server/api/users/index.get.ts:5-29` |
| 8 | Nuxt | `getCookie(event, 'literasiku_session')` → token | `server/api/users/index.get.ts:8` |
| 9 | Nuxt | `$fetch` ke `${goApiBaseUrl}/api/v1/users?...` | `server/api/users/index.get.ts:16-23` |
| 10 | Gin | Middleware `Authenticate` — validasi JWT | `middlewares/authentication.go:13-55` |
| 11 | Gin | Middleware `AdminOnly` — cek role ADMIN | `middlewares/rbac.go:11-19` |
| 12 | Gin | `userHandler.GetAll(ctx)` — parse query params | `modules/user/handler/user_handler.go:30-56` |
| 13 | Service | `userService.GetAll(ctx, page, limit, search, role)` — sanitasi param | `modules/user/service/user_service.go:29-50` |
| 14 | Repo | `userRepo.FindAll(page, limit, search, role)` — GORM query | `modules/user/repository/user_repository.go:24-46` |
| 15 | DB | `SELECT COUNT(*) FROM users WHERE ...` | PostgreSQL |
| 16 | DB | `SELECT * FROM users WHERE ... ORDER BY created_at DESC LIMIT 10 OFFSET 0` | PostgreSQL |
| 17 | Repo | Return `[]entities.User, total, nil` | `modules/user/repository/user_repository.go:44` |
| 18 | Service | Map ke `[]dto.UserResponse` via `toUserResponse()` | `modules/user/service/user_service.go:46-49` |
| 19 | Handler | Hitung `totalPages`, susun `PaginatedResponse` | `modules/user/handler/user_handler.go:43-55` |
| 20 | Handler | `200 OK` → `BuildResponseSuccess("Users retrieved successfully", ...)` | `modules/user/handler/user_handler.go:48-55` |
| 21 | Nuxt | Ekstrak `res.data` → `UsersResponse` | `server/api/users/index.get.ts:29` |
| 22 | FE | `usersQuery.data.value` → `users` computed = `data.data ?? []` | `composables/useUsers.ts:73` |
| 23 | FE | Render `UTable` dengan data + `UPagination` | `pages/admin/anggota/index.vue:144-170` |

### 5.2 Edit Anggota

| Step | Pelaku | Aksi | File:Function |
|------|--------|------|---------------|
| 1 | Admin | Klik icon edit pada baris anggota | `pages/admin/anggota/index.vue:155` |
| 2 | FE | `openEditModal(row.original)` — set `selectedUser` + `state` | `pages/admin/anggota/index.vue:66-75` |
| 3 | FE | Modal edit terbuka, form terisi data user | `pages/admin/anggota/index.vue:172-209` |
| 4 | Admin | Ubah field (misal status ke BLOCKED) | `pages/admin/anggota/index.vue:194-197` |
| 5 | Admin | Klik "Simpan Perubahan" | `pages/admin/anggota/index.vue:204` |
| 6 | FE | `UForm @submit` → validasi `updateUserSchema` (Zod) | `shared/schemas/users.schema.ts:3-10` |
| 7 | FE | `onSubmitEdit()` — panggil `updateMutation.mutateAsync` | `pages/admin/anggota/index.vue:87-97` |
| 8 | FE | `fetch('/api/users/{id}', { method: 'PATCH', body: data })` | `composables/useUsers.ts:46-49` |
| 9 | Nuxt | `readValidatedBody(event, updateUserSchema.parse)` — validasi server | `server/api/users/[id].patch.ts:8` |
| 10 | Nuxt | `$fetch` ke Go `${goApiBaseUrl}/api/v1/users/{id}` | `server/api/users/[id].patch.ts:12-21` |
| 11 | Gin | Middleware chain: Authenticate → AdminOnly | `router/router.go:107-108` |
| 12 | Gin | `userHandler.Update(ctx)` — parse id + bind body | `modules/user/handler/user_handler.go:77-101` |
| 13 | Service | `userService.Update(ctx, id, req)` — find + validate + update | `modules/user/service/user_service.go:64-106` |
| 14 | Repo | `userRepo.FindByID(id)` — cek user exist | `modules/user/repository/user_repository.go:48-55` |
| 15 | Service | Jika email berubah: `userRepo.ExistsByEmail(email, &id)` | `modules/user/service/user_service.go:73-81` |
| 16 | Repo | `SELECT COUNT(*) FROM users WHERE email = ? AND id != ?` | `modules/user/repository/user_repository.go:65-73` |
| 17 | Service | Update field user yang tidak kosong | `modules/user/service/user_service.go:84-98` |
| 18 | Repo | `userRepo.Update(user)` → `db.Save(user)` | `modules/user/repository/user_repository.go:57-59` |
| 19 | Service | `toUserResponse(user)` → `dto.UserResponse` | `modules/user/service/user_service.go:119-132` |
| 20 | Handler | `200 OK` → `BuildResponseSuccess("User updated successfully", user)` | `modules/user/handler/user_handler.go:99-100` |
| 21 | Nuxt | Return `res.data` → `UserResponse` | `server/api/users/[id].patch.ts:27` |
| 22 | FE | `updateMutation.onSuccess` → toast + invalidate cache | `composables/useUsers.ts:50-57` |
| 23 | FE | `isEditModalOpen = false` | `pages/admin/anggota/index.vue:96` |
| 24 | FE | `['users']` cache invalidate → tabel refetch otomatis | `composables/useUsers.ts:52` |

### 5.3 Hapus Anggota

| Step | Pelaku | Aksi | File:Function |
|------|--------|------|---------------|
| 1 | Admin | Klik icon hapus pada baris anggota | `pages/admin/anggota/index.vue:156` |
| 2 | FE | `openDeleteModal(row.original)` | `pages/admin/anggota/index.vue:77-80` |
| 3 | FE | Modal konfirmasi terbuka | `pages/admin/anggota/index.vue:211-226` |
| 4 | Admin | Klik "Hapus" | `pages/admin/anggota/index.vue:221` |
| 5 | FE | `onConfirmDelete()` — `deleteMutation.mutateAsync(id)` | `pages/admin/anggota/index.vue:99-103` |
| 6 | FE | `fetch('/api/users/{id}', { method: 'DELETE' })` | `composables/useUsers.ts:60-63` |
| 7 | Nuxt | `getRouterParam(event, 'id')` → forward ke Go | `server/api/users/[id].delete.ts:5-22` |
| 8 | Gin | Middleware: Authenticate → AdminOnly | `router/router.go:107-108` |
| 9 | Gin | `userHandler.Delete(ctx)` — parse id | `modules/user/handler/user_handler.go:103-119` |
| 10 | Service | `userService.Delete(ctx, id)` — find + delete | `modules/user/service/user_service.go:108-117` |
| 11 | Repo | `userRepo.FindByID(id)` — verifikasi exist | `modules/user/repository/user_repository.go:48-55` |
| 12 | Repo | `userRepo.Delete(id)` → `db.Delete(&User{}, id)` (soft delete) | `modules/user/repository/user_repository.go:61-63` |
| 13 | DB | `UPDATE users SET deleted_at = NOW() WHERE id = ?` | PostgreSQL |
| 14 | Handler | `200 OK` → `BuildResponseSuccess("User deleted successfully", nil)` | `modules/user/handler/user_handler.go:117-118` |
| 15 | Nuxt | Return `res.message ?? 'Success'` | `server/api/users/[id].delete.ts:22` |
| 16 | FE | `deleteMutation.onSuccess` → toast + invalidate cache | `composables/useUsers.ts:63-69` |
| 17 | FE | `isDeleteModalOpen = false` | `pages/admin/anggota/index.vue:102` |

---

## 6. Kontrak Request/Response

### GET /users — Daftar Anggota

**Endpoint:** `/api/users` (Nuxt BFF) → `/api/v1/users` (Go API)

| Aspek | Detail |
|-------|--------|
| **Method** | `GET` |
| **Path** | `/api/users` |
| **Header wajib** | `Authorization: Bearer {access_token}` (dibaca dari cookie oleh BFF) |
| **Query params** | `page` (default 1), `limit` (default 10), `search`, `role` |

#### Response 200 — Sukses

```json
{
  "status": true,
  "message": "Users retrieved successfully",
  "data": {
    "data": [
      {
        "id": 2,
        "role": "USER",
        "username": "budi_santoso",
        "full_name": "Budi Santoso",
        "email": "budi@literasiku.test",
        "membership_number": "USR-0001",
        "identity_number": "",
        "address": null,
        "phone_number": "08234567890",
        "status": "ACTIVE",
        "created_at": "2024-01-15T10:00:00Z"
      },
      {
        "id": 3,
        "role": "USER",
        "username": "siti_rahayu",
        "full_name": "Siti Rahayu",
        "email": "siti@literasiku.test",
        "membership_number": "USR-0002",
        "identity_number": "",
        "address": null,
        "phone_number": "08345678901",
        "status": "ACTIVE",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 2,
    "total_pages": 1
  }
}
```

Response FE (`UsersResponse`):

```json
{
  "data": [
    {
      "id": 2,
      "username": "budi_santoso",
      "full_name": "Budi Santoso",
      "email": "budi@literasiku.test",
      "role": "USER",
      "membership_number": "USR-0001",
      "phone_number": "08234567890",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 2,
  "total_pages": 1
}
```

#### Response Error

| Status Code | Kondisi | Response |
|-------------|---------|----------|
| **401** | Token tidak valid / tidak ada | `{ "status": false, "message": "failed to proses request", "error": "token not found" }` |
| **403** | Bukan admin | `{ "status": false, "message": "failed to proses request", "error": "access denied: admin only" }` |
| **500** | Internal server error | `{ "status": false, "message": "Failed to get users", "error": "<detail>" }` |

---

### PATCH /users/:id — Update Anggota

**Endpoint:** `/api/users/{id}` (Nuxt BFF) → `/api/v1/users/{id}` (Go API)

| Aspek | Detail |
|-------|--------|
| **Method** | `PATCH` |
| **Path** | `/api/users/{id}` |
| **Header wajib** | `Authorization: Bearer {access_token}`, `Content-Type: application/json` |

#### Request Body

```json
{
  "full_name": "Budi Santoso Updated",
  "username": "budi_santoso",
  "email": "budi_baru@literasiku.test",
  "phone_number": "08234567890",
  "address": "Jl. Merdeka No. 1",
  "status": "ACTIVE"
}
```

Semua field bersifat opsional (`binding:"omitempty"`):

| Field | Tipe | Validasi Go | Keterangan |
|-------|------|-------------|------------|
| `full_name` | string | `min=1,max=100` | |
| `username` | string | `min=1,max=50` | |
| `email` | string | `email,max=100` | Dicek unik di service jika berubah |
| `phone_number` | string | `max=20` | |
| `address` | string | - | |
| `status` | string | `oneof=ACTIVE INACTIVE BLOCKED` | |

#### Response 200 — Sukses

```json
{
  "status": true,
  "message": "User updated successfully",
  "data": {
    "id": 2,
    "role": "USER",
    "username": "budi_santoso",
    "full_name": "Budi Santoso Updated",
    "email": "budi_baru@literasiku.test",
    "membership_number": "USR-0001",
    "identity_number": "",
    "address": "Jl. Merdeka No. 1",
    "phone_number": "08234567890",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

#### Response Error

| Status Code | Kondisi | Response |
|-------------|---------|----------|
| **400** | ID tidak valid (parse error) | `{ "status": false, "message": "Invalid user ID", "error": "strconv.ParseUint: ..." }` |
| **400** | Request body binding error | `{ "status": false, "message": "Failed to parse request", "error": "Key: 'UpdateUserRequest.Email' Error:..." }` |
| **400** | User tidak ditemukan | `{ "status": false, "message": "Failed to update user", "error": "user not found" }` |
| **400** | Email sudah dipakai user lain | `{ "status": false, "message": "Failed to update user", "error": "email already exists" }` |
| **401** | Token tidak valid | `{ "status": false, ... }` |
| **403** | Bukan admin | `{ "status": false, "error": "access denied: admin only" }` |

---

### DELETE /users/:id — Hapus Anggota

**Endpoint:** `/api/users/{id}` (Nuxt BFF) → `/api/v1/users/{id}` (Go API)

| Aspek | Detail |
|-------|--------|
| **Method** | `DELETE` |
| **Path** | `/api/users/{id}` |
| **Header wajib** | `Authorization: Bearer {access_token}` |
| **Request body** | Tidak ada |

#### Response 200 — Sukses

```json
{
  "status": true,
  "message": "User deleted successfully",
  "data": null
}
```

Response FE:
```json
{
  "success": true
}
```

#### Response Error

| Status Code | Kondisi | Response |
|-------------|---------|----------|
| **400** | ID tidak valid (parse error) | `{ "status": false, "message": "Invalid user ID", "error": "strconv.ParseUint: ..." }` |
| **400** | User tidak ditemukan | `{ "status": false, "message": "Failed to delete user", "error": "user not found" }` |
| **400** | User memiliki relasi (FK constraint) | `{ "status": false, "message": "Failed to delete user", "error": "ERROR: update or delete on table \"users\" violates foreign key constraint ..." }` |
| **401** | Token tidak valid | `{ "status": false, ... }` |
| **403** | Bukan admin | `{ "status": false, "error": "access denied: admin only" }` |

---

## 7. Error Handling & Edge Case

### Frontend

| Kondisi | Mekanisme | File:Baris | Output |
|---------|-----------|------------|--------|
| Validasi Zod gagal di form edit | `UForm` internal validation via `updateUserSchema` | `pages/admin/anggota/index.vue:178` via schema `shared/schemas/users.schema.ts` | Field error di bawah input |
| Update mutation error | `onError` callback → toast error | `composables/useUsers.ts:54-56` | Toast "Gagal memperbarui pengguna" + detail error |
| Delete mutation error | `onError` callback → toast error | `composables/useUsers.ts:67-69` | Toast "Gagal menghapus pengguna" + detail error |
| Duplikasi email dari backend | `onError` → `err?.data?.message` berisi "email already exists" | `composables/useUsers.ts:55` | Toast error dengan pesan dari API |
| User tidak ditemukan (sudah dihapus user lain) | `onError` → `err?.data?.message` berisi "user not found" | `composables/useUsers.ts:55` | Toast error |
| FK constraint saat hapus (user punya loans) | Backend return error PostgreSQL constraint | `composables/useUsers.ts:68` | Toast "Gagal menghapus pengguna" + error constraint |
| Network error (Go down) | `throwError` → `createError` | `server/utils/apiCall.ts:12-27` | Toast "Gagal terhubung ke backend utama" |

**Pola ekstraksi error message (sama di semua mutation):**
```ts
// composables/useUsers.ts:55
onError: (err: any) => {
  toast.add({ 
    title: 'Gagal memperbarui pengguna', 
    description: err?.data?.message || err.message, 
    color: 'error', 
    icon: 'i-lucide-alert-circle' 
  })
}
```

### Backend

| Kondisi | Deteksi | Response | Status |
|---------|---------|----------|--------|
| ID tidak valid (bukan angka) | `strconv.ParseUid` error | `"Invalid user ID"` | 400 |
| Body JSON tidak valid | `ctx.ShouldBindJSON` error | `"Failed to parse request"` | 400 |
| User tidak ditemukan (get/update/delete) | `gorm.ErrRecordNotFound` | `"user not found"` | 400 (get: 404) |
| Email sudah dipakai user lain | `ExistsByEmail` → count > 0 | `"email already exists"` | 400 |
| Token tidak ada/expired | Middleware `Authenticate` | `"token not found"` / `"token not valid"` | 401 |
| Bukan admin | Middleware `AdminOnly` | `"access denied: admin only"` | 403 |
| Foreign key constraint (hapus) | `db.Delete` → PostgreSQL FK error | `"Failed to delete user: ERROR: update or delete on table \"users\" violates foreign key constraint ..."` | 400 |

### Edge Cases

| Skenario | Perilaku |
|----------|----------|
| Admin menghapus dirinya sendiri | Tidak dicegah di kode — bisa terjadi. User akan kehilangan akses admin. Perlu mekanisme proteksi diri. |
| Hapus user yang memiliki peminjaman aktif | Gagal dengan FK constraint error. User harus menyelesaikan peminjaman dulu. |
| Edit email ke email yang sudah ada | Gagal di service layer dengan error "email already exists" — field `email` memiliki UNIQUE index di DB. |
| Set status admin ke BLOCKED/INACTIVE | Tidak dicegah — bisa terjadi. Admin tersebut tidak bisa login lagi. |
| Pencarian dengan string kosong | Repository mengabaikan filter search → return semua user. |
| Pencarian dengan `%` atau wildcard | `ILIKE` dengan `%search%` — aman karena parameter binding via GORM. |
| Page melebihi total | Repository return array kosong → FE render `UTable` dengan `#empty` template "Tidak ada data anggota ditemukan." |
| Dua admin membuka halaman yang sama, satu menghapus user | User yang dihapus tidak muncul di tabel admin lain setelah cache invalidate otomatis. |
| `membership_number` ikut tercari saat search | Repository mencari juga di kolom `membership_number` ILIKE — admin bisa cari berdasarkan nomor anggota. |

---

## 8. File Terkait

### Frontend (client/)

| Path | Peran |
|------|-------|
| `app/pages/admin/anggota/index.vue` | Entry point halaman daftar anggota + modal edit/hapus |
| `app/pages/admin/anggota/[id].vue` | Halaman detail anggota (masih kosong — belum diimplementasi) |
| `app/composables/useUsers.ts` | Query & mutations untuk data user |
| `app/layouts/admin.vue` | Layout admin dengan sidebar + role guard |
| `app/middleware/auth.global.ts` | Route guard — cek session cookie |
| `shared/schemas/users.schema.ts` | Zod schema `updateUserSchema` untuk validasi form edit |
| `shared/types/users.ts` | Type `UserResponse`, `UsersResponse` |
| `shared/types/api.ts` | Type `ApiResponse<T>`, `PaginatedResponse<T>` |
| `server/api/users/index.get.ts` | Nuxt BFF — GET daftar user |
| `server/api/users/[id].patch.ts` | Nuxt BFF — PATCH update user |
| `server/api/users/[id].delete.ts` | Nuxt BFF — DELETE user |
| `server/api/users/me.get.ts` | Nuxt BFF — GET profil sendiri |
| `server/api/users/me.patch.ts` | Nuxt BFF — PATCH update profil sendiri |
| `server/utils/apiCall.ts` | Utility `apiCall` + `throwError` |

### Backend (server/)

| Path | Peran |
|------|-------|
| `modules/user/dto/user_dto.go` | `UpdateUserRequest`, `UserResponse`, `PaginatedResponse` |
| `modules/user/handler/user_handler.go` | HTTP handler: `GetAll`, `GetByID`, `Update`, `Delete`, `Me`, `UpdateMe` |
| `modules/user/service/user_service.go` | Business logic: GetAll, GetByID, Update (dengan email uniqueness), Delete |
| `modules/user/repository/user_repository.go` | GORM queries: `FindAll` (search ILIKE), `FindByID`, `Update`, `Delete`, `ExistsByEmail` |
| `middlewares/authentication.go` | JWT validation middleware |
| `middlewares/rbac.go` | Admin-only RBAC middleware |
| `router/router.go` | Route definitions (baris 99-113) |
| `pkg/utils/response.go` | `BuildResponseSuccess`, `BuildResponseFailed` |
| `database/entities/user.go` | Entity `User` dengan field metadata (MembershipNumber, Status, dll) |
| `database/entities/common.go` | Embedded `Timestamp` (CreatedAt, UpdatedAt) + GORM soft delete |

---

## 9. Related Docs

| Dokumen | Link |
|---------|------|
| Project Start | `docs/project-start.md` |
| Sequence Login | `docs/sequence/login.md` |
| Sequence Register | `docs/sequence/register.md` |
| Sequence Logout | `docs/sequence/login.md` |
| Frontend Architecture | `docs/architecture.md` |

### Integrasi dengan Login & Nomor Anggota

Data anggota yang dikelola di halaman ini berasal dari dua sumber:

1. **Registrasi publik** (sequence `register.md`): User mendaftar lewat `/auth/register` → data disimpan di tabel `users` dengan `Role: "USER"` dan `Status: "ACTIVE"`. Saat registrasi, `membership_number` tidak diisi otomatis — hanya diisi saat seed data (`USR-0001`, `USR-0002`).

2. **Seed data** (dari `server/database/seeders/json/users.json`): Admin dan anggota contoh dibuat dengan `membership_number` seperti `"ADM-0001"`, `"USR-0001"`, `"USR-0002"`.

**Kaitan dengan Login:**
- Semua user (termasuk anggota) login via endpoint `POST /auth/login` yang menghasilkan JWT token
- Status user (`ACTIVE`/`INACTIVE`/`BLOCKED`) diperiksa saat login: user yang di-*block* atau di-*nonaktifkan* oleh admin tidak bisa login (mendapat 403 Forbidden)
- Admin dapat mengubah status anggota kapan saja via modal edit di halaman ini

**Nomor anggota (`membership_number`):**
- Disimpan di kolom `membership_number` tabel `users` (varchar(20), UNIQUE INDEX)
- Saat ini belum ada logika auto-generate di registrasi — hanya diisi manual via seed atau migrasi data
- Bisa dicari oleh admin melalui fitur search di halaman ini (repository mencari dengan `ILIKE` di kolom `membership_number`)
- Termasuk dalam response `UserResponse` sehingga muncul di tabel dan bisa diakses oleh admin

**Rekomendasi untuk pengembangan ke depan:**
- Tambahkan auto-generate `membership_number` saat registrasi dengan format `USR-{auto-increment}` atau `{tahun}-{urutan}`
- Proteksi agar admin tidak bisa menghapus dirinya sendiri
- Implementasi halaman detail anggota (`pages/admin/anggota/[id].vue`) yang saat ini masih kosong
- Tambahkan riwayat peminjaman anggota di halaman detail
