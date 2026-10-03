import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserInfo } from '../../models/auth.models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login Request': props<{ username: string; password: string }>(),
    'Login Success': props<{ user: UserInfo; accessToken: string; refreshToken: string }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Refresh Token Request': emptyProps(),
    'Refresh Token Success': props<{ accessToken: string; refreshToken: string }>(),
    'Refresh Token Failure': props<{ error: string }>(),
    'Update Current User': props<{ user: UserInfo }>(),
  }
});
