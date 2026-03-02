## Backend Team2-BE

### Yêu cầu

- **Node.js**: v18+ (khuyến nghị)
- **Yarn**: đang dùng `yarn@4.x` (theo `package.json`)
- **MongoDB**: đang chạy trên máy, URI mặc định `mongodb://127.0.0.1:27017/team2_db`

### 1. Cài dependency

Trong thư mục dự án `Team2-BE`:

```bash
yarn install
```

### 2. Cấu hình biến môi trường

Tạo (hoặc chỉnh sửa) file `.env` ở thư mục gốc backend:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/team2_db
JWT_SECRET=super-secret-key
PORT=3000
```

> Bạn có thể đổi `MONGO_URI`, `JWT_SECRET`, `PORT` theo môi trường của bạn.

### 3. Khởi động backend

Trong thư mục `Team2-BE`, chạy:

```bash
yarn dev
```

Nếu chạy thành công, trong terminal sẽ hiện:

- `MongoDB connected`
- `Backend running on http://localhost:3000`

### 4. Kiểm tra nhanh backend

- Mở trình duyệt hoặc Postman, gọi:
  - **GET** `http://localhost:3000/api/health` → nhận `{ "status": "ok" }`.
- Nếu không nhận được phản hồi như trên, xem lại log terminal để kiểm tra lỗi kết nối MongoDB hoặc lỗi cấu hình `.env`.

---

## API Endpoints

Base URL: `http://localhost:3000/api` (trừ khi đổi `PORT`).

### Auth (`/api/auth`)

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| POST | /auth/register | Đăng ký (body: fullName, email, password, role) | — |
| POST | /auth/login | Đăng nhập (body: email, password, role?) | — |
| GET | /auth/me | Lấy thông tin user hiện tại | Bearer |
| PUT | /auth/me | Cập nhật profile (body: fullName?, email?) | Bearer |

### Jobs (`/api/jobs`)

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| GET | /jobs | Danh sách tin (query: page, limit, search, status) | — |
| GET | /jobs/my/list | Tin của recruiter đăng nhập | Recruiter |
| GET | /jobs/:id | Chi tiết một tin | — |
| POST | /jobs | Tạo tin (recruiter) | Recruiter |
| PUT | /jobs/:id | Cập nhật tin | Recruiter (chủ tin) |
| DELETE | /jobs/:id | Xóa tin | Recruiter (chủ tin) |
| GET | /jobs/:id/stats | Thống kê tin (số đơn, theo trạng thái) | Recruiter (chủ tin) |
| POST | /jobs/:id/save | Lưu tin (student) | Student |
| DELETE | /jobs/:id/save | Bỏ lưu tin | Student |

### Applications (`/api/applications`)

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| GET | /applications/me | Đơn đã apply + tin đã lưu của student | Student |
| POST | /applications | Nộp đơn (body: jobId, cvId?, coverLetter?) | Student |
| GET | /applications/by-job/:jobId | Danh sách ứng viên của tin | Recruiter (chủ tin) |
| GET | /applications/by-job/:jobId/:applicantId | Chi tiết một đơn/CV ứng viên | Recruiter (chủ tin) |
| PATCH | /applications/:id | Cập nhật trạng thái (body: status) | Recruiter (chủ tin) |

### CVs (`/api/cvs`)

| Method | Path | Mô tả | Auth |
|--------|------|--------|------|
| GET | /cvs/me | Danh sách CV của student | Student |
| POST | /cvs | Thêm CV (body: name, fileUrl?, isDefault?) | Student |
| PUT | /cvs/:id | Cập nhật CV / đặt mặc định | Student |
| DELETE | /cvs/:id | Xóa CV | Student |

# Team2-BE