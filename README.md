# Simple ERP Management System (MERN Stack)

A simple, modern, secure, and scalable Enterprise Resource Planning (ERP) web application built using the MERN stack with strict role-based access control (RBAC), JWT authentication, and comprehensive administrative audit logging.

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React.js 19 (powered by Vite)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **API Client**: Axios (with centralized interceptors & HttpOnly cookie support)
- **State Management**: Context API (`AuthContext`, `ToastContext`)
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose (with embedded zero-config fallback)
- **Authentication**: JSON Web Token (JWT) + bcrypt password hashing
- **Security**: Helmet, CORS with credentials, express-rate-limit, HttpOnly cookies
- **Validation**: Zod schema middleware
- **Architecture**: Modular Controller-Service-Model design with Audit Logging

---

## 👥 User Roles & Access Matrix

| Feature / Permission | Super Admin | Admin |
| :--- | :---: | :---: |
| Login to Dedicated Dashboard | ✅ | ✅ |
| System Statistics & Metrics | ✅ | ❌ |
| Create New Admin Accounts | ✅ | ❌ |
| View All Registered Admins | ✅ | ❌ |
| Search, Filter & Sort Admins | ✅ | ❌ |
| Edit Admin Details | ✅ | ❌ |
| Activate / Deactivate Admin Accounts | ✅ | ❌ |
| Reset Admin Passwords | ✅ | ❌ |
| Delete Admin Accounts | ✅ | ❌ |
| View System Audit Activity | ✅ | ❌ |
| View & Update Own Profile | ✅ | ✅ |
| Change Own Password | ✅ | ✅ |
| Inactive Account Blocking | Enforced | Enforced |

---

## 🔐 Security Features

1. **Password Protection**: Plain-text passwords are never stored. Passwords are salted and hashed using `bcrypt` (10 rounds).
2. **Hash Shielding**: The User model utilizes a `toJSON` transformation that strips `password` and internal fields (`__v`) from all database query results before sending API responses.
3. **Session Management**: JWT access tokens are set in `HttpOnly`, `SameSite: Lax` cookies (with Authorization header fallback for automated testing and tools).
4. **Backend Role Authorization**: Permissions are checked server-side via `authorize('SUPER_ADMIN')` middleware, preventing privilege escalation.
5. **Inactive User Lockout**: Deactivated admins are immediately blocked from logging in.
6. **Account Protection**: Super Admin accounts cannot be deleted, demoted, or deactivated through the Admin CRUD APIs.
7. **Rate Limiting**: IP-based rate limiting on login routes (15 attempts / 15 minutes) protects against brute force attacks.
8. **Audit Trail**: Key administrative events (Admin creation, updates, password resets, status changes, deletions, and login attempts) are recorded in the `AuditLog` collection.

---

## 📁 Project Architecture

```
ERP machine test/
├── backend/
│   ├── config/              # Centralized env and DB connectivity
│   │   ├── env.js
│   │   └── db.js
│   ├── controllers/         # HTTP request/response handling
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   └── profileController.js
│   ├── middleware/          # Security, Auth, Validation, Error Handling
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validateMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── models/              # Mongoose data schemas
│   │   ├── User.js
│   │   └── AuditLog.js
│   ├── routes/              # Express API route declarations
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── profileRoutes.js
│   │   └── index.js
│   ├── services/            # Core business logic & database queries
│   │   ├── authService.js
│   │   ├── adminService.js
│   │   ├── profileService.js
│   │   └── auditService.js
│   ├── validators/          # Zod input validation schemas
│   │   ├── authValidators.js
│   │   ├── adminValidators.js
│   │   └── profileValidators.js
│   ├── scripts/             # Initial seeding scripts
│   │   └── seedSuperAdmin.js
│   ├── tests/               # Automated test suite
│   │   └── api.test.js
│   ├── server.js            # Express server entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/common/ # Reusable UI components
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/         # AuthContext and ToastContext
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── layouts/         # Page layouts
│   │   │   ├── AuthLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/           # Application views
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SuperAdminDashboard.jsx
│   │   │   ├── AdminListPage.jsx
│   │   │   ├── CreateAdminPage.jsx
│   │   │   ├── EditAdminPage.jsx
│   │   │   ├── AdminDetailsPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ChangePasswordPage.jsx
│   │   │   ├── UnauthorizedPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── routes/          # Role-based protected routes
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/        # Axios API service callers
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── adminService.js
│   │   │   └── profileService.js
│   │   ├── utils/           # Constants and helpers
│   │   ├── App.jsx          # Root application component
│   │   ├── main.jsx         # React DOM mount point
│   │   └── index.css        # Tailwind CSS imports
│   ├── vite.config.js       # Vite configuration with proxy
│   └── package.json
│
├── package.json             # Root workspace runner
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- *(Optional)* Local or Atlas MongoDB instance (The backend includes an automatic embedded in-memory MongoDB runner so the application can run out-of-the-box without manual MongoDB setup).

### 1. Installation

From the project root:

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Configuration

The backend is pre-configured with a `.env` file:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/erp_management
JWT_SECRET=super_secret_erp_jwt_key_2026_production_grade
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173

# Initial Super Admin Seed Credentials
SUPER_ADMIN_NAME=Super Administrator
SUPER_ADMIN_EMAIL=superadmin@erp.com
SUPER_ADMIN_PHONE=+1234567890
SUPER_ADMIN_PASSWORD=SuperAdmin@123456
```

### 3. Database Seeding

Seed the initial Super Admin account:

```bash
npm run seed
# or: cd backend && npm run seed
```

Default credentials:
- **Email**: `superadmin@erp.com`
- **Password**: `SuperAdmin@123456`

### 4. Running the Application

You can start both backend and frontend concurrently from the root directory:

```bash
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1: Backend (http://localhost:5001)
cd backend && npm run dev

# Terminal 2: Frontend (http://localhost:5173)
cd frontend && npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Running Automated Tests

Run the full backend integration and security test suite:

```bash
npm test
# or: cd backend && npm test
```

The test suite validates:
- Super Admin seeding
- Super Admin authentication
- Password hash withholding in responses
- Unauthorized access rejection
- Admin account CRUD lifecycle
- Duplicate email prevention
- Search, pagination, and sorting
- Status activation/deactivation and lockout verification
- Role authorization rejection (Admins blocked from Super Admin routes)
- Admin profile update and password change
- Super Admin account deletion prevention
- Dashboard statistics calculation

---

## 📡 Backend API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate with email & password (rate-limited)
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/auth/me` - Get authenticated user profile
- `POST /api/auth/change-password` - Update current user's password

### Super Admin (Requires `SUPER_ADMIN` Role)
- `GET /api/admins/stats` - Dashboard metrics & audit activities
- `POST /api/admins` - Create a new Admin account
- `GET /api/admins` - List Admins (supports `?search=`, `?status=`, `?page=`, `?limit=`, `?sortBy=`, `?sortOrder=`)
- `GET /api/admins/:id` - Get single Admin by ID
- `PUT /api/admins/:id` - Update Admin details
- `PATCH /api/admins/:id/status` - Activate / Deactivate Admin account
- `PATCH /api/admins/:id/reset-password` - Reset Admin password
- `DELETE /api/admins/:id` - Delete Admin account

### Admin / Profile
- `GET /api/profile` - Retrieve own profile
- `PUT /api/profile` - Update own name and phone

---

## 🔮 Future Modules Roadmap

The modular controller-service-model architecture allows straightforward expansion for upcoming ERP modules:
- Employee Management
- Attendance Management
- Leave Management
- Payroll Management
- Task Management
- Project Management
- Customer Management (CRM)
- Inventory Management
- Reports & Analytics
- Dynamic Role & Permission Builder
