import { createSelector } from '@reduxjs/toolkit';
import { StateSchema } from '@/app/providers/StoreProvider';
import { buildSelector } from '@/shared/lib/store';

export const [useUserInited, getUserInited] = buildSelector(
  (state) => state.user._inited,
);

export const [useUserInfo, getUserInfo] = buildSelector(
  (state) => state.user.userInfo,
);

// Мемоизированный селектор для предотвращения ненужных ре-рендеров
const selectUserAccesses = createSelector(
  (state: StateSchema) => state.user.userInfo?.role?.accesses,
  (accesses) => accesses || []
);

export const [useUserAccesses, getUserAccesses] = buildSelector(
  selectUserAccesses,
);

export const [useUserLoggedOut, getUserLoggedOut] = buildSelector(
  (state) => state.user._loggedOut,
);
