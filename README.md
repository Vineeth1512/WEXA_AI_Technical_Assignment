# StockFlow – Multi-Tenant SaaS Inventory Management System

StockFlow is a minimal, multi-tenant SaaS inventory management platform built as a technical assessment MVP. It empowers small-to-medium businesses to track inventory, set custom or organization-wide low-stock alerts, and gain instant visibility into stock health via a clean dashboard.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (v18) with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios with JWT interceptors
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize v6
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing

---

## 📂 Repository Structure

```text
stockflow/
├── backend/               # Express REST API & Sequelize ORM
│   ├── src/
│   │   ├── config/        # DB connection configuration
│   │   ├── controllers/   # Request handlers (auth, products, dashboard, settings)
│   │   ├── middleware/    # Auth, tenant isolation, error handling
│   │   ├── models/        # Sequelize models (Organization, User, Product)
│   │   ├── routes/        # Express route definitions
│   │   ├── app.js         # Express app initialization
│   │   └── server.js      # Server bootstrapper
│   └── package.json
├── frontend/              # React + Vite + Tailwind CSS SPA
│   ├── src/
│   └── package.json
└── README.md
```

---

## 🚀 Setup & Local Development

Detailed setup instructions will be updated progressively as each phase is completed.

