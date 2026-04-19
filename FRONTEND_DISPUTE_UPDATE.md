# ⚠️ Frontend Action Required: Dispute Resolution Update

We have updated the dispute resolution logic on the backend. Please update your implementation of the **Admin Resolution** feature to match these new requirements.

## 📝 1. Mandatory Admin Notes

When an admin resolves a dispute, the `admin_notes` field is now **required**. You must ensure the UI captures this input before allowing the resolution to be submitted.

### API Endpoint Update
- **URL**: `POST /api/v1/admin/disputes/<dispute_id>/resolve/`
- **Method**: `POST`
- **Payload**:
```json
{
  "decision": "student", // or "department"
  "admin_notes": "Enter detailed reasoning here..." // MUST NOT BE EMPTY
}
```

## 🔔 2. Automated Notifications

The backend now automatically handles notifications for **both** the student and the department.
- **Student Alert**: "Dispute for '[Task Title]' resolved in favor of [decision]. Result saved at [Timestamp]. Admin Notes: [Notes]"
- **Department Alert**: Same as above, sent to the task poster.

**Frontend Implementation Tip**:
- You can now remove any secondary API calls you might have been making to notify users manually after a resolution; the backend handles this in a single transaction.
- Ensure the "Resolve" button in the Admin dashboard remains disabled until both a `decision` is selected and `admin_notes` has a minimum length.

## 🕒 3. Timestamp & Records
All resolutions now include a server-side timestamp. If you are displaying a "Resolution History" or "Audit Log" in the frontend, you can rely on the `resolved_at` field in the dispute object.

---
