# POS Management System — AI Module Implementation Guide (AI_MODULE_IMPLEMENTATION_GUIDE.md)

> **KIM CHỈ NAM DÀNH CHO AI ANTIGRAVITY AGENT KHI THÊM MODULE MỚI**
> Tài liệu này hướng dẫn chi tiết quy trình 10 bước chuẩn mực để AI Agent phát triển bất kỳ Module mới nào trong dự án POS Management mà không vi phạm quy tắc thiết kế hay gây vỡ kiến trúc hệ thống.

---

## 🧭 1. QUY TẮC NGUYÊN TẮC BẮT BUỘC (MANDATORY RULES)

Trước khi viết bất kỳ dòng code nào, AI Agent MUST tuân thủ nghiêm ngặt các điều khoản sau (theo `AGENTS.md`):

1. **Shared UI Components 100%:** Tuyệt đối KHÔNG tự viết thẻ HTML thô (`<button>`, `<input>`, `<select>`, `<table>`, `<badge>`). Bắt buộc phải dùng bộ Shared Components:
   - `<pos-button>` cho mọi nút bấm.
   - `<pos-input>` cho mọi ô nhập liệu / tìm kiếm.
   - `<pos-select>` cho mọi ô chọn Dropdown.
   - `<pos-badge>` cho mọi huy hiệu trạng thái.
   - `<pos-table>` cho mọi bảng dữ liệu.
   - `<pos-pagination>` cho mọi phân trang.
   - `<pos-modal>` cho mọi cửa sổ Pop-up.
   - `<pos-confirm-dialog>` cho mọi xác nhận xóa/duyệt.
2. **Angular Signals First:** 100% state trong Angular Component / Service phải dùng `signal()`, `computed()`, `input()`, `output()`.
3. **Change Detection:** Mọi Component phải khai báo `changeDetection: ChangeDetectionStrategy.OnPush`.
4. **Standalone Components:** 100% components là Standalone (không dùng NgModule).
5. **Strict TypeScript & Java Typing:** Tuyệt đối KHÔNG dùng type `any`. Mọi DTO, Model, Event đều phải có Interface/Type rõ ràng.
6. **Automation Test ID:** Tất cả các thành phần UI khởi tạo trên HTML bắt buộc phải truyền `btnId`, `inputId`, `selectId` để Cypress/Playwright automation test nhận diện.
7. **Flyway Migration:** Mọi thay đổi Database phải qua script Migration Flyway `VXX__...sql`. Tuyệt đối không dùng Hibernate `ddl-auto`.

---

## 🛠️ 2. QUY TRÌNH 10 BƯỚC PHÁT TRIỂN MODULE MỚI

```text
Step 1: Database Migration (Flyway VXX)
   │
   ▼
Step 2: Backend Domain Entity & JPA Repository
   │
   ▼
Step 3: Backend DTOs & Validation Contracts
   │
   ▼
Step 4: Backend Service / UseCase (Business Logic & Audit Trail)
   │
   ▼
Step 5: Backend Web REST Controller (OpenAPI Specs)
   │
   ▼
Step 6: Frontend TypeScript Interfaces & Models
   │
   ▼
Step 7: Frontend Reactive Signal Service
   │
   ▼
Step 8: Frontend UI Components (Shared UI Library 100%)
   │
   ▼
Step 9: Router Registration & Navigation Menu Update
   │
   ▼
Step 10: Final Verification Pass (Backend & Frontend Build Verification)
```

---

## 📝 3. CHI TIẾT TỪNG BƯỚC KÈM CODE MẪU CHUẨN (TEMPLATE CHEAT SHEET)

### BƯỚC 1: Flyway Database Migration Script

- **Đường dẫn:** `pos-management/backend/pos-core/src/main/resources/db/migration/VXX__create_<module>_tables.sql`
- **Quy tắc:** UUID làm PK, Timestamps UTC, Optimistic Locking `version`, Index cho trường filter/search.

```sql
-- VXX__create_example_module_tables.sql
CREATE TABLE example_records (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    business_unit_id UUID       REFERENCES business_units(id),
    notes           TEXT,
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_example_status ON example_records(status);
CREATE INDEX idx_example_code ON example_records(code);
```

---

### BƯỚC 2: Backend JPA Entity & Repository

- **Package:** `com.banking.pos.<module>.infrastructure.persistence.entity` & `.repository`

```java
// JPA Entity
package com.banking.pos.example.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "example_records")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExampleRecordJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "business_unit_id")
    private UUID businessUnitId;

    private String notes;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
```

```java
// JPA Repository
package com.banking.pos.example.infrastructure.persistence.repository;

import com.banking.pos.example.infrastructure.persistence.entity.ExampleRecordJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;
import java.util.UUID;

public interface ExampleRecordJpaRepository extends JpaRepository<ExampleRecordJpaEntity, UUID>, JpaSpecificationExecutor<ExampleRecordJpaEntity> {
    Optional<ExampleRecordJpaEntity> findByCode(String code);
    boolean existsByCode(String code);
}
```

---

### BƯỚC 3 & 4: DTOs, Service & Business Logic

- **Package:** `com.banking.pos.<module>.application.service`

```java
package com.banking.pos.example.application.service;

import com.banking.pos.common.exception.BusinessException;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.example.dto.CreateExampleRequest;
import com.banking.pos.example.dto.ExampleResponse;
import com.banking.pos.example.infrastructure.persistence.entity.ExampleRecordJpaEntity;
import com.banking.pos.example.infrastructure.persistence.repository.ExampleRecordJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExampleService {
    private final ExampleRecordJpaRepository repository;

    @Transactional(readOnly = true)
    public PageResponse<ExampleResponse> search(String query, String status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var pageResult = repository.findAll(pageable).map(this::mapToResponse);
        return PageResponse.of(pageResult);
    }

    @Transactional
    public ExampleResponse create(CreateExampleRequest request) {
        if (repository.existsByCode(request.code())) {
            throw new BusinessException("POS-4001", "Mã bản ghi đã tồn tại");
        }
        var entity = ExampleRecordJpaEntity.builder()
                .code(request.code())
                .name(request.name())
                .status("ACTIVE")
                .notes(request.notes())
                .build();
        return mapToResponse(repository.save(entity));
    }

    private ExampleResponse mapToResponse(ExampleRecordJpaEntity entity) {
        return new ExampleResponse(
                entity.getId(),
                entity.getCode(),
                entity.getName(),
                entity.getStatus(),
                entity.getNotes(),
                entity.getCreatedAt()
        );
    }
}
```

---

### BƯỚC 5: Web REST Controller

- **Package:** `com.banking.pos.<module>.infrastructure.web`

```java
package com.banking.pos.example.infrastructure.web;

import com.banking.pos.common.response.ApiResponse;
import com.banking.pos.common.response.PageResponse;
import com.banking.pos.example.application.service.ExampleService;
import com.banking.pos.example.dto.CreateExampleRequest;
import com.banking.pos.example.dto.ExampleResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/examples")
@RequiredArgsConstructor
public class ExampleController {
    private final ExampleService exampleService;

    @GetMapping
    @PreAuthorize("hasAuthority('EXAMPLE_VIEW')")
    public ApiResponse<PageResponse<ExampleResponse>> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(exampleService.search(query, status, page, size));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('EXAMPLE_CREATE')")
    public ApiResponse<ExampleResponse> create(@Valid @RequestBody CreateExampleRequest request) {
        return ApiResponse.success("Tạo mới thành công", exampleService.create(request));
    }
}
```

---

### BƯỚC 6: Frontend Models & Interface

- **Đường dẫn:** `pos-management/frontend/src/app/core/models/example.model.ts`

```typescript
export interface ExampleRecord {
  id: string;
  code: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  createdAt: string;
}

export interface CreateExampleRequest {
  code: string;
  name: string;
  notes?: string;
}
```

---

### BƯỚC 7: Frontend Reactive Signal Service

- **Đường dẫn:** `pos-management/frontend/src/app/core/services/example.service.ts`

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { ExampleRecord, CreateExampleRequest } from '../models/example.model';
import { PageResponse } from '../models/api-response.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExampleService {
  private api = inject(BaseApiService);

  // Reactive Signals
  loading = signal<boolean>(false);
  records = signal<ExampleRecord[]>([]);
  totalItems = signal<number>(0);

  getRecords(page = 0, size = 10, query = ''): Observable<PageResponse<ExampleRecord>> {
    this.loading.set(true);
    return this.api.get<PageResponse<ExampleRecord>>('/examples', { page, size, query }).pipe(
      tap({
        next: (res) => {
          this.records.set(res.content);
          this.totalItems.set(res.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }

  create(req: CreateExampleRequest): Observable<ExampleRecord> {
    return this.api.post<ExampleRecord>('/examples', req);
  }
}
```

---

### BƯỚC 8: Frontend Standalone UI Component (Dùng 100% Shared UI)

- **Đường dẫn:** `pos-management/frontend/src/app/features/example/example-list.component.ts`

```typescript
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PosButtonComponent,
  PosInputComponent,
  PosBadgeComponent,
  PosTableComponent,
  PosPaginationComponent,
  PosModalComponent,
  TableColumn
} from '@shared';
import { ExampleService } from '@core/services/example.service';
import { ExampleRecord } from '@core/models/example.model';

@Component({
  selector: 'app-example-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    PosButtonComponent,
    PosInputComponent,
    PosBadgeComponent,
    PosTableComponent,
    PosPaginationComponent,
    PosModalComponent
  ],
  templateUrl: './example-list.component.html',
  styleUrls: ['./example-list.component.scss']
})
export class ExampleListComponent implements OnInit {
  protected service = inject(ExampleService);

  searchQuery = signal('');
  currentPage = signal(0);
  pageSize = signal(10);
  isModalOpen = signal(false);

  columns: TableColumn<ExampleRecord>[] = [
    { key: 'code', title: 'Mã', width: '150px' },
    { key: 'name', title: 'Tên Bản Ghi' },
    { key: 'status', title: 'Trạng Thái', width: '120px' },
    { key: 'createdAt', title: 'Ngày Tạo', width: '180px' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getRecords(this.currentPage(), this.pageSize(), this.searchQuery()).subscribe();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  openCreateModal() {
    this.isModalOpen.set(true);
  }
}
```

```html
<!-- example-list.component.html -->
<div class="page-container">
  <div class="page-header d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 class="page-title">Quản Lý Bản Ghi Mẫu</h2>
      <p class="text-muted">Danh sách và tìm kiếm bản ghi trong hệ thống</p>
    </div>
    <pos-button
      btnId="btn-create-example"
      variant="primary"
      icon="add"
      (click)="openCreateModal()">
      Tạo Bản Ghi
    </pos-button>
  </div>

  <div class="filter-bar mb-3 d-flex gap-3">
    <pos-input
      inputId="input-search-example"
      placeholder="Tìm kiếm theo mã, tên..."
      [(ngModel)]="searchQuery"
      (keyup.enter)="loadData()"
      icon="search">
    </pos-input>
  </div>

  <pos-table
    [columns]="columns"
    [data]="service.records()"
    [loading]="service.loading()">
    <ng-template #cellTemplate let-row let-key="columnKey">
      <ng-container [ngSwitch]="key">
        <span *ngSwitchCase="'status'">
          <pos-badge [variant]="row.status === 'ACTIVE' ? 'success' : 'danger'">
            {{ row.status }}
          </pos-badge>
        </span>
        <span *ngSwitchDefault>{{ row[key] }}</span>
      </ng-container>
    </ng-template>
  </pos-table>

  <div class="mt-3">
    <pos-pagination
      [totalItems]="service.totalItems()"
      [pageSize]="pageSize()"
      [currentPage]="currentPage() + 1"
      (pageChange)="onPageChange($event - 1)">
    </pos-pagination>
  </div>
</div>

<pos-modal
  [isOpen]="isModalOpen()"
  title="Tạo Bản Ghi Mới"
  (closeModal)="isModalOpen.set(false)">
  <div class="modal-body">
    <p>Nội dung form khởi tạo tại đây...</p>
  </div>
</pos-modal>
```

---

### BƯỚC 9: Angular Router & Sidebar Navigation

- **Đăng ký Route:** Trong `src/app/app.routes.ts`
```typescript
{
  path: 'examples',
  loadComponent: () => import('./features/example/example-list.component').then(m => m.ExampleListComponent),
  canActivate: [AuthGuard]
}
```
- **Sidebar Menu:** Thêm mục điều hướng tương ứng vào `src/app/features/layout/sidebar/sidebar.component.ts`.

---

### BƯỚC 10: Double Verification Pass (Kiểm thử 2 lớp)

Mọi task hoàn thành MUST vượt qua 2 lệnh sau:

1. **Backend Build & Verification:**
   ```bash
   cd pos-management/backend
   mvn clean verify
   ```
   *Yêu cầu:* 0 lỗi compilation, Flyway migration chạy xanh 100%.

2. **Frontend Build Verification:**
   ```bash
   cd pos-management/frontend
   npm run build
   ```
   *Yêu cầu:* 0 lỗi TypeScript, 0 lỗi SCSS template compilation.

---

## 📋 CHECKLIST CHO AI AGENT TRƯỚC KHI BÀN GIAO TASK

- [ ] Đã viết Flyway migration SQL với UUID extension và timestamps UTC?
- [ ] JPA Entity có đầy đủ `@Version` để chống ghi đè dữ liệu (Optimistic Locking)?
- [ ] Endpoint REST API dùng đúng chuẩn `ApiResponse<T>` và `PageResponse<T>`?
- [ ] Component Angular là Standalone Component với `OnPush` Change Detection?
- [ ] Component Angular đã sử dụng **100% Shared UI Components** (`pos-button`, `pos-input`, `pos-table`...)?
- [ ] Mỗi thành phần UI trên HTML đều có thuộc tính `btnId`, `inputId`, `selectId`?
- [ ] Không có type `any` nào xuất hiện trong TypeScript hay Java code?
- [ ] Đã chạy `mvn clean verify` và `npm run build` xác nhận **0 LỖI**?
