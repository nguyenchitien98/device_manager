import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

/**
 * Routing chính của POS Management Application.
 * Tất cả 37 màn hình web sử dụng Standalone Components và Lazy Loading.
 */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Đăng Nhập — POS Management System',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard — Tổng quan POS Management',
      },

      // Module 1: Catalog & Organization
      {
        path: 'catalog/device-categories',
        loadComponent: () =>
          import('./features/catalog/device-category/device-category-list.component').then(m => m.DeviceCategoryListPageComponent),
        title: 'Quản Lý Danh Mục Thiết Bị — POS Management',
      },
      {
        path: 'catalog/device-types',
        loadComponent: () =>
          import('./features/catalog/device-type/device-type-list.component').then(m => m.DeviceTypeListPageComponent),
        title: 'Quản Lý Loại Thiết Bị — POS Management',
      },
      {
        path: 'catalog/device-models',
        loadComponent: () =>
          import('./features/catalog/device-model/device-model-list.component').then(m => m.DeviceModelListPageComponent),
        title: 'Quản Lý Model POS — POS Management',
      },
      {
        path: 'catalog/vendors',
        loadComponent: () =>
          import('./features/catalog/vendor/vendor-list.component').then(m => m.VendorListPageComponent),
        title: 'Quản Lý Nhà Cung Cấp — POS Management',
      },
      {
        path: 'security/key-injections',
        loadComponent: () =>
          import('./features/security/key-injection-list/key-injection-list.component').then(m => m.KeyInjectionListComponent),
        title: 'Phòng Nạp Khóa HSM PCI DSS — POS Management',
      },
      {
        path: 'catalog/mcc',
        loadComponent: () =>
          import('./features/catalog/mcc/mcc-list.component').then(m => m.MccListPageComponent),
        title: 'Quản Lý Mã MCC — POS Management',
      },
      {
        path: 'catalog/fee-policies',
        loadComponent: () =>
          import('./features/catalog/fee-policy/fee-policy-list.component').then(m => m.FeePolicyListPageComponent),
        title: 'Quản Lý Chính Sách Phí — POS Management',
      },
      {
        path: 'finance/rental-fees',
        loadComponent: () =>
          import('./features/finance/rental-fee-policy-list/rental-fee-policy-list.component').then(m => m.RentalFeePolicyListComponent),
        title: 'Tính Phí Thuê Máy & Phạt Doanh Số — POS Management',
      },
      {
        path: 'crm/tickets',
        loadComponent: () =>
          import('./features/crm/ticket-list/ticket-list.component').then(m => m.TicketListComponent),
        title: 'Hỗ Trợ Kỹ Thuật CRM — POS Management',
      },
      {
        path: 'organization/business-units',
        loadComponent: () =>
          import('./features/organization/business-unit/business-unit-list.component').then(m => m.BusinessUnitListPageComponent),
        title: 'Đơn Vị Kinh Doanh — POS Management',
      },
      {
        path: 'organization/warehouses',
        loadComponent: () =>
          import('./features/organization/warehouse/warehouse-list.component').then(m => m.WarehouseListPageComponent),
        title: 'Quản Lý Kho Thiết Bị — POS Management',
      },
      {
        path: 'inventory/purchase-orders',
        loadComponent: () =>
          import('./features/inventory/purchase-order/purchase-order-list.component').then(m => m.PurchaseOrderListPageComponent),
        title: 'Đơn Hàng Mua POS (PO) — POS Management',
      },
      {
        path: 'telecom/sims',
        loadComponent: () =>
          import('./features/telecom/sim-list/sim-list.component').then(m => m.SimListComponent),
        title: 'Quản Lý SIM 4G & SAM — POS Management',
      },

      // Module 2: Merchant & TID
      {
        path: 'merchant/merchants',
        loadComponent: () =>
          import('./features/merchant/merchant-list/merchant-list.component').then(m => m.MerchantListPageComponent),
        title: 'Danh Sách Merchant — POS Management',
      },
      {
        path: 'merchant/detail/:id',
        loadComponent: () =>
          import('./features/merchant/merchant-detail/merchant-detail.component').then(m => m.MerchantDetailPageComponent),
        title: 'Chi Tiết Merchant — POS Management',
      },
      {
        path: 'merchant/terminals',
        loadComponent: () =>
          import('./features/merchant/terminal-list/terminal-list.component').then(m => m.TerminalListPageComponent),
        title: 'Quản Lý TID Terminal — POS Management',
      },
      {
        path: 'merchant/terminal-detail/:id',
        loadComponent: () =>
          import('./features/merchant/terminal-detail/terminal-detail.component').then(m => m.TerminalDetailPageComponent),
        title: 'Chi Tiết TID Terminal — POS Management',
      },

      // Module 3: Inventory & Logistics
      {
        path: 'inventory/imports',
        loadComponent: () =>
          import('./features/inventory/import-list/import-list.component').then(m => m.ImportListPageComponent),
        title: 'Danh Sách Nhập Kho — POS Management',
      },
      {
        path: 'inventory/import-create',
        loadComponent: () =>
          import('./features/inventory/import-create/import-create.component').then(m => m.ImportCreatePageComponent),
        title: 'Tạo Phiếu Nhập Kho — POS Management',
      },
      {
        path: 'inventory/exports',
        loadComponent: () =>
          import('./features/inventory/export-list/export-list.component').then(m => m.ExportListPageComponent),
        title: 'Danh Sách Xuất Kho — POS Management',
      },
      {
        path: 'inventory/export-create',
        loadComponent: () =>
          import('./features/inventory/export-create/export-create.component').then(m => m.ExportCreatePageComponent),
        title: 'Tạo Phiếu Xuất Kho — POS Management',
      },
      {
        path: 'inventory/device-lookup',
        loadComponent: () =>
          import('./features/inventory/device-lookup/device-lookup.component').then(m => m.DeviceLookupComponent),
        title: 'Tra Cứu Thiết Bị POS VPBank Standard — POS Management',
      },
      {
        path: 'inventory/stock',
        loadComponent: () =>
          import('./features/inventory/stock-list/stock-list.component').then(m => m.StockListPageComponent),
        title: 'Thông Tin Tồn Kho — POS Management',
      },
      {
        path: 'inventory/transfers',
        loadComponent: () =>
          import('./features/inventory/transfer-list/transfer-list.component').then(m => m.TransferListPageComponent),
        title: 'Danh Sách Điều Chuyển Kho — POS Management',
      },
      {
        path: 'inventory/transfer-create',
        loadComponent: () =>
          import('./features/inventory/transfer-create/transfer-create.component').then(m => m.TransferCreatePageComponent),
        title: 'Tạo Lệnh Điều Chuyển Kho — POS Management',
      },
      {
        path: 'inventory/logistics',
        loadComponent: () =>
          import('./features/inventory/logistics-list/logistics-list.component').then(m => m.LogisticsListPageComponent),
        title: 'Theo Dõi Vận Chuyển — POS Management',
      },

      // Module 4: Device Search & Lifecycle
      {
        path: 'device/search',
        loadComponent: () =>
          import('./features/device/device-search/device-search.component').then(m => m.DeviceSearchPageComponent),
        title: 'Tra Cứu Thiết Bị POS — POS Management',
      },
      {
        path: 'device/detail/:id',
        loadComponent: () =>
          import('./features/device/device-detail/device-detail.component').then(m => m.DeviceDetailPageComponent),
        title: 'Chi Tiết Thiết Bị POS — POS Management',
      },

      // Module 5: Assignment
      {
        path: 'assignment/list',
        loadComponent: () =>
          import('./features/assignment/assignment-list/assignment-list.component').then(m => m.AssignmentListPageComponent),
        title: 'Quản Lý Bàn Giao Terminal — POS Management',
      },
      {
        path: 'assignment/create',
        loadComponent: () =>
          import('./features/assignment/assignment-create/assignment-create.component').then(m => m.AssignmentCreatePageComponent),
        title: 'Tạo Lệnh Bàn Giao POS — POS Management',
      },
      {
        path: 'assignment/history',
        loadComponent: () =>
          import('./features/assignment/assignment-history/assignment-history.component').then(m => m.AssignmentHistoryPageComponent),
        title: 'Lịch Sử Bàn Giao — POS Management',
      },

      // Module 6: Approval Workflow
      {
        path: 'approval/inbox',
        loadComponent: () =>
          import('./features/approval/approval-inbox/approval-inbox.component').then(m => m.ApprovalInboxPageComponent),
        title: 'Hòm Việc Cần Duyệt — POS Management',
      },
      {
        path: 'approval/detail/:id',
        loadComponent: () =>
          import('./features/approval/approval-detail/approval-detail.component').then(m => m.ApprovalDetailPageComponent),
        title: 'Chi Tiết Hồ Sơ Trình Duyệt — POS Management',
      },

      // Module 7: Monitoring & Reports
      {
        path: 'monitoring/pos',
        loadComponent: () =>
          import('./features/monitoring/pos-monitoring/pos-monitoring.component').then(m => m.PosMonitoringPageComponent),
        title: 'Giám Sát Trạng Thái Realtime POS — POS Management',
      },
      {
        path: 'monitoring/audit-logs',
        loadComponent: () =>
          import('./features/monitoring/audit-log-list/audit-log-list.component').then(m => m.AuditLogListPageComponent),
        title: 'Nhật Ký Tác Động Hệ Thống — POS Management',
      },
      {
        path: 'monitoring/inactivity',
        loadComponent: () =>
          import('./features/monitoring/inactivity-alert-list/inactivity-alert-list.component').then(m => m.InactivityAlertListComponent),
        title: 'Cảnh Báo POS Inactive — POS Management',
      },
      {
        path: 'reports/inventory',
        loadComponent: () =>
          import('./features/reports/report-inventory/report-inventory.component').then(m => m.ReportInventoryPageComponent),
        title: 'Báo Cáo Tồn Kho POS — POS Management',
      },
      {
        path: 'reports/merchant',
        loadComponent: () =>
          import('./features/reports/report-merchant/report-merchant.component').then(m => m.ReportMerchantPageComponent),
        title: 'Báo Cáo Hiệu Quả Merchant — POS Management',
      },

      // Module 8: System & Profile
      {
        path: 'system/users',
        loadComponent: () =>
          import('./features/system/user-management/user-management.component').then(m => m.UserManagementPageComponent),
        title: 'Quản Lý Người Dùng — POS Management',
      },
      {
        path: 'system/roles',
        loadComponent: () =>
          import('./features/system/role-management/role-management.component').then(m => m.RoleManagementPageComponent),
        title: 'Quản Lý Vai Trò & Quyền Hạn — POS Management',
      },
      {
        path: 'system/config',
        loadComponent: () =>
          import('./features/system/system-config/system-config.component').then(m => m.SystemConfigPageComponent),
        title: 'Cấu Hình Hệ Thống — POS Management',
      },
      {
        path: 'system/profile',
        loadComponent: () =>
          import('./features/system/user-profile/user-profile.component').then(m => m.UserProfilePageComponent),
        title: 'Thông Tin Cá Nhân — POS Management',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
