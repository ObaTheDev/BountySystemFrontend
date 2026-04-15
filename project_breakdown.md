# CampusGig Project Breakdown & Audit

This report provides a complete, high-level and technical breakdown of the CampusGig project as of April 10, 2026.

---

## 1. PROJECT OVERVIEW
**CampusGig** is a university-targeted platform that bridges the gap between campus departments and students. It allows departments to outsource mini-tasks (gigs) to students in exchange for rewards.

### User Roles & Capabilities:
*   **Students**:
    - Browse available "Open" tasks.
    - Accept a task (limited to one active task at a time).
    - Submit completed work for departmental review.
    - View total lifetime earnings and transaction history.
    - Manage personal profile and bank account details for manual payments.
*   **Departments**:
    - Post new tasks with rewards and deadlines.
    - Review student submissions.
    - Confirm task completion (releasing the reward record and student bank details).
    - Dispute submissions if requirements are not met.
*   **Admin**:
    - Standard Django Admin access for user and data management.
    - Custom API access to resolve disputes between departments and students.

---

## 2. PROJECT STRUCTURE
A directory-level mapping of the codebase:

### Root Directory
*   `campusgig/`: The main Django project folder.
*   `env/`: Python virtual environment (ignored by Git).
*   `requirements.txt`: Python dependencies (Django, DRF, JWT, etc.).
*   `.env`: Environment variables (Secret keys, DB config).
*   `.gitignore`: Specifies files and folders Git should ignore.

### Internal Project Structure (`campusgig/`)
*   `apps/`: Contains all custom application modules.
    - `users/`: Handles authentication, profiles, and notifications.
    - `tasks/`: Manages task lifecycle (Post, Accept, Submit, Confirm).
    - `wallet/`: Tracks transaction history and student earnings.
    - `utils.py`: Global helpers for success/error responses and exception handling.
*   `campusgig/`: Project-level settings and configuration.
    - `settings.py`: Core Django settings (Apps, Middleware, JWT, CORS).
    - `urls.py`: Root URL routing for the API.
    - `wsgi.py` / `asgi.py`: Web server gateway interfaces.
*   `db.sqlite3`: The local development database.
*   `manage.py`: Django management command-line utility.
*   `render.yaml`: Configuration for deployment on Render.

---

## 3. MODELS & DATABASE

### Users App (`apps/users/models.py`)
*   **User**: Custom user model inheriting from `AbstractBaseUser`.
    - **Fields**: `email` (Unique), `full_name`, `phone_number`, `role` (student/department/admin), `is_active`, `is_staff`.
    - **Relationships**: Parent to profiles and notifications.
    - **Real-world**: Represents any individual or official entity on the platform.
*   **StudentProfile**:
    - **Fields**: `matric_number`, `level`, `total_earned` (Decimal), `bank_name`, `account_number`, `account_name`.
    - **Relationships**: One-to-One with `User`.
    - **Real-world**: Stores career and payment info for a student.
*   **DepartmentProfile**:
    - **Fields**: `department_name`, `faculty`.
    - **Relationships**: One-to-One with `User`.
    - **Real-world**: Represents an academic or administrative department.
*   **Notification**:
    - **Fields**: `recipient` (FK to User), `message`, `is_read`, `created_at`.
    - **Real-world**: Alerts for task updates (accepted, submitted, confirmed).

### Tasks App (`apps/tasks/models.py`)
*   **Task**:
    - **Fields**: `title`, `description`, `deadline`, `reward_amount`, `status` (open, in_progress, pending_confirmation, completed, disputed, cancelled).
    - **Relationships**: FK to `User` (posted_by).
    - **Real-world**: A specific gig or job opportunity.
*   **TaskAssignment**:
    - **Fields**: `assigned_at`, `submitted_at`, `status` (accepted, submitted, confirmed, disputed).
    - **Relationships**: One-to-One with `Task`, FK to `User` (student).
    - **Real-world**: Links a specific student to a specific task.

### Wallet App (`apps/wallet/models.py`)
*   **WalletTransaction**:
    - **Fields**: `type` (Credit), `amount`, `description`, `created_at`.
    - **Relationships**: FK to `User` (student).
    - **Real-world**: A historical record of payments earned by a student.

---

## 4. HOW THE PROGRAM WORKS — FULL FLOW

### 1. Registration & Auth
- **Register**: User signs up via `/api/v1/auth/register/`, choosing a role ('student' or 'department').
- **On Creation**: A corresponding Profile (`StudentProfile` or `DepartmentProfile`) is automatically created.
- **Login**: User receives a JWT Access and Refresh token via `/api/v1/auth/login/`.

### 2. Student Step-by-Step
- Browses available tasks via `/api/v1/tasks/`.
- Updates bank details via `/api/v1/profile/bank-details/` (Required for payment!).
- Accepts a task via `/api/v1/tasks/:id/accept/`.
- Work on the task; status changes to `in_progress`.
- Submits work via `/api/v1/tasks/:id/submit/`.
- Views earnings and history in their Dashboard and Wallet.

### 3. Department Step-by-Step
- Creates a task via POST `/api/v1/tasks/`.
- Receives notification when a student accepts.
- Receives notification when work is submitted.
- Reviews work:
    - **Option A (Confirm)**: If work is good, calls `/api/v1/tasks/:id/confirm/`. This releases student bank details to the department.
    - **Option B (Dispute)**: If work is poor, calls `/api/v1/tasks/:id/dispute/`.
- **Payment**: Department is instructed to pay the student manually using the bank info provided in the confirmation response.

### 4. Admin Step-by-Step
- Monitors for "Disputed" tasks.
- Resolves via `/api/v1/admin/tasks/:id/resolve/`.
    - `release_to_student`: Forces reward credit.
    - `refund_to_dept`: Reverts task status.

### 5. Task Lifecycle
`Open` -> `In Progress` (Accepted) -> `Pending Confirmation` (Submitted) -> `Completed` (Confirmed) OR `Disputed`.

---

## 5. ALL API ENDPOINTS

| Method | URL | Accessibility | Expects (Body/Params) | Returns |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register/` | Public | `email, password, full_name, role` | User Data |
| **POST** | `/api/v1/auth/login/` | Public | `email, password` | JWT Tokens + Role |
| **POST** | `/api/v1/auth/logout/` | Auth | `refresh_token` | Success Message |
| **GET** | `/api/v1/profile/me/` | Auth | - | Full Profile Data |
| **GET** | `/api/v1/tasks/` | Student | `reward_min, reward_max, deadline` (Params) | List of Open Tasks |
| **POST** | `/api/v1/tasks/` | Department | `title, description, deadline, reward_amount` | Created Task |
| **POST** | `/api/v1/tasks/:id/accept/` | Student | - | Assignment Data |
| **POST** | `/api/v1/tasks/:id/submit/` | Student | - | Success Message |
| **POST** | `/api/v1/tasks/:id/confirm/` | Department | - | **Student Bank Details** |
| **POST** | `/api/v1/tasks/:id/dispute/` | Department | - | Success Message |
| **GET** | `/api/v1/wallet/balance/` | Student | - | `total_earned` |
| **GET** | `/api/v1/wallet/transactions/` | Student | - | List of Credits |
| **POST** | `/api/v1/admin/tasks/:id/resolve/` | Admin | `action` (release_to_student/refund_to_dept) | Result Message |

---

## 6. AUTHENTICATION & PERMISSIONS
- **Authentication**: Uses `rest_framework_simplejwt.authentication.JWTAuthentication`. Tokens are short-lived with refresh tokens allowed.
- **Permission Classes (`apps/users/permissions.py`)**:
    - `IsStudent`: Restricts to users with `role == 'student'`.
    - `IsDepartment`: Restricts to users with `role == 'department'`.
    - `IsAdmin`: Restricts to users with `role == 'admin'`.

---

## 7. BUSINESS LOGIC
The system enforces the following rules across views and serializers:

1.  **Single Task Constraint**: A student cannot accept a new task if they already have one with status `in_progress`.
2.  **Role Restriction**: Registration only allows 'student' or 'department' roles (Admins must be created via superuser command).
3.  **Task Acceptance**: Only tasks with status `open` can be accepted.
4.  **Submission Control**: Only the assigned student can submit a task, and only if it's currently `in_progress`.
5.  **Confirmation Control**: Only the original poster (Department) can confirm or dispute a task.
6.  **Earnings Record**: Confirmation automatically increments `StudentProfile.total_earned` and creates a `WalletTransaction` record.
7.  **Manual Payment**: Confirmation logic returns the student's bank details to the department, signaling a shift to offline payment.
8.  **Automated Notifications**: Any status change (Accept, Submit, Confirm, Dispute) triggers an internal `Notification` for the relevant user.

---

## 8. SETTINGS & CONFIGURATION (`.env`)
Required environment variables:
*   `SECRET_KEY`: Django security key.
*   `DEBUG`: True/False (Boolean).
*   `ALLOWED_HOSTS`: Comma-separated domains.
*   `DATABASE_URL`: Connection string (defaults to SQLite if missing).
*   `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`: Life of access token.
*   `CORS_ALLOWED_ORIGINS`: Allowed frontend origins.

---

## 9. ANYTHING MISSING OR INCOMPLETE

1.  **Admin Listing**: While an admin can "resolve" a task, there is no custom API endpoint to *list* all disputed tasks. Admins currently have to use the standard Django `/admin/` for discovery.
2.  **Escrow System**: There is no actual escrow balance. Money does not move through the system; it only records calculated earnings.
3.  **Verification**: There is no verification step for Matriculation Numbers or Departmental identity during registration.
4.  **Task Cancellation**: Departments can create tasks, but once posted, there is no obvious "Cancel/Delete" endpoint in the `tasks/` app views for the poster (except through Dispute resolution).
5.  **Evidence/Attachments**: Task submissions are status-based; there is no field for a "submission_link" or "file_upload" in the current `TaskAssignment` model.
