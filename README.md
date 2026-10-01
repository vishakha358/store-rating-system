# StoreRate - FullStack Store Rating Platform

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748.svg)](https://www.prisma.io/)

A production-ready full-stack web application developed for the **FullStack Intern Coding Challenge**. The platform allows registered users to browse registered stores, submit ratings (1 to 5 stars), and modify their existing ratings. It features a unified single login system that routes users based on their role: **System Administrator**, **Normal User**, or **Store Owner**.

---

## 🌟 Live Demo & Repository

- **GitHub Repository**: [https://github.com/vishakha358/store-rating-system](https://github.com/vishakha358/store-rating-system)
- **Live Public URL**: Hosted via Render / Vercel (see [Deployment Guide](#-deployment-guide) below)

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js with TypeScript, REST architecture, modular routes, controllers, and middleware.
- **ORM & Database**: Prisma ORM with automated multi-database support:
  - **SQLite**: Local zero-configuration execution out of the box (`file:./dev.db`).
  - **PostgreSQL**: Production-ready managed cloud database (e.g. Render, Neon, Supabase).
  - **MySQL**: Fully compatible via environment variable.
- **Frontend**: React 19 + TypeScript powered by Vite, Tailwind CSS for sleek responsive UI, Lucide React icons.
- **Authentication**: Stateless JSON Web Token (JWT) authentication with bcrypt password hashing (`saltRounds = 10`).
- **Validation**: Strict schema validation using Zod on backend and real-time client-side validator utilities on the frontend.

---

## 👥 User Roles & Features

### 1. System Administrator (`ADMIN`)
- **Dashboard Overview**: Real-time platform metrics:
  - Total number of users
  - Total number of stores
  - Total number of submitted ratings
- **User Management**:
  - Add new users (Admin, Normal User, Store Owner) with Name, Email, Password, Address, and Role.
  - View list of all users with Name, Email, Address, and Role.
  - If a user is a **Store Owner**, their store name and rating are automatically computed and displayed!
  - Filter users by Name, Email, Address, and Role.
  - Sort user table ascending/descending by Name, Email, Address, Role, and Rating.
  - Detailed modal view for each user profile.
- **Store Management**:
  - Add new stores with Name, Email, Address, and optional assigned Store Owner.
  - View list of all stores with Name, Email, Address, and Overall Rating.
  - Filter stores by Name, Email, and Address.
  - Sort store table ascending/descending by Name, Email, Address, and Rating.
- **Security**: Log out from the system.

### 2. Normal User (`USER`)
- **Registration & Authentication**:
  - Dedicated sign-up form with live field validation.
  - Universal single login system.
- **Password Management**:
  - Update password after logging in (with old password verification and password policy checks).
- **Store Directory & Rating**:
  - View all registered stores.
  - Search stores by Store Name and Address.
  - Sort stores by Name, Address, and Overall Rating.
  - View Overall Rating (average score & total ratings count).
  - View User's Submitted Rating (e.g. "Not rated yet" or "5 / 5 ★").
  - Submit ratings (between 1 to 5 stars) for individual stores.
  - Modify their submitted rating at any time.
- **Security**: Log out from the system.

### 3. Store Owner (`STORE_OWNER`)
- **Authentication & Security**:
  - Universal single login system.
  - Update password after logging in.
- **Store Dashboard**:
  - Displays store profile: Name, Email, Address.
  - View overall average rating of their store with star ratings and total reviews count.
  - Rating distribution breakdown bars (count and percentage for 5★, 4★, 3★, 2★, 1★).
  - View complete list of customers who rated their store:
    - Customer Name
    - Customer Email
    - Customer Address
    - Rating submitted (1 to 5 stars)
    - Date submitted
  - Search customer reviews by Name or Email.
  - Sort customer reviews ascending/descending by Name, Email, Rating, and Date.
- **Security**: Log out from the system.

---

## 🔒 Form Validations Enforced

Both frontend and backend strictly adhere to the challenge rules:

| Field | Rule | Regex / Validation |
| :--- | :--- | :--- |
| **Name** | Min 20 characters, Max 60 characters | `len >= 20 && len <= 60` |
| **Address** | Max 400 characters, required | `len >= 1 && len <= 400` |
| **Password** | 8-16 characters, ≥1 uppercase, ≥1 special character | `/^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,16}$/` |
| **Email** | Standard email validation rules | RFC 5322 compliant regex / Zod `.email()` |
| **Rating** | Integer between 1 and 5 | `Number.isInteger(r) && r >= 1 && r <= 5` |

---

## 🔑 Pre-seeded Demo Accounts

Use these accounts to test each role immediately (the login page also includes quick 1-click autofill buttons):

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `Admin@12345` | Full administrative control, statistics, user/store creation & filtering |
| **Store Owner** | `john.vance@storeowner.com` | `Owner@12345` | Owner of *Downtown Premium Artisan Bakery & Cafe* (ratings & breakdown) |
| **Store Owner** | `eleanor.sterling@storeowner.com` | `Owner@12345` | Owner of *Apex Electronics Superstore Central* |
| **Store Owner** | `marcus.davenport@storeowner.com` | `Owner@12345` | Owner of *Heritage Books & Literary Corner* |
| **Normal User** | `benjamin.hayes@example.com` | `User@12345` | Normal user with existing store ratings |
| **Normal User** | `samantha.miller@example.com` | `User@12345` | Normal user |

---

## 💻 Local Setup & Execution

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+ recommended)

### 1. Clone the repository
```bash
git clone https://github.com/vishakha358/store-rating-system.git
cd store-rating-system
```

### 2. Install dependencies
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 3. Initialize & Seed Database
```bash
npm --prefix backend run prisma:push
npm --prefix backend run prisma:seed
```

### 4. Start Development Servers
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server | `5000` |
| `DATABASE_URL` | Database connection string | `file:./dev.db` (or `postgresql://...`) |
| `JWT_SECRET` | Secret key for signing JWT tokens | Random string / 32 bytes hex |
| `JWT_EXPIRES_IN`| Token expiration timeframe | `7d` |
| `CORS_ORIGIN` | Allowed origins for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Frontend (`frontend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for API requests | `/api` (or `https://your-backend.onrender.com/api`) |

---

## 🔗 How Frontend & Backend Connect

1. **In Development**:
   - The React frontend runs on Vite at `http://localhost:5173`.
   - The Vite dev server proxies requests starting with `/api` directly to `http://localhost:5000`.
2. **In Production**:
   - Express hosts the REST API endpoints at `/api/*`.
   - Express serves the compiled static production build (`frontend/dist`) for all standard routes (`/`, `/login`, `/admin`, etc.) with client-side SPA fallback.
   - Alternatively, if frontend is hosted separately on Vercel, requests to `/api` are routed to the deployed backend URL configured via `VITE_API_URL`.

---

## 🚀 Deployment Guide

### Option 1: 1-Click Render Deployment (Recommended)
This repository includes a `render.yaml` Blueprint that automatically provisions both the Web Service and a free PostgreSQL database on Render:
1. Log in to [Render](https://render.com/).
2. Click **New +** -> **Blueprint**.
3. Select your repository `vishakha358/store-rating-system`.
4. Render will detect `render.yaml` and automatically:
   - Create a free PostgreSQL instance (`store-rating-postgres`).
   - Link `DATABASE_URL` automatically.
   - Run `npm run build`, `prisma:push`, and `prisma:seed`.
   - Launch the application with an instant HTTPS URL!

### Option 2: Vercel (Frontend) + Render (Backend)
1. Deploy `backend` as a Web Service on Render with environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
2. Deploy `frontend` on Vercel with Root Directory set to `.` and Environment Variable:
   ```env
   VITE_API_URL="https://your-backend.onrender.com/api"
   ```
