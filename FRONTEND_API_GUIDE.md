# 🚀 CampusGig Frontend API Integration Guide

This document provides everything the frontend team needs to know to integrate the Administrative Tools and the Hybrid Dispute System.

## 🔑 1. Environment & Auth
The system uses dual-layered security: **JWT Tokens** for standard actions and **Setup Keys** for one-time system configuration.

- **Standard Auth**: `Authorization: Bearer <access_token>`
- **Admin Registration Key**: `1234567qwer` (Used during registration to grant admin role)
- **Setup Secret Key**: `1234567qwer` (Used for superuser creation and reseeding)

---

## 🏗️ 2. System Level Operations (Setup)
*These endpoints are used for initial deployment on Render and for generating demo data.*

### Create Superuser
**URL**: `POST /api/setup/superuser/` | **Auth**: None
```json
{
  "setup_key": "1234567qwer",
  "email": "admin@campusgig.com",
  "password": "...",
  "full_name": "Admin Name"
}
```

### Wipe & Reseed Data (Demo Mode)
**URL**: `POST /api/setup/reseed/` | **Auth**: None
Clears all users, tasks, and transactions. Injects fresh sample data for students, depts, and admins.
```json
{
  "setup_key": "1234567qwer"
}
```

---

## 👥 3. User & Admin Management

### Admin Registration
To register a user as an admin, you must include the registration key.
**URL**: `POST /api/v1/auth/register/`
```json
{
  "email": "new.admin@campusgig.com",
  "password": "...",
  "role": "admin",
  "full_name": "New Admin",
  "admin_registration_key": "1234567qwer"
}
```

### Delete User (Admin Only)
**URL**: `DELETE /api/v1/admin/users/<id>/` | **Auth**: JWT (Admin)

---

## 📸 4. Task Submission & Evidence
Students can now provide proof of work when submitting a task.

### Submit Task with Evidence
**URL**: `POST /api/v1/tasks/<id>/submit/` | **Method**: `POST` | **Auth**: JWT (Student)
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `submission_image`: (File) Optional image proof.
  - `submission_notes`: (String) Optional notes/description of work.

### Viewing Evidence (Department)
Departments can view the uploaded evidence in the assignment list or detail.
**URL**: `GET /api/v1/tasks/assignments/`
**Response Fields**:
- `submission_image`: URL to the uploaded image.
- `submission_notes`: The student's notes.

---

## ⚖️ 5. Hybrid Dispute System (Workflow)

### Workflow Overview
1. **PENDING**: Student or Dept raises a dispute.
2. **IN REVIEW**: Dept responsible for the task submits their evidence/response.
3. **RESOLVED**: Global Admin makes the final call.

### A. Raising a Dispute
**URL**: `POST /api/v1/tasks/<task_id>/raise-dispute/`
- Call this when a student wants to contest a non-payment or a dept wants to contest a submission.
- **Body**: `{"reason": "..."}`
- **Initial Status**: `pending`

### B. Submitting Department Evidence
**URL**: `POST /api/v1/tasks/disputes/<dispute_id>/respond/`
- **Body**: `{"dept_response": "..."}`
- **Success**: Status moves automatically to `in_review`.

### C. Final Admin Resolution
**URL**: `POST /api/v1/admin/disputes/<dispute_id>/resolve/`
- **Body**: 
  ```json
  {
    "decision": "student", // or "department"
    "admin_notes": "..."
  }
  ```
- **Side Effects**:
  - `student`: Credits wallet, marks task `completed`.
  - `department`: Marks task `cancelled`.

### D. Dispute List (Filtering)
**URL**: `GET /api/v1/tasks/disputes/`
- **Student**: Returns disputes they raised.
- **Department**: Returns disputes for tasks they posted.
- **Admin**: Returns all disputes (via `/api/v1/admin/disputes/`).

---

## 📦 5. Response Data Structures

### Profile Response (`GET /api/v1/profile/me/`)
Frontend can use the `role` field to conditionally show Admin/Dept dashboards.
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "...",
    "role": "admin", // or 'student', 'department'
    "full_name": "..."
  }
}
```

### Dispute Detail Object
```json
{
  "id": 1,
  "task_title": "Data Entry",
  "department_name": "CS Dept",
  "reason": "Student claim",
  "dept_response": "Evidence string",
  "status": "pending", // pending, in_review, resolved
  "resolution_decision": "student" // null until resolved
}
```

---

## 📌 6. Implementation Tips
- **Gating Buttons**:
  - `assignment.status === 'in_progress'`: Show "Submit Task" button (with file upload).
  - `dispute.status === 'pending'`: Show "Respond" button for Departments.
  - `dispute.status === 'in_review'`: Show "Resolve" button for Admins.
- **File Uploads**: When submitting tasks, ensure you use `FormData` in the frontend to handle the file upload correctly.
- **Auto-Refresh**: When a dispute is resolved, students should refresh their dashboard/wallet to see the updated balance.
