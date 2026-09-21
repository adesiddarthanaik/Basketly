# QuikBUY Coffee - Full-Stack E-Commerce Platform

A production-grade full-stack e-commerce web application built with **React 19**, **Node.js**, **Express 5**, **MongoDB**, and **Razorpay Payment Integration**.

---

## 🚀 Features

- 🔐 **Authentication & Authorization**: Secure JWT-based authentication with bcrypt password hashing and role-based access control (`user` vs `admin`).
- ☕ **Catalog & Discovery**: Multi-field partial substring search across names, brands, categories, and descriptions with ReDoS-safe input sanitization.
- 🎛️ **Filtering & Sorting**: Real-time category filtering (Roasted Beans, Cold Brew, Instant, Espresso), price sorting (Low-to-High, High-to-Low, Newest), and stock availability toggle.
- 🛒 **Smart Shopping Cart**: Real-time inventory bounds validation preventing over-ordering beyond available warehouse stock.
- 💳 **Razorpay Payment Gateway**: Seamless checkout modal with cryptographic HMAC-SHA256 signature verification and automatic stock deduction upon payment completion.
- 📦 **Order Tracking**: Visual step-progress timeline (`Placed` → `Paid` → `Shipped` → `Delivered`) and order history.
- 📊 **Admin Dashboard & Management Suite**:
  - Live revenue metrics, in-transit counts, and status aggregations powered by MongoDB pipelines.
  - Interactive order management table with status updating controls.
  - Product catalog CRUD operations.
- 🛡️ **Centralized Error Handling & Validation**: Custom `AppError` architecture with strict Zod request schema validation.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** & **Vite 8**
- **Tailwind CSS 4**
- **React Router DOM 7**
- **Axios** (with Bearer Token Interceptors)

### Backend
- **Node.js** & **Express 5**
- **MongoDB** & **Mongoose 9**
- **Zod** (Schema Validation)
- **JSON Web Tokens (JWT)** & **Bcrypt**
- **Razorpay SDK** & **Crypto**

---

## 📁 Project Structure

```
quickBuyCoffee/
├── backend/
│   ├── app.js                 # Express server entry point
│   ├── createAdmin.js         # Admin bootstrapping script
│   ├── middleware/
│   │   ├── adminOnly.js       # Admin role guard
│   │   ├── errorHandler.js    # Centralized error handler
│   │   ├── middleauth.js      # JWT authentication middleware
│   │   └── validate.js        # Zod request validation middleware
│   ├── models/
│   │   ├── Cart.js            # Shopping cart schema
│   │   ├── Orders.js          # Order & item snapshot schema
│   │   ├── Product.js         # Product schema with compound text index
│   │   └── User.js            # User authentication schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── cart.js            # Cart operations
│   │   ├── orders.js          # Order history & admin analytics
│   │   ├── payment.js         # Razorpay order generation & verification
│   │   └── products.js        # Product catalog, search & filtering
│   ├── utils/
│   │   └── AppError.js        # Operational error class
│   └── validators/            # Zod validation schemas
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/         # Admin dashboard, orders, and product views
│   │   │   ├── User/          # Home, Cart, Payment, and OrderPage views
│   │   │   └── auth/          # Login & Signup view
│   │   ├── services/
│   │   │   ├── api.js         # Axios instance & error interceptor
│   │   │   └── user.js        # Auth session helper utilities
│   │   ├── App.jsx            # App shell & role routing
│   │   └── main.jsx           # React root bootstrap
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or a free MongoDB Atlas URI
- **Razorpay Account**: Free test mode API key and secret

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/quikbuy
   SUPER_SECRET=your_jwt_secret_key
   CLIENT_URL=http://localhost:5173
   PORT=5000
   TEST_KEY=rzp_test_your_key_id
   TEST_SECRET=your_razorpay_secret
   ```

4. *(Optional)* Seed an initial admin user:
   ```bash
   node createAdmin.js
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5000`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env.local` configuration file:
   ```bash
   cp .env.example .env.local
   ```
   ```env
   VITE_API_URL=http://localhost:5000/
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:5173`.

---

## 📡 API Reference

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signUp` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login and receive JWT |
| `GET` | `/auth/me` | User | Get current user profile |
| `GET` | `/products` | Public | Search, filter, sort & paginate products |
| `POST` | `/products/addProduct` | Admin | Create a new coffee product |
| `GET` | `/cart` | User | Get current user's cart |
| `POST` | `/cart/add` | User | Add item to cart (with stock checks) |
| `POST` | `/cart/remove` | User | Decrement or remove item from cart |
| `POST` | `/payment/create-order` | User | Initiate Razorpay order & draft DB order |
| `POST` | `/payment/verify` | User | Verify HMAC signature & deduct inventory |
| `GET` | `/orders` | User | Get user's order history |
| `GET` | `/orders/admin/summary` | Admin | Aggregate sales & status analytics |
| `PATCH` | `/orders/:id/status` | Admin | Update shipment/delivery status |

---

## 📜 License

This project is licensed under the ISC License.
