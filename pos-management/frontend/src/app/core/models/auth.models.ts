/** Thông tin user sau khi đăng nhập thành công */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  businessUnitId: string | null;
  businessUnitName: string | null;
}

/** Response từ login / refresh token API */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

/** Request body cho login */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Menu item trong sidebar */
export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  permission?: string;
  children?: MenuItem[];
  badge?: number;
}
