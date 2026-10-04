import { Injectable, signal, computed } from '@angular/core';

export type Language = 'vi' | 'en';

export const TRANSLATIONS: Record<Language, Record<string, any>> = {
  vi: {
    NAV: {
      BRAND: 'POS Management',
      SUMMARY: 'TỔNG QUAN',
      DASHBOARD: 'Dashboard',
      CATALOG: 'QUẢN LÝ DANH MỤC',
      DEVICE_CATEGORY: 'Danh mục thiết bị',
      DEVICE_TYPE: 'Loại thiết bị',
      DEVICE_MODEL: 'Model thiết bị',
      VENDOR: 'Nhà cung cấp',
      WAREHOUSE: 'Quản lý kho',
      FEE_POLICY: 'Chính sách phí',
      BUSINESS_UNIT: 'Đơn vị kinh doanh',
      PURCHASE_ORDER: 'Đơn đặt hàng',
      MCC: 'Quản lý MCC',
      MERCHANT_MANAGEMENT: 'QUẢN LÝ MERCHANT',
      MERCHANTS: 'Danh sách merchant',
      TERMINALS: 'Quản lý TID',
      INVENTORY_MANAGEMENT: 'QUẢN LÝ XUẤT/NHẬP KHO',
      IMPORTS: 'Thông tin Nhập kho',
      EXPORTS: 'Thông tin xuất kho',
      STOCK: 'Thông tin tồn kho',
      TRANSFERS: 'Điều chuyển kho',
      LOGISTICS: 'Theo dõi vận chuyển',
      DEVICE_MANAGEMENT: 'QUẢN LÝ THIẾT BỊ',
      DEVICE_SEARCH: 'Tra cứu thiết bị',
      ASSIGNMENT_MANAGEMENT: 'QUẢN LÝ ASSIGNMENT',
      ASSIGNMENTS: 'Quản lý assignment',
      ASSIGNMENT_HISTORY: 'Lịch sử assignment',
      WORKFLOW: 'QUY TRÌNH NGHIỆP VỤ',
      APPROVAL_INBOX: 'Hộp việc cần duyệt',
      REPORTS_MONITORING: 'BÁO CÁO & GIÁM SÁT',
      POS_MONITORING: 'Giám sát POS Realtime',
      AUDIT_LOGS: 'Nhật ký Audit Logs',
      REPORT_INVENTORY: 'Báo cáo Tồn kho',
      REPORT_MERCHANT: 'Báo cáo Merchant',
      SYSTEM_ADMIN: 'QUẢN TRỊ HỆ THỐNG',
      USERS: 'Quản lý Người dùng',
      ROLES: 'Quản lý Vai trò',
      CONFIG: 'Cấu hình Tham số',
      PROFILE: 'Hồ sơ cá nhân'
    },
    HEADER: {
      LIGHT_MODE: 'Chuyển sang Light Mode',
      DARK_MODE: 'Chuyển sang Dark Mode',
      NOTIFICATIONS: 'Thông báo',
      TOGGLE_SIDEBAR: 'Thu/mở sidebar',
      PROFILE: 'Hồ sơ cá nhân',
      CHANGE_PASSWORD: 'Đổi mật khẩu',
      LOGOUT: 'Đăng xuất',
      LANGUAGE: 'Ngôn ngữ',
      VIETNAMESE: 'Tiếng Việt',
      ENGLISH: 'English'
    },
    COMMON: {
      SEARCH: 'Tìm kiếm',
      FILTER: 'Bộ lọc',
      CLEAR_FILTER: 'Xóa bộ lọc',
      EXPORT_EXCEL: 'Xuất Excel',
      IMPORT: 'Nhập dữ liệu',
      ADD_NEW: 'Thêm mới',
      EDIT: 'Chỉnh sửa',
      DELETE: 'Xóa',
      VIEW: 'Xem chi tiết',
      ACTION: 'Thao tác',
      STATUS: 'Trạng thái',
      SAVE: 'Lưu thay đổi',
      CANCEL: 'Hủy bỏ',
      CONFIRM: 'Xác nhận',
      BACK: 'Quay lại',
      REFRESH: 'Làm mới',
      SUCCESS: 'Thành công',
      ERROR: 'Lỗi hệ thống',
      ALL: 'Tất cả',
      ACTIVE: 'Hoạt động',
      INACTIVE: 'Ngưng hoạt động',
      PENDING: 'Chờ phê duyệt',
      APPROVED: 'Đã phê duyệt',
      REJECTED: 'Từ chối',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      NO_DATA: 'Không tìm thấy dữ liệu phù hợp',
      LOADING: 'Đang tải dữ liệu...',
      TOTAL_ITEMS: 'Tổng số {total} bản ghi',
      COLUMNS: 'Cột hiển thị',
      SELECT_ALL: 'Chọn tất cả',
      SEARCH_PLACEHOLDER: 'Nhập từ khóa tìm kiếm...',
      CONFIRM_DELETE_TITLE: 'Xác nhận xóa',
      CONFIRM_DELETE_MSG: 'Bạn có chắc chắn muốn xóa bản ghi này? Thao tác này không thể hoàn tác.',
      REASON: 'Lý do'
    },
    AUTH: {
      TITLE: 'Đăng Nhập Hệ Thống',
      SUBTITLE: 'Hệ thống Quản lý & Giám sát POS Tập Trung',
      USERNAME: 'Tên đăng nhập',
      PASSWORD: 'Mật khẩu',
      SUBMIT: 'Đăng nhập',
      REMEMBER_ME: 'Ghi nhớ đăng nhập',
      FORGOT_PASSWORD: 'Quên mật khẩu?',
      REQUIRED_FIELD: 'Vui lòng điền thông tin',
      INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không chính xác'
    },
    DASHBOARD: {
      TITLE: 'Tổng Quan Hệ Thống POS Management',
      SUBTITLE: 'Báo cáo thông kê thời gian thực & Chỉ số vận hành toàn hệ thống',
      TOTAL_DEVICES: 'Tổng số thiết bị POS',
      ACTIVE_DEVICES: 'POS Đang hoạt động',
      INVENTORY_DEVICES: 'POS Tồn kho sẵn sàng',
      TOTAL_MERCHANTS: 'Merchant Hoạt động',
      PENDING_APPROVALS: 'Yêu cầu chờ duyệt',
      DEVICE_STATUS_CHART: 'Tỷ lệ Trạng thái Thiết bị POS',
      RECENT_ACTIVITIES: 'Hoạt động Mới nhất',
      VIEW_ALL: 'Xem tất cả'
    },
    DEVICE_CATEGORY: {
      TITLE: 'Danh Mục Loại Thiết Bị (Device Category)',
      SUBTITLE: 'Quản lý các nhóm danh mục thiết bị POS trong toàn bộ hệ thống',
      CODE: 'Mã danh mục',
      NAME: 'Tên danh mục',
      DESCRIPTION: 'Mô tả',
      ADD_TITLE: 'Thêm mới Danh mục Thiết bị',
      EDIT_TITLE: 'Cập nhật Danh mục Thiết bị'
    },
    DEVICE_TYPE: {
      TITLE: 'Quản Lý Loại Thiết Bị (Device Type)',
      SUBTITLE: 'Quản lý chủng loại và phân loại kỹ thuật của các dòng máy POS',
      CODE: 'Mã loại thiết bị',
      NAME: 'Tên loại thiết bị',
      CATEGORY: 'Danh mục nhóm',
      ADD_TITLE: 'Thêm mới Loại Thiết bị',
      EDIT_TITLE: 'Cập nhật Loại Thiết bị'
    },
    DEVICE_MODEL: {
      TITLE: 'Quản Lý Model Thiết Bị (Device Model)',
      SUBTITLE: 'Quản lý thông tin chi tiết các dòng Model máy POS',
      CODE: 'Mã Model',
      NAME: 'Tên Model',
      VENDOR: 'Nhà sản xuất',
      ADD_TITLE: 'Thêm mới Model Thiết bị',
      EDIT_TITLE: 'Cập nhật Model Thiết bị'
    },
    VENDOR: {
      TITLE: 'Quản Lý Nhà Cung Cấp (Vendor)',
      SUBTITLE: 'Danh sách các đối tác cung cấp thiết bị và phụ kiện POS',
      CODE: 'Mã nhà cung cấp',
      NAME: 'Tên nhà cung cấp',
      CONTACT: 'Người liên hệ',
      PHONE: 'Số điện thoại',
      EMAIL: 'Email',
      ADD_TITLE: 'Thêm mới Nhà cung cấp',
      EDIT_TITLE: 'Cập nhật Nhà cung cấp'
    },
    WAREHOUSE: {
      TITLE: 'Quản Lý Kho Hàng (Warehouse)',
      SUBTITLE: 'Quản lý hệ thống kho lưu trữ thiết bị POS trên toàn quốc',
      CODE: 'Mã kho',
      NAME: 'Tên kho hàng',
      ADDRESS: 'Địa chỉ kho',
      MANAGER: 'Thủ kho phụ trách',
      ADD_TITLE: 'Thêm mới Kho hàng',
      EDIT_TITLE: 'Cập nhật Kho hàng'
    },
    FEE_POLICY: {
      TITLE: 'Quản Lý Chính Sách Phí (Fee Policy)',
      SUBTITLE: 'Cấu hình khung biểu phí thuê và giao dịch máy POS cho Merchant',
      CODE: 'Mã chính sách',
      NAME: 'Tên chính sách phí',
      RATE: 'Tỷ lệ phí (%)',
      ADD_TITLE: 'Thêm mới Chính sách phí',
      EDIT_TITLE: 'Cập nhật Chính sách phí'
    },
    BUSINESS_UNIT: {
      TITLE: 'Đơn Vị Kinh Doanh (Business Unit)',
      SUBTITLE: 'Quản lý chi nhánh, trung tâm kinh doanh phụ trách merchant',
      CODE: 'Mã đơn vị',
      NAME: 'Tên đơn vị kinh doanh',
      REGION: 'Vùng miền',
      ADD_TITLE: 'Thêm mới Đơn vị kinh doanh',
      EDIT_TITLE: 'Cập nhật Đơn vị kinh doanh'
    },
    PURCHASE_ORDER: {
      TITLE: 'Quản Lý Đơn Đặt Hàng (Purchase Order)',
      SUBTITLE: 'Quản lý các hợp đồng mua sắm thiết bị từ nhà cung cấp',
      PO_NUMBER: 'Số PO',
      ORDER_DATE: 'Ngày đặt hàng',
      TOTAL_QUANTITY: 'Số lượng đặt',
      TOTAL_AMOUNT: 'Tổng giá trị',
      ADD_TITLE: 'Tạo Đơn đặt hàng mới',
      EDIT_TITLE: 'Cập nhật Đơn đặt hàng'
    },
    MCC: {
      TITLE: 'Quản Lý Mã Ngành MCC (Merchant Category Code)',
      SUBTITLE: 'Danh mục mã phân loại ngành nghề kinh doanh merchant',
      CODE: 'Mã MCC',
      NAME: 'Mô tả ngành nghề',
      RISK_LEVEL: 'Mức độ rủi ro',
      ADD_TITLE: 'Thêm mới Mã MCC',
      EDIT_TITLE: 'Cập nhật Mã MCC'
    },
    MERCHANT: {
      TITLE: 'Quản Lý Danh Sách Merchant',
      SUBTITLE: 'Thông tin các đơn vị chấp nhận thanh toán thẻ',
      MID: 'Mã Merchant (MID)',
      NAME: 'Tên Đơn vị kinh doanh',
      TAX_CODE: 'Mã số thuế',
      ADDRESS: 'Địa chỉ lắp đặt',
      PHONE: 'Điện thoại liên hệ',
      BUSINESS_UNIT: 'Đơn vị quản lý',
      ADD_TITLE: 'Đăng ký Merchant mới',
      EDIT_TITLE: 'Cập nhật Thông tin Merchant'
    },
    TERMINAL: {
      TITLE: 'Quản Lý Mã Trạm TID (Terminal ID)',
      SUBTITLE: 'Danh sách các điểm chấp nhận thanh toán POS',
      TID: 'Mã TID',
      MID: 'Mã Merchant (MID)',
      SERIAL: 'Số Serial POS',
      MODEL: 'Dòng Model',
      ADD_TITLE: 'Thêm mới Mã TID',
      EDIT_TITLE: 'Cập nhật Mã TID'
    },
    INVENTORY_IMPORT: {
      TITLE: 'Thông Tin Nhập Kho Thiết Bị',
      SUBTITLE: 'Quản lý phiếu nhập kho thiết bị mới và thu hồi',
      RECEIPT_NO: 'Số phiếu nhập',
      IMPORT_DATE: 'Ngày nhập kho',
      WAREHOUSE: 'Kho nhập',
      QUANTITY: 'Số lượng nhập',
      ADD_TITLE: 'Tạo Phiếu Nhập Kho mới'
    },
    INVENTORY_EXPORT: {
      TITLE: 'Thông Tin Xuất Kho Thiết Bị',
      SUBTITLE: 'Quản lý phiếu xuất kho cấp phát và điều chuyển',
      DISPATCH_NO: 'Số phiếu xuất',
      EXPORT_DATE: 'Ngày xuất kho',
      WAREHOUSE: 'Kho xuất',
      QUANTITY: 'Số lượng xuất',
      ADD_TITLE: 'Tạo Phiếu Xuất Kho mới'
    },
    STOCK: {
      TITLE: 'Thông Tin Tồn Kho Thực Tế',
      SUBTITLE: 'Báo cáo chi tiết số lượng thiết bị tồn kho theo từng kho',
      WAREHOUSE: 'Kho hàng',
      MODEL: 'Dòng Model',
      AVAILABLE: 'Tồn sẵn sàng',
      ALLOCATED: 'Đã phân bổ',
      FAULTY: 'Hỏng hóc/Bảo hành'
    },
    TRANSFER: {
      TITLE: 'Điều Chuyển Kho Thiết Bị',
      SUBTITLE: 'Quản lý quá trình chuyển giao thiết bị giữa các kho',
      TRANSFER_NO: 'Mã phiếu điều chuyển',
      FROM_WAREHOUSE: 'Kho xuất',
      TO_WAREHOUSE: 'Kho nhập',
      QUANTITY: 'Số lượng',
      ADD_TITLE: 'Tạo Phiếu Điều Chuyển'
    },
    LOGISTICS: {
      TITLE: 'Theo Dõi Vận Chuyển',
      SUBTITLE: 'Giám sát tiến độ giao hàng và vận chuyển thiết bị',
      TRACKING_NO: 'Mã vận đơn',
      CARRIER: 'Đơn vị vận chuyển',
      ESTIMATED_DATE: 'Ngày dự kiến đến'
    },
    DEVICE_SEARCH: {
      TITLE: 'Tra Cứu Thông Tin Thiết Bị POS',
      SUBTITLE: 'Tra cứu thông tin vòng đời, lịch sử và trạng thái thiết bị theo Serial Number',
      SEARCH_BY_SERIAL: 'Nhập Số Serial Number để tra cứu...',
      SERIAL: 'Số Serial (S/N)',
      MAC_ADDRESS: 'Địa chỉ MAC',
      FIRMWARE: 'Phiên bản Firmware',
      CURRENT_STATUS: 'Trạng thái hiện tại',
      CURRENT_LOCATION: 'Vị trí hiện tại'
    },
    ASSIGNMENT: {
      TITLE: 'Quản Lý Phân Bổ & Gán Thiết Bị',
      SUBTITLE: 'Quản lý gán thiết bị POS cho Merchant / Kỹ thuật viên',
      ASSIGNMENT_NO: 'Mã Yêu cầu Gán',
      MERCHANT_NAME: 'Merchant nhận',
      TECHNICIAN: 'Kỹ thuật viên bàn giao',
      ASSIGN_DATE: 'Ngày bàn giao',
      ADD_TITLE: 'Tạo Yêu Cầu Gán Thiết Bị'
    },
    APPROVAL: {
      TITLE: 'Hòm Thư Phê Duyệt & Quản Lý Hồ Sơ Yêu Cầu',
      SUBTITLE: 'Duyệt các yêu cầu cấp phát, điều chuyển, thanh lý thiết bị POS',
      REQUEST_NO: 'Mã Yêu Cầu',
      TITLE_SUBMITTER: 'Tiêu Đề / Người Trình',
      DOC_TYPE: 'Loại Hồ Sơ',
      APPROVAL_STATUS: 'Trạng Thái Phê Duyệt',
      SUBMITTED_DATE: 'Ngày Trình Duyệt',
      PRIORITY: 'Độ Ưu Tiên',
      APPROVE: 'Duyệt Hồ Sơ',
      REJECT: 'Từ Chối Hồ Sơ'
    },
    POS_MONITORING: {
      TITLE: 'Giám Sát POS Realtime (Realtime Monitoring)',
      SUBTITLE: 'Theo dõi trạng thái kết nối, tình trạng giao dịch và sức khỏe mạng POS toàn hệ thống',
      ONLINE_COUNT: 'POS Đang Online',
      OFFLINE_COUNT: 'POS Mất Kết Nối',
      BATTERY_LOW: 'POS Cảnh Báo Pin Yếu',
      TRANSACTION_ERR: 'Cảnh Báo Lỗi Giao Dịch'
    },
    AUDIT_LOG: {
      TITLE: 'Nhật Ký Audit Logs Hệ Thống',
      SUBTITLE: 'Ghi lại mọi tác động, truy cập và thay đổi cấu hình dữ liệu',
      TIMESTAMP: 'Thời gian',
      USER: 'Người thực hiện',
      ACTION: 'Thao tác',
      MODULE: 'Phân hệ',
      IP_ADDRESS: 'Địa chỉ IP'
    },
    USER: {
      TITLE: 'Quản Lý Người Dùng (User Management)',
      SUBTITLE: 'Quản lý tài khoản cán bộ, phân quyền và trạng thái truy cập',
      USERNAME: 'Tên đăng nhập',
      FULLNAME: 'Họ và tên',
      EMAIL: 'Email',
      ROLE: 'Vai trò / Nhóm quyền',
      UNIT: 'Đơn vị tác nghiệp',
      ADD_TITLE: 'Thêm mới Người dùng',
      EDIT_TITLE: 'Cập nhật Người dùng'
    },
    ROLE: {
      TITLE: 'Quản Lý Vai Trò & Phân Quyền (Role & Permissions)',
      SUBTITLE: 'Cấu hình danh mục nhóm quyền và phạm vi thao tác trên hệ thống',
      ROLE_CODE: 'Mã vai trò',
      ROLE_NAME: 'Tên vai trò',
      DESCRIPTION: 'Mô tả quyền hạn',
      PERMISSIONS: 'Danh sách Quyền',
      ADD_TITLE: 'Thêm mới Vai trò',
      EDIT_TITLE: 'Cập nhật Vai trò'
    },
    CONFIG: {
      TITLE: 'Cấu Hình Tham Số Hệ Thống',
      SUBTITLE: 'Cấu hình các tham số vận hành, thời gian timeout, email & SMS gateway',
      KEY: 'Mã tham số',
      VALUE: 'Giá trị cấu hình',
      DESCRIPTION: 'Mô tả tham số'
    },
    PROFILE: {
      TITLE: 'Thông Tin Hồ Sơ Cá Nhân',
      SUBTITLE: 'Quản lý thông tin tài khoản và bảo mật cá nhân',
      PERSONAL_INFO: 'Thông tin cá nhân',
      SECURITY_INFO: 'Bảo mật & Mật khẩu',
      OLD_PASSWORD: 'Mật khẩu hiện tại',
      NEW_PASSWORD: 'Mật khẩu mới',
      CONFIRM_PASSWORD: 'Xác nhận mật khẩu mới',
      CHANGE_PASS_BTN: 'Đổi mật khẩu'
    }
  },
  en: {
    NAV: {
      BRAND: 'POS Management',
      SUMMARY: 'OVERVIEW',
      DASHBOARD: 'Dashboard',
      CATALOG: 'CATALOG MANAGEMENT',
      DEVICE_CATEGORY: 'Device Category',
      DEVICE_TYPE: 'Device Type',
      DEVICE_MODEL: 'Device Model',
      VENDOR: 'Vendor',
      WAREHOUSE: 'Warehouses',
      FEE_POLICY: 'Fee Policies',
      BUSINESS_UNIT: 'Business Units',
      PURCHASE_ORDER: 'Purchase Order',
      MCC: 'MCC Management',
      MERCHANT_MANAGEMENT: 'MERCHANT MANAGEMENT',
      MERCHANTS: 'Merchant List',
      TERMINALS: 'TID Management',
      INVENTORY_MANAGEMENT: 'INVENTORY MANAGEMENT',
      IMPORTS: 'Stock Imports',
      EXPORTS: 'Stock Exports',
      STOCK: 'Stock Levels',
      TRANSFERS: 'Stock Transfers',
      LOGISTICS: 'Logistics Tracking',
      DEVICE_MANAGEMENT: 'DEVICE MANAGEMENT',
      DEVICE_SEARCH: 'Device Search',
      ASSIGNMENT_MANAGEMENT: 'ASSIGNMENT MANAGEMENT',
      ASSIGNMENTS: 'Assignments List',
      ASSIGNMENT_HISTORY: 'Assignment History',
      WORKFLOW: 'BUSINESS WORKFLOW',
      APPROVAL_INBOX: 'Approval Inbox',
      REPORTS_MONITORING: 'REPORTS & MONITORING',
      POS_MONITORING: 'Realtime POS Monitoring',
      AUDIT_LOGS: 'Audit Logs',
      REPORT_INVENTORY: 'Inventory Reports',
      REPORT_MERCHANT: 'Merchant Reports',
      SYSTEM_ADMIN: 'SYSTEM ADMINISTRATION',
      USERS: 'User Management',
      ROLES: 'Role Management',
      CONFIG: 'System Config',
      PROFILE: 'User Profile'
    },
    HEADER: {
      LIGHT_MODE: 'Switch to Light Mode',
      DARK_MODE: 'Switch to Dark Mode',
      NOTIFICATIONS: 'Notifications',
      TOGGLE_SIDEBAR: 'Toggle Sidebar',
      PROFILE: 'User Profile',
      CHANGE_PASSWORD: 'Change Password',
      LOGOUT: 'Sign Out',
      LANGUAGE: 'Language',
      VIETNAMESE: 'Tiếng Việt',
      ENGLISH: 'English'
    },
    COMMON: {
      SEARCH: 'Search',
      FILTER: 'Filter',
      CLEAR_FILTER: 'Clear Filters',
      EXPORT_EXCEL: 'Export Excel',
      IMPORT: 'Import Data',
      ADD_NEW: 'Add New',
      EDIT: 'Edit',
      DELETE: 'Delete',
      VIEW: 'View Details',
      ACTION: 'Actions',
      STATUS: 'Status',
      SAVE: 'Save Changes',
      CANCEL: 'Cancel',
      CONFIRM: 'Confirm',
      BACK: 'Back',
      REFRESH: 'Refresh',
      SUCCESS: 'Success',
      ERROR: 'System Error',
      ALL: 'All',
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      PENDING: 'Pending Approval',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      NO_DATA: 'No matching records found',
      LOADING: 'Loading data...',
      TOTAL_ITEMS: 'Total {total} records',
      COLUMNS: 'Columns',
      SELECT_ALL: 'Select All',
      SEARCH_PLACEHOLDER: 'Enter search keyword...',
      CONFIRM_DELETE_TITLE: 'Confirm Delete',
      CONFIRM_DELETE_MSG: 'Are you sure you want to delete this record? This action cannot be undone.',
      REASON: 'Reason'
    },
    AUTH: {
      TITLE: 'System Sign In',
      SUBTITLE: 'Centralized POS Management & Monitoring System',
      USERNAME: 'Username',
      PASSWORD: 'Password',
      SUBMIT: 'Sign In',
      REMEMBER_ME: 'Remember me',
      FORGOT_PASSWORD: 'Forgot password?',
      REQUIRED_FIELD: 'Please enter required information',
      INVALID_CREDENTIALS: 'Invalid username or password'
    },
    DASHBOARD: {
      TITLE: 'POS Management Overview System',
      SUBTITLE: 'Realtime statistics & system-wide operational metrics',
      TOTAL_DEVICES: 'Total POS Terminals',
      ACTIVE_DEVICES: 'Active POS Devices',
      INVENTORY_DEVICES: 'Ready Stock Devices',
      TOTAL_MERCHANTS: 'Active Merchants',
      PENDING_APPROVALS: 'Pending Approvals',
      DEVICE_STATUS_CHART: 'POS Device Status Ratio',
      RECENT_ACTIVITIES: 'Recent Activities',
      VIEW_ALL: 'View All'
    },
    DEVICE_CATEGORY: {
      TITLE: 'Device Category Management',
      SUBTITLE: 'Manage POS device category groups across the system',
      CODE: 'Category Code',
      NAME: 'Category Name',
      DESCRIPTION: 'Description',
      ADD_TITLE: 'Add New Device Category',
      EDIT_TITLE: 'Edit Device Category'
    },
    DEVICE_TYPE: {
      TITLE: 'Device Type Management',
      SUBTITLE: 'Manage POS device models and technical classifications',
      CODE: 'Device Type Code',
      NAME: 'Device Type Name',
      CATEGORY: 'Category Group',
      ADD_TITLE: 'Add New Device Type',
      EDIT_TITLE: 'Edit Device Type'
    },
    DEVICE_MODEL: {
      TITLE: 'Device Model Management',
      SUBTITLE: 'Manage detailed specifications of POS hardware models',
      CODE: 'Model Code',
      NAME: 'Model Name',
      VENDOR: 'Manufacturer / Vendor',
      ADD_TITLE: 'Add New Device Model',
      EDIT_TITLE: 'Edit Device Model'
    },
    VENDOR: {
      TITLE: 'Vendor Management',
      SUBTITLE: 'List of hardware suppliers and POS accessory partners',
      CODE: 'Vendor Code',
      NAME: 'Vendor Name',
      CONTACT: 'Contact Person',
      PHONE: 'Phone Number',
      EMAIL: 'Email Address',
      ADD_TITLE: 'Add New Vendor',
      EDIT_TITLE: 'Edit Vendor'
    },
    WAREHOUSE: {
      TITLE: 'Warehouse Management',
      SUBTITLE: 'Manage nationwide POS storage facilities and inventory hubs',
      CODE: 'Warehouse Code',
      NAME: 'Warehouse Name',
      ADDRESS: 'Warehouse Address',
      MANAGER: 'Warehouse Keeper',
      ADD_TITLE: 'Add New Warehouse',
      EDIT_TITLE: 'Edit Warehouse'
    },
    FEE_POLICY: {
      TITLE: 'Fee Policy Management',
      SUBTITLE: 'Configure merchant POS transaction and rental fee structures',
      CODE: 'Policy Code',
      NAME: 'Policy Name',
      RATE: 'Fee Rate (%)',
      ADD_TITLE: 'Add New Fee Policy',
      EDIT_TITLE: 'Edit Fee Policy'
    },
    BUSINESS_UNIT: {
      TITLE: 'Business Units (BU)',
      SUBTITLE: 'Manage branches and business centers responsible for merchants',
      CODE: 'BU Code',
      NAME: 'Business Unit Name',
      REGION: 'Region / Territory',
      ADD_TITLE: 'Add New Business Unit',
      EDIT_TITLE: 'Edit Business Unit'
    },
    PURCHASE_ORDER: {
      TITLE: 'Purchase Order Management',
      SUBTITLE: 'Manage hardware procurement contracts and vendor orders',
      PO_NUMBER: 'PO Number',
      ORDER_DATE: 'Order Date',
      TOTAL_QUANTITY: 'Total Quantity',
      TOTAL_AMOUNT: 'Total Amount',
      ADD_TITLE: 'Create New Purchase Order',
      EDIT_TITLE: 'Edit Purchase Order'
    },
    MCC: {
      TITLE: 'Merchant Category Code (MCC) Management',
      SUBTITLE: 'Catalog of merchant industry classification codes',
      CODE: 'MCC Code',
      NAME: 'Industry Description',
      RISK_LEVEL: 'Risk Level',
      ADD_TITLE: 'Add New MCC Code',
      EDIT_TITLE: 'Edit MCC Code'
    },
    MERCHANT: {
      TITLE: 'Merchant Management',
      SUBTITLE: 'Manage card accepting merchant accounts and profiles',
      MID: 'Merchant ID (MID)',
      NAME: 'Merchant Name',
      TAX_CODE: 'Tax Code',
      ADDRESS: 'Installation Address',
      PHONE: 'Contact Phone',
      BUSINESS_UNIT: 'Assigned Business Unit',
      ADD_TITLE: 'Register New Merchant',
      EDIT_TITLE: 'Edit Merchant Profile'
    },
    TERMINAL: {
      TITLE: 'Terminal ID (TID) Management',
      SUBTITLE: 'Manage POS terminal IDs and payment acceptance points',
      TID: 'Terminal ID (TID)',
      MID: 'Merchant ID (MID)',
      SERIAL: 'POS Serial Number',
      MODEL: 'Device Model',
      ADD_TITLE: 'Add New TID',
      EDIT_TITLE: 'Edit TID'
    },
    INVENTORY_IMPORT: {
      TITLE: 'Stock Import Receipts',
      SUBTITLE: 'Manage new POS device inventory check-in and recall receipts',
      RECEIPT_NO: 'Import Receipt No',
      IMPORT_DATE: 'Import Date',
      WAREHOUSE: 'Destination Warehouse',
      QUANTITY: 'Import Quantity',
      ADD_TITLE: 'Create New Import Receipt'
    },
    INVENTORY_EXPORT: {
      TITLE: 'Stock Export Receipts',
      SUBTITLE: 'Manage POS device dispatch and deployment receipts',
      DISPATCH_NO: 'Export Dispatch No',
      EXPORT_DATE: 'Export Date',
      WAREHOUSE: 'Source Warehouse',
      QUANTITY: 'Export Quantity',
      ADD_TITLE: 'Create New Export Receipt'
    },
    STOCK: {
      TITLE: 'Real-time Stock Inventory',
      SUBTITLE: 'Detailed inventory status and stock level per warehouse',
      WAREHOUSE: 'Warehouse',
      MODEL: 'Device Model',
      AVAILABLE: 'Available Stock',
      ALLOCATED: 'Allocated Stock',
      FAULTY: 'Faulty / In Repair'
    },
    TRANSFER: {
      TITLE: 'Inter-warehouse Stock Transfers',
      SUBTITLE: 'Manage device movement between storage facilities',
      TRANSFER_NO: 'Transfer Slip No',
      FROM_WAREHOUSE: 'Origin Warehouse',
      TO_WAREHOUSE: 'Destination Warehouse',
      QUANTITY: 'Transfer Quantity',
      ADD_TITLE: 'Create Stock Transfer'
    },
    LOGISTICS: {
      TITLE: 'Logistics & Transport Tracking',
      SUBTITLE: 'Monitor delivery progress and courier tracking of POS devices',
      TRACKING_NO: 'Tracking Number',
      CARRIER: 'Logistics Carrier',
      ESTIMATED_DATE: 'Estimated Arrival'
    },
    DEVICE_SEARCH: {
      TITLE: 'POS Device Lookup',
      SUBTITLE: 'Search device lifecycle history, status, and assignment by Serial Number',
      SEARCH_BY_SERIAL: 'Enter Serial Number to search...',
      SERIAL: 'Serial Number (S/N)',
      MAC_ADDRESS: 'MAC Address',
      FIRMWARE: 'Firmware Version',
      CURRENT_STATUS: 'Current Status',
      CURRENT_LOCATION: 'Current Location'
    },
    ASSIGNMENT: {
      TITLE: 'POS Device Assignment & Deployment',
      SUBTITLE: 'Manage terminal assignment to merchants and technicians',
      ASSIGNMENT_NO: 'Assignment Ticket Code',
      MERCHANT_NAME: 'Assigned Merchant',
      TECHNICIAN: 'Handover Technician',
      ASSIGN_DATE: 'Handover Date',
      ADD_TITLE: 'Create Device Assignment'
    },
    APPROVAL: {
      TITLE: 'Approval Inbox & Ticket Request Center',
      SUBTITLE: 'Review and process POS deployment, transfer, and disposal tickets',
      REQUEST_NO: 'Request Code',
      TITLE_SUBMITTER: 'Title / Submitter',
      DOC_TYPE: 'Document Type',
      APPROVAL_STATUS: 'Approval Status',
      SUBMITTED_DATE: 'Submission Date',
      PRIORITY: 'Priority',
      APPROVE: 'Approve Request',
      REJECT: 'Reject Request'
    },
    POS_MONITORING: {
      TITLE: 'Realtime POS Monitoring Dashboard',
      SUBTITLE: 'Track connectivity status, transaction health, and network telemetry',
      ONLINE_COUNT: 'POS Devices Online',
      OFFLINE_COUNT: 'POS Devices Offline',
      BATTERY_LOW: 'Low Battery Warning',
      TRANSACTION_ERR: 'Transaction Error Alerts'
    },
    AUDIT_LOG: {
      TITLE: 'System Audit Logs',
      SUBTITLE: 'Record all user access, security logs, and data configuration modifications',
      TIMESTAMP: 'Timestamp',
      USER: 'User / Actor',
      ACTION: 'Action Taken',
      MODULE: 'System Module',
      IP_ADDRESS: 'IP Address'
    },
    USER: {
      TITLE: 'User Management',
      SUBTITLE: 'Manage officer accounts, role assignments, and access permissions',
      USERNAME: 'Username',
      FULLNAME: 'Full Name',
      EMAIL: 'Email Address',
      ROLE: 'Role / Permission Group',
      UNIT: 'Business Unit / Branch',
      ADD_TITLE: 'Add New User',
      EDIT_TITLE: 'Edit User Account'
    },
    ROLE: {
      TITLE: 'Role & Permission Management',
      SUBTITLE: 'Configure security roles, access policies, and permission scopes',
      ROLE_CODE: 'Role Code',
      ROLE_NAME: 'Role Name',
      DESCRIPTION: 'Permission Description',
      PERMISSIONS: 'Permissions List',
      ADD_TITLE: 'Add New Role',
      EDIT_TITLE: 'Edit Role'
    },
    CONFIG: {
      TITLE: 'System Parameters Configuration',
      SUBTITLE: 'Configure global system parameters, timeout limits, email & SMS gateway',
      KEY: 'Parameter Key',
      VALUE: 'Configuration Value',
      DESCRIPTION: 'Parameter Description'
    },
    PROFILE: {
      TITLE: 'User Profile & Security',
      SUBTITLE: 'Manage your personal account profile and credentials',
      PERSONAL_INFO: 'Personal Information',
      SECURITY_INFO: 'Security & Password',
      OLD_PASSWORD: 'Current Password',
      NEW_PASSWORD: 'New Password',
      CONFIRM_PASSWORD: 'Confirm New Password',
      CHANGE_PASS_BTN: 'Change Password'
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'pos_app_lang';
  
  /** Current active language signal */
  readonly currentLang = signal<Language>(this.getInitialLanguage());

  /** Reactive signal containing the translation object for the active language */
  readonly currentTranslations = computed(() => TRANSLATIONS[this.currentLang()]);

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return (saved === 'en' || saved === 'vi') ? saved : 'vi';
  }

  setLanguage(lang: Language): void {
    if (this.currentLang() !== lang) {
      this.currentLang.set(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }

  toggleLanguage(): void {
    const next = this.currentLang() === 'vi' ? 'en' : 'vi';
    this.setLanguage(next);
  }

  /**
   * Translate key, e.g. 'NAV.DASHBOARD' or 'COMMON.SEARCH'
   */
  translate(key: string, params?: Record<string, string | number>): string {
    if (!key) return '';
    
    const lang = this.currentLang();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['vi'];
    
    const parts = key.split('.');
    let res: any = dict;
    
    for (const part of parts) {
      if (res && typeof res === 'object' && part in res) {
        res = res[part];
      } else {
        // Fallback to Vietnamese if missing in target lang
        let fb: any = TRANSLATIONS['vi'];
        for (const fbPart of parts) {
          if (fb && typeof fb === 'object' && fbPart in fb) {
            fb = fb[fbPart];
          } else {
            return key; // return key if not found in fallback
          }
        }
        res = fb;
        break;
      }
    }

    if (typeof res !== 'string') {
      return key;
    }

    if (params) {
      Object.keys(params).forEach(pKey => {
        res = res.replace(new RegExp(`{\\s*${pKey}\\s*}`, 'g'), String(params[pKey]));
      });
    }

    return res;
  }

  /** Short helper method */
  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }
}
