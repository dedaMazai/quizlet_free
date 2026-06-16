import {
  PayloadAction,
} from '@reduxjs/toolkit';
import { removeCookie } from 'typescript-cookie';
import { buildSlice } from '@/shared/lib/store';
import {
  UserInfo,
  UserSchema,
} from '../types/user';
import { IS_OLD_SAFARI } from '@/shared/const/const';
import { MOCK_USER } from '../const/mockUser';

// Авторизация замокана: приложение стартует уже залогиненным обычным пользователем.
const initialState: UserSchema = {
  _inited: true,
  _loggedOut: false,
  userInfo: MOCK_USER,
};

export const userSlice = buildSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state: UserSchema, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      state._loggedOut = false;
      // выполняется при авторизации
    },
    initUserData: {
      reducer: (state: UserSchema) => {
        state._inited = true;
      },
      prepare: () => ({ payload: undefined }),
    },
    setExplicitLogout: {
      reducer: (state: UserSchema) => {
        state._loggedOut = true;
      },
      prepare: () => ({ payload: undefined }),
    },
    logout: {
      reducer: (state: UserSchema) => {
        if (__IS_DEV__ || IS_OLD_SAFARI) {
          removeCookie('dev_access_token');
        }
        state.userInfo = undefined;
        // выход
      },
      prepare: () => ({ payload: undefined }),
    },
  },
});

export const {
  actions: userActions,
  reducer: userReducer,
  useActions: useUserActions,
} = userSlice;
