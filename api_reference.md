# 🚀 CampusGig Complete API Reference

**Base URL**: `https://gigs-ugkz.onrender.com/api/v1/`
**System Setup Base URL**: `https://gigs-ugkz.onrender.com/api/setup/`

All responses follow a consistent JSON structure using `status`, `message`, and `data` fields.

---

## 🛠️ System Setup & Maintenance
*Used for initial deployment on Render and for generating demo data.*

### One-Time Superuser Setup
- **URL**: `POST /api/setup/superuser/`
- **Method**: `POST`
- **Access**: Public (One-shot)
- **Request Body**:
  ```json
  {
    "setup_key": "1234567qwer",
    "email": "admin@campusgig.com",
    "password": "AdminPassword123",
    "full_name": "Global Admin"
  }
  ```
- **Purpose**: Creates the first admin account when CLI is unavailable. Only works if no superuser exists.

### Data Wiping & Reseeding (Demo Generator)
- **URL**: `POST /api/setup/reseed/`
- **Method**: `POST`
- **Access**: Public
- **Request Body**: `{"setup_key": "1234567qwer"}`
- **Purpose**: Clears all current data and injects a fresh set of Students, Departments, and Tasks for presentation.

---

## 🔑 Auth

### Register
- **URL**: `/auth/register/` | **Method**: `POST` | **Access**: Public
- **Body**:
  | Field | Type | Required | Note |
  |-------|------|----------|---------|
  | `email` | String | Yes | Unique |
  | `password` | String | Yes | |
  | `full_name` | String | Yes | |
  | `role` | String | Yes | `student`, `department`, or `admin` |
  | `admin_registration_key` | String | If role=admin | `1234567qwer` |

### Login
- **URL**: `/auth/login/` | **Method**: `POST` | **Access**: Public
- **Body**: `{"email": "...", "password": "..."}`
- **Success Response**: Returns JWT `access` and `refresh` tokens + user `role`.

---

## 👤 Profile

### Get Current Profile
- **URL**: `/profile/me/` | **Method**: `GET`
- **Returns**: Core user details + role-specific profile (Student or Dept).

### Update Bank Details
- **URL**: `/profile/bank-details/` | **Method**: `PUT` | **Access**: Student Only
- **Body**: `{"bank_name": "...", "account_number": "...", "account_name": "..."}`

---

## 📋 Tasks

### List Open Tasks
- **URL**: `/tasks/` | **Method**: `GET` | **Access**: Student Only
- **Query Params**: `reward_min`, `reward_max`, `deadline`

### Create Task
- **URL**: `/tasks/` | **Method**: `POST` | **Access**: Department Only
- **Body**: `{"title": "...", "description": "...", "deadline": "...", "reward_amount": "..."}`

---

## ⚖️ Hybrid Dispute System
*This replaces the legacy dispute resolution with a secure, role-based workflow.*

### 1. Raise Dispute
- **URL**: `/tasks/<id>/raise-dispute/` | **Method**: `POST`
- **Access**: Student or Task Poster
- **Initial Status**: `pending`

### 2. Department Response (Evidence)
- **URL**: `/tasks/disputes/<id>/respond/` | **Method**: `POST`
- **Access**: Department Only (Poster)
- **Body**: `{"dept_response": "..."}`
- **Status After**: Automatically moves to `in_review`.

### 3. Admin Resolution (Final Call)
- **URL**: `/admin/disputes/<id>/resolve/` | **Method**: `POST`
- **Access**: Admin Only
- **Body**: `{"decision": "student", "admin_notes": "..."}`
- **Outcomes**: 
  - `student`: Wallet credited + Task `completed`.
  - `department`: Task `cancelled`.

---

## 💰 Wallet & Notifications

### Wallet Details
- **Balance**: `GET /wallet/balance/`
- **Transactions List**: `GET /wallet/transactions/`

### Notifications
- **List All**: `GET /notifications/`
- **Mark as Read**: `POST /notifications/<id>/read/`

---

## 🛡️ Admin Utilities

### Delete User Account
- **URL**: `/admin/users/<id>/` | **Method**: `DELETE` | **Access**: Admin Only
- **Purpose**: Removes a user account from the system (Admin only).

---

## 📌 Quick Reference Table

| Method | URL | Access | Purpose |
|:-------|:----|:-------|:--------|
| `POST` | `/api/setup/reseed/` | Setup Key | Demo Reset |
| `POST` | `/auth/login/` | Public | JWT Login |
| `GET` | `/profile/me/` | Auth | User Details |
| `POST` | `/tasks/<id>/accept/` | Student | Take a Task |
| `POST` | `/tasks/<id>/confirm/` | Dept | Pay Student |
| `POST` | `/tasks/disputes/<id>/respond/` | Dept | Add Evidence |
| `POST` | `/admin/disputes/<id>/resolve/`| Admin | Final Decision |
