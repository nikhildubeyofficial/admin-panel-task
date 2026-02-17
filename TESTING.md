# Testing Checklist

## Authentication
- [ ] **Register**: Create a new admin account (`/register`).
- [ ] **Login**: Access dashboard with valid credentials.
- [ ] **Invalid Login**: verify error message for wrong password.
- [ ] **Logout**: Verify redirection to login page and session clearing.
- [ ] **Protected Routes**: Try accessing `/dashboard` without login (should redirect).

## Task Verification
- [ ] **View Tasks**: Ensure pending tasks are listed in `/dashboard/tasks`.
- [ ] **Approve Task**: 
    - Click "Verify".
    - Click "Approve & Credit".
    - Verify task disappears from pending list.
    - Verify user points increased (in `/dashboard/users`).
- [ ] **Reject Task**:
    - Click "Verify".
    - Click "Reject", enter reason.
    - Verify task status updates to REJECTED.

## Payouts
- [ ] **View Requests**: Check `/dashboard/payouts`.
- [ ] **Approve Request**: Move status from PENDING to APPROVED.
- [ ] **Pay Request**: Move status from APPROVED to PAID (enter Tx ID).
- [ ] **Reject Request**: Verify points are refunded to user.

## System Stability
- [ ] **Database**: Ensure no connection errors in server logs.
- [ ] **Performance**: Dashboard loads quickly (< 200ms API response).
- [ ] **Errors**: No 500 triggers during normal usage.
