# POS Management System — API Contract

Tài liệu này định nghĩa **request/response schema cụ thể** cho toàn bộ API của hệ thống POS Management. Đây là nguồn sự thật duy nhất (Single Source of Truth) mà cả Backend và Frontend phải tuân theo.

> **Nguyên tắc chung:**
> - Tất cả response đều bọc trong `ApiResponse<T>`
> - Tất cả ID đều là `UUID` dạng string
> - Timestamps dùng ISO 8601: `2026-10-01T14:00:00Z`
> - Lỗi theo RFC 7807 Problem Details

---

## 1. Wrapper Chung (ApiResponse)

```json
// Response thành công
{
  "success": true,
  "data": { ... },
  "message": null,
  "timestamp": "2026-10-01T14:00:00Z"
}

// Response danh sách có phân trang
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 150,
    "totalPages": 8,
    "pageNumber": 0,
    "pageSize": 20
  },
  "timestamp": "2026-10-01T14:00:00Z"
}

// Response lỗi (RFC 7807)
{
  "success": false,
  "error": {
    "code": "POS-1002",
    "message": "Thiết bị không ở trạng thái INSTOCK",
    "detail": "Device SN-POS-000001 có trạng thái DEPLOYED, không thể cấp phát",
    "path": "/api/v1/assignments",
    "timestamp": "2026-10-01T14:00:00Z"
  }
}
```

---

## 2. Error Code Reference

| Code | HTTP Status | Tên | Mô Tả |
|---|---|---|---|
| **POS-1001** | 404 | `DEVICE_NOT_FOUND` | Serial không tồn tại trong hệ thống |
| **POS-1002** | 422 | `DEVICE_NOT_ASSIGNABLE` | Device không ở trạng thái INSTOCK |
| **POS-1003** | 422 | `DEVICE_ALREADY_ASSIGNED` | Device đã có assignment ACTIVE |
| **POS-1004** | 422 | `INVALID_DEVICE_STATE_TRANSITION` | Chuyển trạng thái device không hợp lệ |
| **POS-1005** | 422 | `DEVICE_DISPOSED` | Device đã DISPOSED, không thể thao tác |
| **POS-2001** | 409 | `IDEMPOTENCY_CONFLICT` | Request đang được xử lý (duplicate key) |
| **POS-2002** | 409 | `OPTIMISTIC_LOCK_CONFLICT` | Conflict khi cập nhật đồng thời, vui lòng thử lại |
| **POS-3001** | 403 | `SELF_APPROVAL_NOT_ALLOWED` | Người tạo không thể tự phê duyệt |
| **POS-3002** | 422 | `APPROVAL_ALREADY_PROCESSED` | Phiếu đã được xử lý bởi người khác |
| **POS-3003** | 422 | `INVALID_APPROVAL_STATE` | Phiếu không ở trạng thái cho phép thao tác này |
| **POS-4001** | 404 | `MERCHANT_NOT_FOUND` | Merchant không tồn tại |
| **POS-4002** | 422 | `MERCHANT_NOT_ACTIVE` | Merchant không ở trạng thái ACTIVE |
| **POS-4003** | 404 | `TERMINAL_NOT_FOUND` | Terminal ID không tồn tại |
| **POS-4004** | 422 | `TERMINAL_NOT_ACTIVE` | Terminal không ở trạng thái ACTIVE |
| **POS-5001** | 422 | `DUPLICATE_SERIAL_NUMBER` | Serial number đã tồn tại trong hệ thống |
| **POS-5002** | 404 | `PURCHASE_ORDER_NOT_FOUND` | Purchase Order không tồn tại |
| **POS-5003** | 422 | `INSUFFICIENT_STOCK` | Không đủ thiết bị INSTOCK để thực hiện |
| **POS-6001** | 403 | `BUSINESS_UNIT_SCOPE_VIOLATION` | Không có quyền thao tác với đơn vị KD này |
| **POS-6002** | 403 | `PERMISSION_DENIED` | Không có quyền thực hiện thao tác này |
| **POS-7001** | 400 | `INVALID_SERIAL_FORMAT` | Serial number không đúng định dạng SN-POS-XXXXXX |
| **POS-7002** | 400 | `INVALID_DATE_RANGE` | Effective date range không hợp lệ |
| **POS-7003** | 400 | `INVALID_PAGINATION` | Tham số phân trang không hợp lệ |
| **POS-9001** | 401 | `UNAUTHORIZED` | Chưa xác thực hoặc token hết hạn |
| **POS-9002** | 401 | `TOKEN_EXPIRED` | Access Token đã hết hạn |
| **POS-9003** | 401 | `REFRESH_TOKEN_INVALID` | Refresh Token không hợp lệ hoặc đã bị thu hồi |
| **POS-9004** | 429 | `ACCOUNT_LOCKED` | Tài khoản bị khóa do đăng nhập sai nhiều lần |
| **POS-9005** | 429 | `RATE_LIMIT_EXCEEDED` | Quá số request cho phép (5 req/s per user) |

---

## 3. Module: Authentication

### POST /api/v1/auth/login
```json
// Request
{
  "username": "admin@pos.vn",
  "password": "Admin@123"
}

// Response 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "rt_uuid_xxx",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "uuid-user",
    "username": "admin@pos.vn",
    "fullName": "Super Admin",
    "roles": ["SUPER_ADMIN"],
    "permissions": ["INVENTORY_VIEW", "DEVICE_ASSIGN", ...],
    "businessUnitId": null,
    "businessUnitName": null
  }
}

// Error 401: POS-9001 | Error 429: POS-9004
```

### POST /api/v1/auth/refresh
```json
// Request
{ "refreshToken": "rt_uuid_xxx" }

// Response 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "rt_uuid_yyy",  // Token mới (Rotation)
  "expiresIn": 900
}

// Error 401: POS-9003
```

### POST /api/v1/auth/logout
```json
// Request Header: Authorization: Bearer {token}
// Request body: { "refreshToken": "rt_uuid_xxx" }
// Response 200 OK: { "message": "Đăng xuất thành công" }
```

---

## 4. Module: Inventory — Assignment (Quan trọng nhất)

### POST /api/v1/assignments
```json
// Request Headers:
//   Authorization: Bearer {token}
//   X-Idempotency-Key: uuid-v4 (BẮT BUỘC)
// Request Body:
{
  "serialNumber": "SN-POS-000001",
  "merchantCode": "M000001",
  "terminalId": "T100001",
  "notes": "Cấp phát theo yêu cầu khách hàng"
}

// Response 200 OK
{
  "assignmentId": "uuid-asg",
  "assignmentCode": "ASG-000001",
  "serialNumber": "SN-POS-000001",
  "merchantCode": "M000001",
  "merchantName": "Siêu thị ABC",
  "terminalId": "T100001",
  "status": "ACTIVE",
  "assignedAt": "2026-10-01T14:00:00Z",
  "assignedBy": "uuid-user"
}

// Errors:
// 404 POS-1001: Device not found
// 422 POS-1002: Device not assignable (not INSTOCK)
// 422 POS-1003: Device already assigned
// 422 POS-4002: Merchant not active
// 422 POS-4004: Terminal not active
// 403 POS-6001: Business unit scope violation
// 409 POS-2001: Idempotency conflict
```

### POST /api/v1/assignments/{id}/return
```json
// Request Headers: Authorization, X-Idempotency-Key
{
  "reason": "Merchant đóng cửa",
  "returnedBy": "uuid-handler"
}

// Response 200 OK
{
  "assignmentId": "uuid-asg",
  "status": "RETURNED",
  "returnedAt": "2026-10-01T16:00:00Z",
  "deviceStatus": "RETURNED"
}

// Errors: 404, 422 POS-1004
```

### POST /api/v1/assignments/{id}/transfer
```json
// Request Headers: Authorization, X-Idempotency-Key
{
  "toMerchantCode": "M000002",
  "toTerminalId": "T200001",
  "reason": "Điều chuyển theo yêu cầu"
}

// Response 200 OK
{
  "oldAssignmentId": "uuid-old",
  "newAssignmentId": "uuid-new",
  "newAssignmentCode": "ASG-000002",
  "serialNumber": "SN-POS-000001",
  "fromMerchant": "M000001",
  "toMerchant": "M000002",
  "transferredAt": "2026-10-01T17:00:00Z"
}
```

### GET /api/v1/assignments
```
Query params:
  - page: int (default 0)
  - size: int (default 20, max 100)
  - status: ACTIVE | RETURNED | TRANSFERRED
  - merchantCode: string
  - serialNumber: string
  - businessUnitId: uuid
  - fromDate: date (ISO 8601)
  - toDate: date

Response: Paginated list of AssignmentResponse
```

---

## 5. Module: Approval Workflow

### GET /api/v1/approvals/inbox
```json
// Query: page, size, requestType (STOCK_EXPORT | DEVICE_RETURN | ...)
// Response
{
  "content": [
    {
      "id": "uuid-approval",
      "requestNumber": "EX-2026-0081",
      "requestType": "STOCK_EXPORT",
      "status": "PENDING_APPROVAL",
      "currentLevel": 1,
      "maxLevel": 2,
      "summary": "Xuất kho 5 thiết bị PAX A920 từ Kho Hà Nội",
      "createdBy": { "id": "uuid", "fullName": "Nguyễn Văn A" },
      "businessUnitName": "Chi nhánh Hà Nội",
      "createdAt": "2026-10-01T09:32:00Z"
    }
  ],
  "totalElements": 8,
  "totalPages": 1
}
```

### POST /api/v1/approvals/{id}/approve
```json
// Request Headers: Authorization, X-Idempotency-Key
{
  "comment": "Đồng ý xuất kho"
}

// Response 200 OK
{
  "id": "uuid-approval",
  "status": "PENDING_LEVEL_2",  // hoặc "APPROVED" nếu chỉ 1 cấp
  "currentLevel": 2,
  "approvedBy": { "id": "uuid", "fullName": "Trần Thị B" },
  "approvedAt": "2026-10-01T10:00:00Z"
}

// Errors:
// 403 POS-3001: Self approval not allowed
// 422 POS-3002: Already processed
// 422 POS-3003: Invalid state
// 409 POS-2002: Optimistic lock conflict
```

### POST /api/v1/approvals/{id}/reject
```json
// Request Headers: Authorization, X-Idempotency-Key
{
  "reason": "Thiết bị cần giữ lại để phục vụ khách hàng VIP"
}

// Response 200 OK
{
  "id": "uuid-approval",
  "status": "REJECTED",
  "rejectedBy": { "id": "uuid", "fullName": "Trần Thị B" },
  "rejectionReason": "Thiết bị cần giữ lại...",
  "rejectedAt": "2026-10-01T10:05:00Z"
}
```

### POST /api/v1/approvals/{id}/return-for-edit
```json
// Request Headers: Authorization, X-Idempotency-Key
{
  "comment": "Cần bổ sung lý do xuất kho và chữ ký phòng kho"
}

// Response 200 OK → status: "RETURNED_FOR_EDIT"
```

---

## 6. Module: Device

### GET /api/v1/devices
```
Query params:
  - serialNumber: string (partial match)
  - status: INSTOCK | OUT_OF_WAREHOUSE | DEPLOYED | RETURNED | REPAIRING | DISPOSED
  - modelCode: string
  - vendorCode: string
  - warehouseId: uuid
  - merchantCode: string
  - page, size, sort

Response: Paginated DeviceResponse
```

### GET /api/v1/devices/{serialNumber}
```json
// Response 200 OK — DeviceDetailResponse (full)
{
  "id": "uuid-device",
  "serialNumber": "SN-POS-000001",
  "status": "DEPLOYED",
  "model": {
    "code": "A920",
    "name": "PAX A920",
    "vendor": { "code": "PAX", "name": "PAX Technology" }
  },
  "currentWarehouse": {
    "id": "uuid-wh",
    "code": "KHO-HN-01",
    "name": "Kho Hà Nội 1"
  },
  "purchaseOrderCode": "PO-2026-0001",
  "purchaseDate": "2026-01-01",
  "warrantyExpiry": "2029-01-01",
  "firmwareVersion": "3.2.1",
  "currentAssignment": {
    "assignmentCode": "ASG-000001",
    "merchant": { "code": "M000001", "name": "Siêu thị ABC" },
    "terminal": { "tid": "T100001" },
    "assignedAt": "2026-02-01T08:00:00Z"
  },
  "version": 5
}
```

### GET /api/v1/devices/{serialNumber}/lifecycle
```json
// Response: List<DeviceLifecycleHistoryResponse>
{
  "data": [
    {
      "id": "uuid",
      "fromStatus": null,
      "toStatus": "INSTOCK",
      "reason": "Nhập kho từ PO-2026-0001",
      "referenceType": "PURCHASE_ORDER",
      "referenceId": "uuid-po",
      "performedBy": { "id": "uuid", "fullName": "Admin" },
      "occurredAt": "2026-01-05T08:00:00Z"
    },
    {
      "fromStatus": "INSTOCK",
      "toStatus": "OUT_OF_WAREHOUSE",
      "reason": "Xuất kho theo EX-2026-0001",
      "referenceType": "EXPORT_REQUEST",
      "referenceId": "uuid-export",
      "performedBy": { "id": "uuid", "fullName": "Nguyễn Văn A" },
      "occurredAt": "2026-01-10T09:00:00Z"
    }
  ]
}
```

---

## 7. Module: Merchant & TID

### POST /api/v1/merchants
```json
// Request (Headers: Authorization, X-Idempotency-Key)
{
  "merchantName": "Siêu thị ABC",
  "taxCode": "0123456789",
  "mccCode": "5411",
  "businessUnitId": "uuid-bu",
  "address": "123 Nguyễn Huệ, Q1, HCM",
  "contactName": "Nguyễn Văn A",
  "contactPhone": "0901234567",
  "contactEmail": "abc@gmail.com"
}

// Response 200 OK
{
  "id": "uuid-merchant",
  "merchantCode": "M000001",  // Auto-generated
  "merchantName": "Siêu thị ABC",
  "status": "PENDING",
  "mcc": { "code": "5411", "name": "Grocery Stores, Supermarkets" },
  "createdAt": "2026-10-01T14:00:00Z"
}
```

### PATCH /api/v1/merchants/{id}/activate
```json
// Request (Headers: Authorization)
{ "reason": "Đã hoàn thành thẩm định KYC" }

// Response 200 OK
{
  "id": "uuid",
  "merchantCode": "M000001",
  "status": "ACTIVE",
  "activatedAt": "2026-10-01T15:00:00Z"
}
```

### POST /api/v1/terminals
```json
// Request
{
  "merchantId": "uuid-merchant",
  "effectiveFrom": "2026-10-01",
  "effectiveTo": null,
  "notes": "Terminal chính cho quầy thu ngân 1"
}

// Response 200 OK
{
  "id": "uuid-terminal",
  "tid": "T100001",  // Auto-generated
  "merchantCode": "M000001",
  "status": "PENDING",
  "effectiveFrom": "2026-10-01"
}
```

---

## 8. Module: Inventory

### POST /api/v1/purchase-orders
```json
// Request (Headers: Authorization, X-Idempotency-Key)
{
  "vendorId": "uuid-vendor",
  "warehouseId": "uuid-warehouse",
  "notes": "Đơn đặt hàng Q4/2026",
  "items": [
    {
      "deviceModelId": "uuid-model-a920",
      "quantityOrdered": 50,
      "unitPrice": 3500000
    },
    {
      "deviceModelId": "uuid-model-ict220",
      "quantityOrdered": 30,
      "unitPrice": 2800000
    }
  ]
}

// Response 200 OK
{
  "id": "uuid-po",
  "poNumber": "PO-2026-0001",
  "status": "DRAFT",
  "totalQuantity": 80,
  "vendor": { "code": "PAX", "name": "PAX Technology" },
  "warehouse": { "code": "KHO-HN-01", "name": "Kho Hà Nội 1" },
  "items": [...],
  "createdAt": "2026-10-01T14:00:00Z"
}
```

### POST /api/v1/inventory/imports
```json
// Nhập kho từ Purchase Order
// Request (Headers: Authorization, X-Idempotency-Key)
{
  "purchaseOrderId": "uuid-po",
  "items": [
    { "serialNumber": "SN-POS-000001", "deviceModelId": "uuid-model" },
    { "serialNumber": "SN-POS-000002", "deviceModelId": "uuid-model" }
  ],
  "notes": "Nhập theo biên bản giao nhận số BG-2026-001"
}

// Response 200 OK
{
  "importId": "uuid-import",
  "purchaseOrderCode": "PO-2026-0001",
  "totalImported": 2,
  "totalFailed": 0,
  "results": [
    { "serialNumber": "SN-POS-000001", "status": "SUCCESS", "deviceId": "uuid" },
    { "serialNumber": "SN-POS-000002", "status": "SUCCESS", "deviceId": "uuid" }
  ]
}

// Partial success: 200 OK với totalFailed > 0
// Error items: { "serialNumber": "SN-POS-000003", "status": "FAILED", "reason": "Duplicate serial" }
```

---

## 9. Module: Stock Export & Transfer

### POST /api/v1/inventory/exports
```json
// Request (Headers: Authorization, X-Idempotency-Key)
{
  "warehouseId": "uuid-warehouse",
  "destination": "Chi nhánh miền Bắc",
  "purpose": "Triển khai cho Merchant mới",
  "notes": "Xuất theo kế hoạch Q4",
  "deviceIds": ["uuid-device-1", "uuid-device-2", "uuid-device-3"]
}

// Response 200 OK — tạo phiếu + gửi approval request
{
  "exportRequestId": "uuid-export",
  "requestNumber": "EX-2026-0001",
  "status": "PENDING_APPROVAL",
  "approvalRequestId": "uuid-approval",
  "approvalRequestNumber": "EX-2026-0001",
  "deviceCount": 3,
  "createdAt": "2026-10-01T14:00:00Z"
}
```

### POST /api/v1/inventory/transfers
```json
// Request (Headers: Authorization, X-Idempotency-Key)
{
  "fromWarehouseId": "uuid-wh-hn",
  "toWarehouseId": "uuid-wh-hcm",
  "notes": "Điều chuyển để cân đối kho",
  "deviceIds": ["uuid-device-1", "uuid-device-2"]
}

// Response 200 OK
{
  "transferRequestId": "uuid-transfer",
  "requestNumber": "TR-2026-0001",
  "status": "PENDING_APPROVAL",
  "approvalRequestId": "uuid-approval",
  "deviceCount": 2
}
```

---

## 10. Module: Dashboard & Monitoring

### GET /api/v1/dashboard/summary
```json
// Response 200 OK (Redis cached, TTL 30s)
{
  "devices": {
    "total": 1245,
    "instock": 423,
    "deployed": 756,
    "repairing": 42,
    "returned": 15,
    "disposed": 9
  },
  "merchants": {
    "active": 238,
    "inactive": 15,
    "suspended": 3,
    "totalTid": 892
  },
  "approvals": {
    "pendingToday": 8,
    "approvedToday": 12,
    "rejectedToday": 2
  },
  "topWarehouses": [
    { "code": "KHO-HN-01", "name": "Kho Hà Nội 1", "instock": 180 },
    { "code": "KHO-HCM-01", "name": "Kho HCM 1", "instock": 145 }
  ],
  "monthlyStats": {
    "labels": ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    "imported": [50, 30, 0, 100, 20, 0, 0, 200, 0, 45, 0, 0],
    "exported": [20, 15, 5, 80, 10, 0, 0, 150, 0, 30, 0, 0]
  }
}
```

### GET /api/v1/audit-logs
```
Query params:
  - userId: uuid
  - action: string (DEVICE_ASSIGNED, APPROVAL_APPROVED, ...)
  - resourceType: DEVICE | ASSIGNMENT | APPROVAL | MERCHANT
  - resourceId: string
  - fromDate, toDate
  - page, size

Response: Paginated AuditLogResponse
```

---

## 11. Module: Notifications

### GET /api/v1/notifications
```json
// Query: page, size, isRead (true|false|all)
// Response
{
  "content": [
    {
      "id": "uuid-notif",
      "title": "Có phiếu chờ phê duyệt",
      "message": "Phiếu xuất kho EX-2026-0081 từ Nguyễn Văn A cần bạn phê duyệt",
      "type": "APPROVAL_REQUIRED",
      "referenceType": "APPROVAL_REQUEST",
      "referenceId": "uuid-approval",
      "isRead": false,
      "createdAt": "2026-10-01T09:32:00Z"
    }
  ],
  "totalElements": 15,
  "unreadCount": 8
}
```

### GET /api/v1/notifications/unread-count
```json
// Response (cached Redis 30s)
{ "unreadCount": 8 }
```

### PATCH /api/v1/notifications/{id}/read
```json
// Response 200 OK
{ "id": "uuid", "isRead": true }
```

### PATCH /api/v1/notifications/read-all
```json
// Response 200 OK
{ "updatedCount": 8 }
```

---

## 12. Module: Admin

### GET /api/v1/admin/users
```json
// Query: status, roleId, businessUnitId, search, page, size
// Response: Paginated UserResponse
{
  "content": [
    {
      "id": "uuid-user",
      "username": "nguyen.van.a",
      "email": "a@bank.vn",
      "fullName": "Nguyễn Văn A",
      "roles": ["INVENTORY_MANAGER"],
      "businessUnit": { "id": "uuid", "code": "HN", "name": "Chi nhánh Hà Nội" },
      "status": "ACTIVE",
      "lastLoginAt": "2026-10-01T08:00:00Z"
    }
  ]
}
```

### POST /api/v1/admin/users
```json
// Request
{
  "username": "nguyen.van.a",
  "email": "a@bank.vn",
  "fullName": "Nguyễn Văn A",
  "password": "Temp@123",
  "roleIds": ["uuid-role-inventory-manager"],
  "businessUnitId": "uuid-bu-hn"
}

// Response 201 Created
{
  "id": "uuid-user",
  "username": "nguyen.van.a",
  "status": "ACTIVE"
}
```

### PUT /api/v1/admin/roles/{id}/permissions
```json
// Request — gán permissions cho role
{
  "permissionIds": ["uuid-perm-1", "uuid-perm-2", "uuid-perm-3"]
}

// Response 200 OK
{
  "roleId": "uuid-role",
  "roleName": "INVENTORY_MANAGER",
  "permissions": [...]
}
```

---

## 13. Outbox Events Monitor (Chaos Testing)

### GET /api/v1/monitoring/outbox/events
```json
// Query: status (PENDING|SENT|FAILED), eventType, page, size
// Response: Paginated OutboxEventResponse
{
  "content": [
    {
      "id": "uuid-outbox",
      "eventType": "DEVICE_ASSIGNED",
      "aggregateId": "SN-POS-000001",
      "aggregateType": "DEVICE",
      "status": "FAILED",
      "retryCount": 3,
      "lastError": "Connection refused to Kafka broker",
      "createdAt": "2026-10-01T14:00:00Z",
      "sentAt": null
    }
  ]
}
```

### POST /api/v1/monitoring/outbox/events/{id}/retry
```json
// Response 200 OK
{ "id": "uuid", "status": "PENDING", "message": "Event đã được đưa vào hàng đợi retry" }
```

### POST /api/v1/monitoring/chaos/toggle-kafka
```json
// CHỈ dùng cho development/testing
// Response 200 OK
{ "kafkaAvailable": false, "message": "Kafka đã bị ngắt kết nối (chaos mode ON)" }
```

---

## 14. Query Parameters Convention

| Param | Type | Mô Tả |
|---|---|---|
| `page` | int | Số trang (0-indexed), default: 0 |
| `size` | int | Kích thước trang, default: 20, max: 100 |
| `sort` | string | `fieldName,asc` hoặc `fieldName,desc` |
| `search` | string | Full-text search (partial match) |
| `fromDate` | string | ISO 8601 date: `2026-01-01` |
| `toDate` | string | ISO 8601 date: `2026-12-31` |

---

## 15. Excel Export API

> **Thư viện Backend:** Apache POI (`poi-ooxml:5.3.0`)
> **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Quy Tắc Chung

```
URL pattern: GET /api/v1/{resource}/export
Query params: giống hệt filter của endpoint list tương ứng + format=xlsx (default)

Nếu tổng bản ghi ≤ 10,000:
  → Response 200: binary .xlsx download (sync)
  → Header: Content-Disposition: attachment; filename="{entity}_{date}.xlsx"

Nếu tổng bản ghi > 10,000:
  → Response 202: JSON có jobId (async)
  → Angular poll: GET /api/v1/jobs/{jobId}
  → Khi done: download URL trong response

Nếu tổng bản ghi > 50,000:
  → Response 400 POS-7004: "Quá nhiều dữ liệu. Hãy thu hẹp bộ lọc (tối đa 50,000 bản ghi)"

Nếu tổng bản ghi = 0:
  → Response 400 POS-7005: "Không có dữ liệu để xuất"
```

### Error Codes Bổ Sung (Export-specific)

| Code | HTTP | Tên | Mô Tả |
|---|---|---|---|
| **POS-7004** | 400 | `EXPORT_TOO_LARGE` | Vượt quá 50,000 bản ghi, cần thu hẹp filter |
| **POS-7005** | 400 | `EXPORT_EMPTY` | Không có dữ liệu phù hợp để xuất |
| **POS-7006** | 202 | `EXPORT_JOB_STARTED` | Job xuất async đã bắt đầu |

---

### GET /api/v1/devices/export
```
Query params (giống GET /api/v1/devices):
  status, warehouseId, modelCode, vendorCode, merchantCode,
  serialNumber, fromDate, toDate, businessUnitId

File: devices_{YYYY-MM-DD}_{HH-mm}.xlsx
Columns:
  Serial Number | Model | Vendor | Danh mục | Loại | Trạng thái
  Kho hiện tại | Merchant đang cấp phát | TID | Ngày nhập | Hạn bảo hành | Firmware
  Ngườ kiểm kê | Ghi chú

Permission: DEVICE_EXPORT
```

### GET /api/v1/assignments/export
```
Query params (giống GET /api/v1/assignments):
  status, merchantCode, serialNumber, fromDate, toDate, businessUnitId

File: assignments_{YYYY-MM-DD}_{HH-mm}.xlsx
Columns:
  Mã cấp phát | Serial Number | Model | Merchant | TID | Business Unit
  Người cấp phát | Ngày cấp phát | Ngày thu hồi | Trạng thái | Lý do thu hồi

Permission: ASSIGNMENT_EXPORT
```

### GET /api/v1/inventory/stock-transactions/export
```
Query params:
  warehouseId, transactionType (IMPORT|EXPORT|TRANSFER|RETURN|ADJUSTMENT|ASSIGN),
  fromDate, toDate

File: stock_transactions_{YYYY-MM-DD}_{HH-mm}.xlsx
Columns:
  Thời gian | Serial Number | Loại giao dịch | Kho nguồn | Kho đích
  Người thực hiện | Tài liệu tham chiếu | Ghi chú

Permission: INVENTORY_EXPORT
```

### GET /api/v1/inventory/exports/export
```
Query params: status, warehouseId, fromDate, toDate

File: stock_export_requests_{YYYY-MM-DD}.xlsx
Columns:
  Số phiếu | Kho xuất | Đối tượng nhận | Mục đích | Số thiết bị
  Trạng thái | Người tạo | Ngày tạo | Người duyệt | Ngày duyệt

Permission: INVENTORY_EXPORT
```

### GET /api/v1/merchants/export
```
Query params: status, businessUnitId, mccCode, search

File: merchants_{YYYY-MM-DD}.xlsx
Columns:
  Mã Merchant | Tên | Mã số thuế | MCC | Tên ngành | Business Unit
  Địa chỉ | Liên hệ | Số TID | Số thiết bị đang dùng | Trạng thái | Ngày tạo

Permission: MERCHANT_EXPORT
```

### GET /api/v1/approvals/export
```
Query params: requestType, status, createdBy, fromDate, toDate, businessUnitId

File: approvals_{YYYY-MM-DD}.xlsx
Columns:
  Số phiếu | Loại phiếu | Người tạo | Business Unit
  Ngày tạo | Cấp duyệt hiện tại | Trạng thái
  Người duyệt cấp 1 | Ngày duyệt cấp 1
  Người duyệt cấp 2 | Ngày duyệt cấp 2
  Lý do từ chối (nếu có)

Permission: APPROVAL_EXPORT
```

### GET /api/v1/audit-logs/export
```
Query params: userId, action, resourceType, fromDate, toDate

File: audit_logs_{YYYY-MM-DD}.xlsx  (hoặc .csv)
Columns:
  Thời gian | User | Hành động | Loại Resource | Resource ID | IP | Kết quả
  Giá trị cũ (JSON) | Giá trị mới (JSON)

Permission: AUDIT_EXPORT (chỉ AUDITOR + SUPER_ADMIN)
```

### GET /api/v1/jobs/{jobId} (Async Export Polling)
```json
// Response khi đang xử lý
{
  "jobId": "uuid-job",
  "status": "PROCESSING",
  "progress": 45,
  "totalItems": 25000,
  "processedItems": 11250,
  "message": "Đang xuất 11,250/25,000 bản ghi...",
  "startedAt": "2026-10-01T14:00:00Z"
}

// Response khi hoàn thành
{
  "jobId": "uuid-job",
  "status": "COMPLETED",
  "progress": 100,
  "totalItems": 25000,
  "downloadUrl": "/api/v1/jobs/uuid-job/download",
  "filename": "devices_2026-10-01_14-30.xlsx",
  "fileSizeBytes": 3145728,
  "completedAt": "2026-10-01T14:02:30Z"
}

// Response khi thất bại
{
  "jobId": "uuid-job",
  "status": "FAILED",
  "error": "Không đủ bộ nhớ để xử lý 25,000 bản ghi"
}
```

### GET /api/v1/jobs/{jobId}/download
```
Response: binary .xlsx file
Header: Content-Disposition: attachment; filename="{filename}"
Tất cả download được thực hiện qua endpoint này (có JWT auth)
```

