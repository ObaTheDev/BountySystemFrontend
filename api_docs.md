# CampusGig Frontend API Documentation

This document serves as the primary reference for the frontend team to integrate with the CampusGig backend.

**Base URL**: `http://localhost:8000/api/v1/`
**Auth Header**: `Authorization: Bearer <access_token>`

---

## 🔐 Authentication & Users

### Register
*   **Method**: `POST`
*   **URL**: `/auth/register/`
*   **Auth Required**: No
*   **Body (JSON)**:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword",
      "full_name": "John Doe",
      "role": "student", // or "department"
      "phone_number": "08012345678"
    }
    ```
*   **Usage**: Creates a new user and automatically initializes the corresponding profile.

### Login
*   **Method**: `POST`
*   **URL**: `/auth/login/`
*   **Auth Required**: No
*   **Body (JSON)**:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
*   **Returns**: JWT `access` and `refresh` tokens, plus the user's `role`.

### Logout
*   **Method**: `POST`
*   **URL**: `/auth/logout/`
*   **Auth Required**: Yes
*   **Body (JSON)**:
    ```json
    {
      "refresh": "refresh_token_string"
    }
    ```
*   **Usage**: Blacklists the refresh token to end the session.

### Profile (Me)
*   **Method**: `GET` / `PUT`
*   **URL**: `/profile/me/`
*   **Auth Required**: Yes
*   **Usage**: `GET` retrieves the complete profile (Student or Dept). `PUT` updates `full_name` and `phone_number`.

---

## 🎓 Student Endpoints

### Student Dashboard
*   **Method**: `GET`
*   **URL**: `/student/dashboard/`
*   **Auth Required**: Yes (Student Only)
*   **Returns**: `total_earned`, `active_tasks_count`, and user details.

### Update Bank Details
*   **Method**: `PUT`
*   **URL**: `/profile/bank-details/`
*   **Auth Required**: Yes (Student Only)
*   **Body (JSON)**:
    ```json
    {
      "bank_name": "GTBank",
      "account_number": "0123456789",
      "account_name": "John Doe"
    }
    ```

---

## 🏫 Department Endpoints

### Post New Task
*   **Method**: `POST`
*   **URL**: `/tasks/`
*   **Auth Required**: Yes (Department Only)
*   **Body (JSON)**:
    ```json
    {
      "title": "Clean Office",
      "description": "Clean the department office before 5 PM.",
      "deadline": "2026-04-12T17:00:00Z",
      "reward_amount": 5000.00
    }
    ```

### Department Tasks List
*   **Method**: `GET`
*   **URL**: `/profile/dept/tasks/`
*   **Auth Required**: Yes (Department Only)
*   **Usage**: List all tasks posted by the authenticated department.

---

## 📋 Task Management

### List Open Tasks
*   **Method**: `GET`
*   **URL**: `/tasks/`
*   **Auth Required**: Yes (Student Only)
*   **QueryParams**: `reward_min`, `reward_max`, `deadline`.
*   **Returns**: A list of all tasks with `status == 'open'`.

### Task Details
*   **Method**: `GET`
*   **URL**: `/tasks/:id/`
*   **Auth Required**: Yes
*   **Returns**: Full task details, including the department name and assignment data (if any).

### Accept Task
*   **Method**: `POST`
*   **URL**: `/tasks/:id/accept/`
*   **Auth Required**: Yes (Student Only)
*   **Logic**: Fails if the student already has an `in_progress` task.

### Submit Task
*   **Method**: `POST`
*   **URL**: `/tasks/:id/submit/`
*   **Auth Required**: Yes (Student Only)
*   **Logic**: Moves task to `pending_confirmation`.

### Confirm Task (Release Reward)
*   **Method**: `POST`
*   **URL**: `/tasks/:id/confirm/`
*   **Auth Required**: Yes (Department Only)
*   **Returns**: **The assigned student's bank details**.
*   **Logic**: Triggers a notification and adds to student's lifetime earnings record.

### Dispute Task
*   **Method**: `POST`
*   **URL**: `/tasks/:id/dispute/`
*   **Auth Required**: Yes (Department Only)

---

## 💱 Wallet & Notifications

### Wallet Balance
*   **Method**: `GET`
*   **URL**: `/wallet/balance/`
*   **Auth Required**: Yes (Student Only)

### Transaction History
*   **Method**: `GET`
*   **URL**: `/wallet/transactions/`
*   **Auth Required**: Yes (Student Only)

### List Notifications
*   **Method**: `GET`
*   **URL**: `/notifications/`
*   **Auth Required**: Yes

### Mark Notification Read
*   **Method**: `POST`
*   **URL**: `/notifications/:id/read/`
*   **Auth Required**: Yes

---

## 🏗️ Admin Endpoints

### Resolve Dispute
*   **Method**: `POST`
*   **URL**: `/admin/tasks/:id/resolve/`
*   **Auth Required**: Yes (Admin Only)
*   **Body (JSON)**:
    ```json
    {
      "action": "release_to_student" // or "refund_to_dept"
    }
    ```
