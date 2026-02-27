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

# Team2-BE