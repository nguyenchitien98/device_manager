import { createReducer, on } from '@ngrx/store';
import { ApprovalActions } from './approval.actions';

export interface ApprovalState {
  pendingBadgeCount: number;
}

export const initialApprovalState: ApprovalState = {
  pendingBadgeCount: 5,
};

export const approvalReducer = createReducer(
  initialApprovalState,
  on(ApprovalActions.setBadgeCount, (state, { count }) => ({
    ...state,
    pendingBadgeCount: count
  })),
  on(ApprovalActions.incrementBadge, (state) => ({
    ...state,
    pendingBadgeCount: state.pendingBadgeCount + 1
  })),
  on(ApprovalActions.decrementBadge, (state) => ({
    ...state,
    pendingBadgeCount: Math.max(0, state.pendingBadgeCount - 1)
  }))
);
