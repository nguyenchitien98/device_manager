import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ApprovalActions = createActionGroup({
  source: 'Approval',
  events: {
    'Set Badge Count': props<{ count: number }>(),
    'Increment Badge': emptyProps(),
    'Decrement Badge': emptyProps(),
  }
});
