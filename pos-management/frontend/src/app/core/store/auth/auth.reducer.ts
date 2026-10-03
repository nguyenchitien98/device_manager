import { createReducer, on } from '@ngrx/store';
import { UserInfo } from '../../models/auth.models';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginRequest, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user, accessToken, refreshToken }) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    return {
      ...state,
      user,
      accessToken,
      refreshToken,
      isLoading: false,
      error: null,
    };
  }),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(AuthActions.logout, (state) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return {
      ...state,
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    };
  }),
  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    return {
      ...state,
      accessToken,
      refreshToken,
    };
  }),
  on(AuthActions.updateCurrentUser, (state, { user }) => ({
    ...state,
    user,
  }))
);
