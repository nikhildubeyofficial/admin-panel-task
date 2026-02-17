# API Documentation

## Authentication

### Admin Login
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": { "id": "...", "email": "...", "role": "ADMIN" }
  }
  ```
- **Cookies**: Sets `token` (HTTP-only)

### Admin Logout
- **Endpoint**: `POST /api/auth/logout`
- **Response**: `200 OK`
- **Cookies**: Clears `token`

### Google Sign-In
- **Endpoint**: `POST /api/auth/google`
- **Body**:
  ```json
  {
    "credential": "<Google ID Token>"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": { "id": "...", "email": "...", "role": "ADMIN" }
  }
  ```
- **Cookies**: Sets `token` (HTTP-only)
- **Note**: Only works for emails registered in Admin table

---

## Task Management

### Get Pending Submissions
- **Endpoint**: `GET /api/tasks/submissions`
- **Response**:
  ```json
  {
    "submissions": [
      {
        "id": "...",
        "status": "PENDING",
        "user": { ... },
        "task": { ... }
      }
    ]
  }
  ```

### Verify Submission
- **Endpoint**: `PATCH /api/tasks/submissions/[id]`
- **Body**:
  ```json
  {
    "status": "APPROVED", // or "REJECTED"
    "reason": "Optional rejection reason"
  }
  ```
- **Response**: Returns updated submission.

---

## Payout Management

### Get Payout Requests
- **Endpoint**: `GET /api/payouts/requests`
- **Response**: List of pending/approved redeem requests.

### Process Payout
- **Endpoint**: `POST /api/payouts/process`
- **Body**:
  ```json
  {
    "id": "request_id",
    "action": "APPROVE" // or "REJECT", "COMPLETE"
    "transactionId": "tx_123" // Required if action is "COMPLETE" (PAY)
  }
  ```

---

## Analytics

### Dashboard Stats
- **Endpoint**: `GET /api/analytics`
- **Response**:
  ```json
  {
    "totalUsers": 150,
    "totalReferrals": 45,
    "pendingTasks": 12,
    "pendingRedeems": 5,
    "totalPayouts": 500.00
  }
  ```
