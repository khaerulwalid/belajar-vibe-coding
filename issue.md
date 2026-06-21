# Issue: Implementasi Proses Logout User (NestJS Best Practices)

Tugas ini adalah membuat fitur logout untuk user yang saat ini sedang login di dalam sistem menggunakan JWT.

## Spesifikasi API
- **Endpoint**: `DELETE /api/users/logout`
- **Request Headers**: 
  - `Authorization: Bearer [JWT_TOKEN_STRING]`
- **Response Berhasil (200 OK)**:
  ```json
  {
      "data": "Ok"
  }
  ```
- **Response Error (401 Unauthorized)** - (Jika token tidak ada / tidak valid):
  ```json
  {
      "error": "Unauthorized"
  }
  ```

## Tahapan Implementasi (Untuk Junior Programmer / AI Model)

Ikuti langkah-langkah berikut secara berurutan:

### 1. Buat Authentication Guard (Pengecekan Token)
Buat file guard baru (misalnya `src/common/guards/auth.guard.ts` atau `src/users/auth.guard.ts`) yang mengimplementasikan `CanActivate`:
- Guard ini bertugas mengambil token dari header `Authorization`.
- Gunakan `JwtService` untuk memverifikasi token (`jwtService.verifyAsync()`).
- Jika token tidak ada di header, atau token tidak valid/kadaluarsa, lemparkan error:
  `throw new HttpException({ error: 'Unauthorized' }, HttpStatus.UNAUTHORIZED);`
- Jika valid, simpan payload user ke dalam objek request (misal: `request.user = payload`) agar bisa diakses di controller jika diperlukan, lalu kembalikan `true`.

### 2. Implementasi Service (`users.service.ts`)
- Tambahkan method `logout()` di dalam `UsersService`.
- Karena kita menggunakan JWT (stateless), proses logout di sisi server pada dasarnya cukup mengembalikan respons berhasil, dan client bertanggung jawab untuk menghapus token di sisi mereka.
- *(Opsional / Best Practice)*: Jika sistem sebelumnya dimodifikasi untuk menyimpan token aktif di tabel `users` (stateful JWT), maka pada tahap ini method `logout(userId)` harus mencari user tersebut dan mengosongkan/null field token-nya di database. Namun jika stateless, cukup kembalikan `{ data: 'Ok' }`.

### 3. Implementasi Controller (`users.controller.ts`)
- Tambahkan route baru dengan decorator `@Delete('logout')`.
- Tambahkan decorator `@HttpCode(HttpStatus.OK)` agar mengembalikan status 200 (karena default DELETE terkadang 200, namun baiknya dipertegas).
- Lindungi route ini dengan guard yang sudah dibuat menggunakan `@UseGuards(AuthGuard)`.
- Panggil method `logout()` dari `UsersService`.

### 4. Pengujian (Testing)
- Pastikan untuk menambahkan Unit Test di `users.controller.spec.ts` dan `users.service.spec.ts` untuk fungsi logout.
- Buat file / tambahkan skenario E2E Test (di `test/users.e2e-spec.ts`):
  1. Login untuk mendapatkan token.
  2. Hit `DELETE /api/users/logout` dengan token tersebut, pastikan mendapat respon `{"data": "Ok"}` dan status 200.
  3. Hit `DELETE /api/users/logout` **tanpa** token atau dengan token asal-asalan, pastikan mendapat respon `{"error": "Unauthorized"}` dan status 401.

---
**Catatan untuk Implementator:**
- Selalu patuhi payload response yang diminta secara persis. Jangan gunakan format default error NestJS jika format yang diminta spesifik seperti `{"error": "Unauthorized"}`.
- Gunakan standar Dependency Injection dan penamaan file di NestJS.
