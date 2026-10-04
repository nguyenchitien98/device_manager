# 16 — Backend API Implementation Flow (FE ↔ BE Wiring Master)

> **Mục đích:** Tài liệu DUY NHẤT AI Agent cần đọc để code toàn bộ Backend API và nối vào 38 màn hình UI.
> Khi tài liệu này mâu thuẫn với `09_API_Contract.md` hoặc `ANTIGRAVITY_UI_ACTION_GUIDE.md` → **tài liệu này thắng**.

---

## 0. NGUYÊN TẮC NGUỒN SỰ THẬT (SOURCE OF TRUTH)

| Vấn đề | Nguồn sự thật | Ghi chú |
| :--- | :--- | :--- |
| URL + HTTP method | `frontend/src/app/core/services/api/*.ts` + Bảng mục 3 | FE đã build xong, BE phải khớp FE |
| Tên field Request/Response DTO | Interface/`formModel`/cột `<pos-table>` trong component FE tương ứng | Nếu FE dùng `any` → tạo interface mới trong `core/models/` khớp DTO BE |
| Schema DB, enum, constraint | `06_Database_Schema.md` | |
| Nghiệp vụ, state machine | `11_Business_Flow.md` | |
| Error code | `09_API_Contract.md` §2 + `ErrorCode.java` | |
| Kiến trúc package | `01_Architecture_Bible.md`, `02_Coding_Guideline.md` | |

---

## 1. HIỆN TRẠNG BACKEND (đã kiểm tra 2026-10-04)

**Đã có trong `src/`:**
- `pos-common`: `ApiResponse`, `ApiErrorResponse`, `ErrorCode`, `PosBusinessException`, `GlobalExceptionHandler`
- `pos-core`: `SecurityConfig`, `JwtAuthenticationFilter`, `JwtTokenService`, `OpenApiConfig`, `HealthController`
- Identity: `AuthController`, `AuthService`, JPA entities `User/Role/Permission/RefreshToken` + repositories
- Flyway: `V1` base, `V2` identity, `V3` metadata+catalog, `V4` merchant/TID

> [!WARNING]
> `target/classes/db/migration/` còn `V5`→`V11` (inventory, export/transfer, lifecycle, repair, assignment, approval, audit) nhưng **KHÔNG có trong `src/`**. Đây là artifact cũ. AI phải viết lại V5+ trong `src/main/resources/db/migration/` và chạy `mvn clean` trước khi build để tránh Flyway checksum lỗi.

---

## 2. GAP BẮT BUỘC SỬA TRƯỚC KHI CODE API (BLOCKERS)

| # | Gap | Hậu quả nếu bỏ qua | Cách sửa |
| :-- | :--- | :--- | :--- |
| G1 | `BaseApiService.baseUrl = '/api/v1'` (relative), **không có `proxy.conf.json`** | `ng serve` gọi `localhost:4200/api/v1` → 404 toàn bộ | Tạo `frontend/proxy.conf.json` `{"/api": {"target": "http://localhost:8080", "secure": false}}` + `angular.json` → `serve.options.proxyConfig` |
| G2 | `patch(url, '', body)` / `put(url, '', body)` sinh URL có **dấu `/` cuối** (vd `/admin/users/1/lock/`) | Spring Boot 3 không match trailing slash → 404 | Sửa `BaseApiService.put/patch`: nếu `id === ''` thì không nối `/${id}` |
| G3 | FE `PageResponse` dùng `pageNumber/pageSize/totalElements/totalPages/first/last`; Spring `Page` serialize `number/size/...` | Bảng FE trống, pagination sai | BE tạo `PageResponse<T>` trong `pos-common` với **đúng tên field FE** + `PageResponse.from(Page)` |
| G4 | FE `ApiResponse` có field `code`; BE `ApiResponse` không có | Toast lỗi thiếu mã | Thêm `code` vào `ApiResponse` BE (success = `"SUCCESS"`) |
| G5 | FE query `page` là **1-based** hay 0-based không thống nhất giữa component | Lệch trang | Chuẩn: FE gửi `page` **0-based**, `size`, `sort=field,asc|desc`. AI rà mọi `loadData()` FE |
| G6 | Mọi component FE có `error: () => { /* giữ mock */ }` | Che lỗi thật, vi phạm AGENTS.md §5 | Khi BE module xong: xóa mock data inline, `error` → `toast.error(...)` |
| G7 | FE còn thiếu method cho: device detail/lifecycle, repairs list, notifications, outbox, PO submit/receive/close, reports data, user profile/đổi mật khẩu, jobs polling | Nút vẫn "chết" dù BE có API | Bổ sung method vào API service FE theo Bảng mục 3 (cột "FE cần thêm") |
| G8 | Nhiều DTO FE kiểu `any` | Vi phạm AGENTS.md §3, AI đoán field | Tạo `core/models/<module>.model.ts` khớp 1-1 DTO Java |
| G9 | Lệch URL giữa FE và `09_API_Contract.md` (PO, audit-logs) | Không khớp | Theo FE: `/inventory/purchase-orders`, `/monitoring/audit-logs` |

---

## 3. BẢNG ENDPOINT MASTER (FE ↔ BE)

Prefix chung: `/api/v1`. Tất cả list endpoint nhận `page,size,sort,search` + filter riêng và trả `ApiResponse<PageResponse<T>>`.
Tất cả `/export` trả `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` + header `Content-Disposition`. `/export-pdf` trả `application/pdf`.
Ký hiệu: ✅ FE đã gọi · ➕ FE cần thêm method.

### 3.1 Auth & Profile
| Method | Endpoint | FE | Màn hình / Nút |
| :-- | :-- | :-: | :-- |
| POST | `/auth/login` | ✅ | Login → [Đăng nhập] |
| POST | `/auth/refresh` | ✅ | JwtInterceptor (401) |
| POST | `/auth/logout` | ✅ | Header avatar → [Đăng xuất] |
| GET | `/auth/me` | ➕ | UserProfile load |
| PUT | `/auth/me` | ➕ | UserProfile → [Lưu] |
| POST | `/auth/change-password` | ➕ | UserProfile → [Đổi mật khẩu] |

### 3.2 Catalog (`CatalogApiService`) — mỗi resource đủ 5 endpoint
Resources: `device-categories`, `device-types`, `device-models`, `vendors`, `mcc`, `fee-policies`
| Method | Endpoint | FE |
| :-- | :-- | :-: |
| GET | `/catalog/{resource}` | ✅ |
| POST | `/catalog/{resource}` | ✅ |
| PUT | `/catalog/{resource}/{id}` | ✅ |
| DELETE | `/catalog/{resource}/{id}` (soft delete → `INACTIVE`, lỗi `POS-2008` nếu còn con active) | ✅ |
| GET | `/catalog/{resource}/export` | ✅ |
Filter riêng: device-types `categoryId`; device-models `deviceTypeId,vendorId`; fee-policies `effectiveDate`.

### 3.3 Organization (`OrganizationApiService`)
Resources `business-units`, `warehouses` (filter `businessUnitId`): GET list / POST / PUT `{id}` / DELETE `{id}` / GET `/export` — tất cả ✅.

### 3.4 Merchant & Terminal (`MerchantApiService`)
| Method | Endpoint | FE |
| :-- | :-- | :-: |
| GET | `/merchants` (filter `status,mcc,businessUnitId,fromDate,toDate`) | ✅ |
| GET | `/merchants/{id}` (kèm terminals, statusHistory, feePolicies) | ✅ |
| POST | `/merchants` (auto MID `M`+6 số) | ✅ |
| PUT | `/merchants/{id}` | ✅ |
| PATCH | `/merchants/{id}/status` body `{status, reason}` | ✅ |
| POST | `/merchants/{id}/fee-policy` body `{feePolicyId}` | ✅ |
| GET | `/merchants/export` | ✅ |
| GET | `/terminals` · GET `/terminals/{id}` · POST `/terminals` (auto TID `T`+6 số) | ✅ |
| PATCH | `/terminals/{id}/status` body `{status}` | ✅ |
| GET | `/terminals/export` | ✅ |

### 3.5 Inventory & Logistics (`InventoryApiService`)
| Method | Endpoint | FE |
| :-- | :-- | :-: |
| GET/POST | `/inventory/purchase-orders` · GET `/{id}` | ✅ |
| POST | `/inventory/purchase-orders/{id}/approve` | ✅ |
| POST | `/inventory/purchase-orders/{id}/submit` · `/receive` · `/close` | ➕ |
| GET | `/inventory/purchase-orders/export` | ✅ |
| GET/POST | `/inventory/imports` · GET `/export` | ✅ |
| GET/POST | `/inventory/exports` (POST tạo Approval Request) · GET `/export` | ✅ |
| GET/POST | `/inventory/transfers` (POST tạo Approval Request) · GET `/export` | ✅ |
| GET | `/inventory/stock` (tổng hợp theo kho×model) · GET `/export` | ✅ |
| GET | `/inventory/stock/{warehouseId}/devices?modelId=` (modal serial) | ➕ |
| GET | `/inventory/transactions` (stock ledger) | ✅ |
| GET | `/logistics/shipments` · GET `/export` | ✅ |

### 3.6 Device & Repair (`DeviceApiService`)
| Method | Endpoint | FE |
| :-- | :-- | :-: |
| GET | `/devices` (filter `serial,status,modelId,warehouseId,merchantId`) | ✅ |
| GET | `/devices/{serial}` | ➕ |
| GET | `/devices/{serial}/lifecycle` · `/assignments` · `/repairs` · `/stock-history` · `/audit-logs` (8 tab) | ➕ |
| PATCH | `/devices/{serial}/status` body `{status, reason}` (validate FSM) | ✅ |
| POST | `/devices/{serial}/repairs` · `/dispose` | ✅ |
| GET | `/devices/export` · `/devices/monitoring/export` | ✅ |
| GET | `/repairs` · PATCH `/repairs/{id}/complete` · `/fail` | ➕ |

### 3.7 Assignment (`AssignmentApiService`)
| Method | Endpoint | FE |
| :-- | :-- | :-: |
| GET/POST | `/assignments` (POST bắt buộc `X-Idempotency-Key`, optimistic lock) | ✅ |
| GET | `/assignments/{id}` | ✅ |
| POST | `/assignments/{id}/return` `{reason}` · `/transfer` `{newMerchantId,newTerminalId}` | ✅ |
| GET | `/assignments/history` · `/assignments/export` · `/assignments/history/export` | ✅ |

### 3.8 Approval (`ApprovalApiService`)
| Method | Endpoint | FE |
| :-- | :-- | :-: |
| GET | `/approvals/inbox` · `/my-requests` · `/all` · `/{id}` | ✅ |
| GET | `/approvals/stats` (cards inbox + badge sidebar) | ➕ |
| POST | `/approvals/{id}/approve` `{comment}` · `/reject` `{reason}` · `/return-for-edit` `{comment}` · `/cancel` | ✅ |
| GET | `/approvals/inbox/export` | ✅ |
Rule: người tạo không tự duyệt (`POS-5003`), APPROVED → execute nghiệp vụ gốc (export/transfer/dispose) trong cùng transaction + Outbox.

### 3.9 System, Monitoring, Reports, Notification (`SystemApiService`)
| Method | Endpoint | FE |
| :-- | :-- | :-: |
| GET/POST | `/admin/users` · PUT `/{id}` · PATCH `/{id}/lock` `{isLocked}` · POST `/{id}/reset-password` · GET `/export` | ✅ |
| GET/POST | `/admin/roles` · PUT `/{id}/permissions` `{permissions: string[]}` · GET `/export` | ✅ |
| GET | `/admin/permissions` (cột ma trận) | ➕ |
| GET/PUT | `/admin/config` (body `Record<string,string>` nhóm General/SMTP/Security/Integration) | ✅ |
| GET | `/dashboard/summary` | ✅ |
| GET | `/monitoring/pos-status` | ✅ |
| GET | `/monitoring/audit-logs` · `/export` | ✅ |
| GET | `/monitoring/outbox/events` · POST `/{id}/retry` · POST `/monitoring/chaos/toggle-kafka` | ➕ |
| GET | `/reports/inventory` · `/reports/merchants` (data chart+table) | ➕ |
| GET | `/reports/inventory/export` · `/export-pdf` · `/reports/merchants/export` · `/export-pdf` | ✅ |
| GET | `/notifications` · `/unread-count` · PATCH `/{id}/read` · PATCH `/read-all` | ➕ |
| GET | `/jobs/{jobId}` · `/jobs/{jobId}/download` (export > 10k dòng) | ➕ |

---

## 4. QUY ƯỚC CODE BACKEND (BẮT BUỘC)

1. Package theo module: `com.banking.pos.{module}.{domain|application|infrastructure.persistence|infrastructure.web}` (mẫu: `identity`).
2. Controller chỉ map DTO ↔ gọi Application Service; trả `ResponseEntity<ApiResponse<...>>`.
3. DTO dùng Java `record` + Bean Validation; mapper MapStruct hoặc static `from()`.
4. List: `Specification<T>` cho filter động, `Pageable` → `PageResponse.from(page)`.
5. Mọi entity có `@Version`, `created_at/updated_at/created_by`.
6. Ghi trạng thái nghiệp vụ → cùng transaction ghi `outbox_events` + `audit_logs`.
7. `@PreAuthorize("hasAuthority('<MODULE>_<ACTION>')")` theo permission seed ở V2.
8. Data scope: list Merchant/Warehouse/Device lọc theo `businessUnitId` của user (trừ SUPER_ADMIN).
9. Export: Apache POI `SXSSFWorkbook`, ≤10k sync, >10k trả `202 {jobId}`.
10. Lỗi nghiệp vụ → `throw new PosBusinessException(ErrorCode.X)`; KHÔNG catch nuốt lỗi.

---

## 5. THỨ TỰ TRIỂN KHAI (MỖI BƯỚC PHẢI XANH MỚI SANG BƯỚC SAU)

| Bước | Nội dung | Flyway | Gate |
| :-- | :-- | :-- | :-- |
| B0 | Sửa G1–G5, `PageResponse`, `code` trong ApiResponse | – | `mvn -q verify` + `npm run build` |
| B1 | Auth hoàn chỉnh (refresh rotation, rate limit, lock), Users, Roles, Permissions, Config, Profile | V2 (đã có), V5 `system_configs` | Login thật từ UI |
| B2 | Catalog 6 resource + Organization 2 resource + export | V3 (đã có), V6 org | 8 màn Catalog/Org CRUD thật |
| B3 | Merchant + Terminal + fee policy | V4 (đã có) | 4 màn Merchant |
| B4 | PO, Import, Device record, Stock, Ledger, Outbox polling | V7 inventory/devices/outbox | Nhập 50 serial, duplicate → 409 |
| B5 | Approval engine | V8 approvals | Inbox/Detail duyệt thật |
| B6 | Export/Transfer (qua approval), Logistics | V9 | Xuất kho → OUT_OF_WAREHOUSE |
| B7 | Device detail 8 tab, FSM, lifecycle, Repair, Dispose | V10 lifecycle/repair | Device detail đủ tab |
| B8 | Assignment (idempotency, optimistic lock, return, transfer, history) | V11 assignment | Concurrent assign → 1 thành công |
| B9 | Audit log AOP, Notifications (Kafka consumer), Outbox monitor, Dashboard, POS monitoring, Reports, Jobs | V12 audit/notification | Dashboard số liệu thật |
| B10 | FE cleanup: xóa mock (G6), thêm method ➕ (G7), typed models (G8) | – | 0 `any` mới, 0 mock |

---

## 6. DEFINITION OF DONE CHO MỖI MODULE

- [ ] Flyway migration chạy sạch trên DB rỗng (`docker compose up -d postgres` → app start)
- [ ] Mọi endpoint của module trong Bảng §3 tồn tại, đúng method/URL/field
- [ ] Integration test (Testcontainers) cho happy path + 1 lỗi nghiệp vụ chính
- [ ] FE component tương ứng: bỏ mock, gọi API thật, toast lỗi thật
- [ ] Click thử mọi nút của màn hình trên `ng serve` (proxy) → không 404, không console error
- [ ] `mvn clean verify` + `npm run build` = 0 lỗi
- [ ] Tick `[x]` trong `task.md`
