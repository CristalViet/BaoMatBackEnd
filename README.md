# HR Management Backend

Backend Node.js cho website quan ly thong tin nhan su, tai khoan va phan quyen.

## Cong nghe

- Node.js + Express
- Prisma ORM
- SQLite de chay local nhanh
- JWT authentication
- Role-based access control

## Chuc nang da co

- Dang nhap, xem thong tin tai khoan hien tai
- Quen mat khau va dat lai mat khau
- CRUD nhan su co phan trang, tim kiem, loc phong ban
- Ho so nhan su theo tung tab:
  - thong tin co ban
  - qualifications
  - skill sheet / documents
  - emergency contact
  - self PR va thong tin cong viec
- Quan ly tai khoan dang nhap
- Quan ly role va permission
- Seed du lieu mau cho admin

## Chay du an

```bash
npm install
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Server mac dinh chay tai `http://localhost:4000`.

## Tai khoan seed

- Email: `admin@exection.co.jp`
- Password: `Admin@123`

## API chinh

- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees`
- `PATCH /api/employees/:id`
- `POST /api/employees/:id/qualifications`
- `POST /api/employees/:id/documents`
- `PUT /api/employees/:id/emergency-contact`
- `GET /api/accounts`
- `POST /api/accounts`
- `PATCH /api/accounts/:id`
- `GET /api/roles`
- `POST /api/roles`
- `GET /api/permissions`

## Goi y mapping voi giao dien

- Man hinh login -> `POST /api/auth/login`
- Man hinh quen mat khau / reset -> `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- Danh sach nhan su list/card -> `GET /api/employees`
- Trang profile nhan su -> `GET /api/employees/:id`
- Popup them user -> `POST /api/employees`, `POST /api/accounts`
- Phan quyen -> `GET /api/roles`, `POST /api/roles`, `PATCH /api/accounts/:id`
