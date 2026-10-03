import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApprovalState } from './approval.reducer';

export const selectApprovalState = createFeatureSelector<ApprovalState>('approval');

export const selectPendingApprovalBadgeCount = createSelector(
  selectApprovalState,
  (state) => state.pendingBadgeCount
);
