# StockFlow – Multi-Tenant SaaS Inventory Management System

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20TailwindCSS-6366f1?style=flat-square)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-4f46e5?style=flat-square)](https://expressjs.com)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20Mongoose-10b981?style=flat-square)](https://mongoosejs.com)
[![Testing](https://img.shields.io/badge/Tests-22%2F22%20Passing%20(100%25)-emerald?style=flat-square)](https://github.com/Vineeth1512/WEXA_AI_Technical_Assignment)
[![License](https://img.shields.io/badge/License-ISC-slate?style=flat-square)](LICENSE)

StockFlow is a production-ready, minimal, multi-tenant SaaS Inventory Management System engineered for small-to-medium businesses. Built as a high-standard technical assessment MVP, it delivers robust tenant data isolation, real-time stock tracking, dynamic low-stock alerting, and automated regression testing.

---

## 🔗 Live Application Links & Credentials

| Resource | URL / Details |
| :--- | :--- |
| **Live Frontend Application (Vercel)** | [https://wexa-ai-technical-assignment.vercel.app](https://wexa-ai-technical-assignment.vercel.app) *(or your deployed Vercel domain)* |
| **Live Backend API (Render)** | [https://stockflow-backend.onrender.com/api/health](https://stockflow-backend.onrender.com/api/health) |
| **GitHub Repository** | [https://github.com/Vineeth1512/WEXA_AI_Technical_Assignment](https://github.com/Vineeth1512/WEXA_AI_Technical_Assignment) |
| **Demo Account Email** | `demo@stockflow.io` |
| **Demo Account Password** | `password123` |
| **Quick Evaluation** | Click **"⚡ Quick Fill Demo Credentials"** on the login page for 1-click access. |

---

## ✨ Key Features

1. **Multi-Tenant SaaS Architecture**:
   - Organization-level data isolation.
   - When a user signs up, the system provisions an **Organization** record and links the administrative **User** record in a single transaction.
   - **Cross-Tenant SKU Isolation**: Two different organizations can use the same SKU (e.g. `TECH-001`) without collision via compound indexing `{ organization_id: 1, sku: 1 }`.
   - **Zero-Trust Client Rule**: The backend strictly derives tenant context from cryptographically verified JWT tokens, completely ignoring client-supplied tenant IDs.

2. **Inventory Management (CRUD & Search)**:
   - Add, view, edit, and delete products.
   - Real-time case-insensitive search by product name or SKU.
   - Defensive delete confirmation modal preventing accidental data loss.

3. **Dynamic Low-Stock Calculation**:
   - Evaluated via the **Effective Threshold Rule**:
     $$\text{Effective Threshold} = \begin{cases} \text{Product.low\_stock\_threshold}, & \text{if explicitly set} \\ \text{Organization.default\_low\_stock\_threshold}, & \text{fallback (default: 5)} \end{cases}$$
   - Flagged when: $\text{Quantity} \le \text{Effective Threshold}$.

4. **Real-Time KPI Dashboard**:
   - Metric cards: Total Distinct Products, Total Physical Units, Low Stock Alert Count, and Default Threshold.
   - Actionable low-stock table with direct 1-click **Restock** shortcuts.
   - Healthy inventory state display when no items require restocking.

5. **Organization Settings**:
   - Configure global default low-stock alert thresholds.
   - Updating the organization setting dynamically recalculates low-stock flags across all products and the dashboard without a page reload.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js 18 (SPA)
- **Tooling**: Vite 5
- **Styling**: Tailwind CSS v3
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **HTTP Client**: Axios with Bearer JWT Interceptors
- **State Management**: React Context API (`AuthContext`)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ODM**: Mongoose v8
- **Database**: MongoDB Atlas (Cloud Hosted)
- **Security**: bcryptjs (password hashing, 10 salt rounds), JSON Web Tokens (JWT)
- **Testing**: Native automated E2E regression test runner (`npm test`)

---

## 📂 Project Directory Structure

```text
WEXA_AI_Technical_Assignment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Mongoose connection & pooling
│   │   │   └── testDb.js            # Standalone connection test (npm run test:db)
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, current user profile
│   │   │   ├── dashboardController.js # Aggregations & low-stock calculations
│   │   │   ├── productController.js # CRUD & search operations
│   │   │   └── settingsController.js # Organization preferences & threshold
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT verification & tenant isolation
│   │   ├── models/
│   │   │   ├── Organization.js      # Tenant schema
│   │   │   ├── User.js              # User schema with bcrypt & toJSON security
│   │   │   ├── Product.js           # Product schema with compound SKU index
│   │   │   └── index.js             # Unified model export
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth
│   │   │   ├── dashboardRoutes.js   # /api/dashboard
│   │   │   ├── productRoutes.js     # /api/products
│   │   │   └── settingsRoutes.js    # /api/settings
│   │   ├── utils/
│   │   │   └── jwt.js               # Token signing & verification
│   │   ├── testE2E.js               # 22-step automated regression test suite
│   │   ├── app.js                   # Express app definition & CORS configuration
│   │   └── server.js                # Server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx   # Auth guard redirecting to /login
│   │   │   └── PublicRoute.jsx      # Guest guard redirecting to /
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global user, token, & tenant state
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx       # Sidebar, Topbar, Responsive Layout
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Sign-in form with demo autofill
│   │   │   ├── Signup.jsx           # Org registration with confirm password
│   │   │   ├── Dashboard.jsx        # 4 KPI cards & low-stock table
│   │   │   ├── Products.jsx         # Product catalog table, search, delete modal
│   │   │   ├── ProductForm.jsx      # Dual-mode create/edit form
│   │   │   ├── Settings.jsx         # Org preferences & default threshold
│   │   │   └── NotFound.jsx         # 404 catch-all
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with auth interceptor
│   │   ├── utils/
│   │   │   └── formatters.js        # Currency & number helpers
│   │   ├── App.jsx                  # Route tree configuration
│   │   ├── index.css                # Tailwind directives
│   │   └── main.jsx
│   ├── vercel.json                  # SPA rewrite configuration
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore                       # Protects .env, node_modules, dist/
└── README.md
```

---

## 📡 REST API Reference

All protected endpoints require the HTTP header:  
`Authorization: Bearer <token>`

### Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new Organization & User. Returns JWT token. |
| `POST` | `/api/auth/login` | Public | Authenticate user. Returns JWT token. |
| `GET` | `/api/auth/me` | Private | Returns authenticated user profile and organization details. |

### Products (Tenant Isolated)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/products` | Private | Create a product scoped to authenticated organization. |
| `GET` | `/api/products` | Private | List all organization products (supports `?search=query`). |
| `GET` | `/api/products/:id` | Private | Get single product (returns 404 if belonging to another tenant). |
| `PUT` | `/api/products/:id` | Private | Update product attributes and stock levels. |
| `DELETE` | `/api/products/:id` | Private | Delete product (scoped strictly to authenticated tenant). |

### Dashboard & Analytics
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Private | Aggregated KPIs: total products, total units, low stock count & table. |

### Organization Settings
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/settings` | Private | Get organization default low-stock threshold and profile. |
| `PUT` | `/api/settings` | Private | Update organization default threshold and profile. |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Active MongoDB connection (Local or MongoDB Atlas)

### 1. Clone Repository
```bash
git clone https://github.com/Vineeth1512/WEXA_AI_Technical_Assignment.git
cd WEXA_AI_Technical_Assignment
```

### 2. Configure Backend
```bash
cd backend
npm install
```

Create `backend/.env` (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Verify database connectivity:
```bash
npm run test:db
```

Start backend development server:
```bash
npm run dev
```

### 3. Configure Frontend
Open a new terminal:
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend development server:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

StockFlow includes a complete 22-step integration test runner that tests live API routes, authentication, multi-tenancy boundaries, and metric calculations.

To run the automated suite:
```bash
cd backend
npm test
```

### Test Coverage Highlights:
- ✅ Authentication: registration, login, 409 duplicate email, 401 invalid credentials.
- ✅ Route Protection: 401 on missing token, 200 on valid Bearer token.
- ✅ Product CRUD: creation, updating, deletion, regex search filtering.
- ✅ Multi-Tenant Isolation: Same SKU allowed across different organizations; cross-tenant read/delete access rejected with 404.
- ✅ Real-Time Analytics: Accurately computes stock shortfall and updates dynamically when organization settings change.

---

## 🛡 Security Architecture

1. **Password Security**: Passwords hashed using `bcryptjs` with 10 salt rounds. Plaintext passwords never hit the database.
2. **Credential Sanitization**: The `User` Mongoose schema overrides `toJSON()` to strip `password_hash` before any JSON serialization, guaranteeing hashes are never leaked over HTTP.
3. **Stateless JWT Authorization**: Stateless authentication allows horizontal scaling. Each token contains `{ userId, organizationId }` for $O(1)$ tenant resolution.
4. **Information Leak Mitigation**: Attempting to query or delete another tenant's product returns `404 Not Found` rather than `403 Forbidden`, preventing attacker ID enumeration.
5. **CORS Hardening**: Strict origin whitelisting ensures only trusted frontend domains can access the API with credentials.

---

## 👤 Author
- **Developer**: Vineeth Gumma
- **GitHub**: [@Vineeth1512](https://github.com/Vineeth1512)
