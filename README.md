# NestJS Blog API

A scalable and type-safe RESTful API for a blogging platform built using **NestJS**, **PostgreSQL**, and **Prisma**. This backend includes modular features like authentication, user management, profile handling, post CRUD, image upload, validation, and error handling.

---

## 🚀 Tech Stack

- **Backend Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod + Global Pipes
- **Authentication**: JWT (Access Token)
- **File Uploads**: Multer (local disk storage)
- **API Docs**: Swagger (auto-generated)
- **Error Handling**: Global Filters (HTTP, Zod, Prisma)

---

## 📂 Features

### ✅ Authentication
- Register (with optional image)
- Login (returns access token)
- Forgot / Reset Password (email-based link with token)
- Change Password (authenticated)

### 👤 User Profile
- View own profile
- Update name/email
- Upload/change profile picture

### 🧑‍💼 Admin
- View all users
- View individual user
- Create, update, or delete users
- Assign roles (user/admin)

### ✍️ Blog Posts
- Create a post (with optional image)
- Get all or single post
- Update or delete own posts

---

## 🛡️ Protected Routes

- All user and post actions require a valid JWT.
- Admin routes are restricted to `admin` role only.
- Global `JwtAuthGuard` and `RolesGuard` used.

---

## 🧪 Validation

- Zod-based validation schemas for every request (`body`, `params`, `query`)
- Global Zod Validation Pipe handles schema errors

---

## 📁 Project Structure

```
nestjs-psql-api-project/
├── src/
│   ├── auth/          # Auth module (login/register/reset)
│   ├── user/          # Admin-only user mgmt
│   ├── profile/       # Profile update & view
│   ├── post/          # Post CRUD
│   ├── common/        # DTOs, filters, pipes, interceptors
│   ├── prisma/        # Prisma client + service
│   └── main.ts        # App entry point
```

---

## 🔐 Environment Variables

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

---

## 📦 Setup & Run

```bash
git clone https://github.com/Vishvjeet-Rana/nestjs-psql-api-project.git
cd nestjs-psql-api-project
npm install

# setup db
npx prisma migrate dev --name init
npx prisma generate

# start dev server
npm run start:dev
```

---

## 📑 API Documentation

Swagger is available at `/docs` after running the project.

---

## 🧑 Author

Built with care by [Vishvjeet Rana](https://x.com/RVishvjeet_/)
