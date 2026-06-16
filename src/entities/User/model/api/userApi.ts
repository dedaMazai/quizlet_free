import { setCookie } from 'typescript-cookie';
import {
  ApiTag,
  rtkApi,
} from '@/shared/api/rtkApi';
import { callAuthFailureHandler } from '@/shared/api/authenticatedFetch';
import { userActions } from '../slice/userSlice';
import { TLanguageUser, UserInfo, UserInfoCreate, RoleName } from '../types/user';
import { MOCK_USER } from '../const/mockUser';
import { OrderingType, PaginationResult } from '@/shared/types/types';
import { GenderUser, IS_OLD_SAFARI } from '@/shared/const/const';

interface RequestLogin {
  password: string
  email: string
}

interface RequestLoginOidc {
  username: string
  password: string
}
interface ResAuth extends UserInfo {
  access_token: string
  refresh_token: string
}

export type OrderUsers = 'created_at' | 'updated_at' | 'name' | 'email';

export interface UserFilters {
  limit?: number,
  page?: number,
  order_by?: OrderUsers
  ordering_type?: OrderingType

  uuid?: string
  uuid__in?: string[]
  email?: string
  name?: string
}

export interface UserFiltersSearch {
  limit?: number,
  page?: number,
  query?: string
}

export interface UpdateMeInfo {
  surname?: string
  name?: string
  middle_name?: string
  tel?: string
  gender?: GenderUser
  language?: TLanguageUser
  timezone?: string
  avatar_file_uuid?: string
}

const userApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    checkOidc: build.mutation<{ authorization_url: string }, void>({
      query: () => ({
        url: '/auth/oidc',
        method: 'GET',
      }),
    }),
    loginOidc: build.mutation<ResAuth, RequestLoginOidc>({
      query: (body) => ({
        url: '/auth/oidc/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, {
        dispatch,
        queryFulfilled,
      }) {
        try {
          const { data } = await queryFulfilled;
          const {
            access_token,
            refresh_token,
            ...userData
          } = data;
          if (__IS_DEV__ || IS_OLD_SAFARI) {
            setCookie('dev_access_token', access_token);
          }
          dispatch(userActions.setUserData(userData));
        } catch (err) {
          console.error('Login error:', err);
        }
      },
    }),
    login: build.mutation<ResAuth, RequestLogin>({
      query: (body) => ({
        url: '/auth/login/email-password',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, {
        dispatch,
        queryFulfilled,
      }) {
        try {
          const { data } = await queryFulfilled;
          const {
            access_token,
            refresh_token,
            ...userData
          } = data;
          if (__IS_DEV__ || IS_OLD_SAFARI) {
            setCookie('dev_access_token', access_token);
          }
          dispatch(userActions.setUserData(userData));
        } catch (err) {
          console.error('Login error:', err);
        }
      },
    }),
    loginImpersonate: build.mutation<ResAuth, {
      admin_email: string
      admin_password: string
      user_email: string
    }>({
      query: (body) => ({
        url: '/auth/impersonate/email-password',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, {
        dispatch,
        queryFulfilled,
      }) {
        try {
          const { data } = await queryFulfilled;
          const {
            access_token,
            refresh_token,
            ...userData
          } = data;
          if (__IS_DEV__ || IS_OLD_SAFARI) {
            setCookie('dev_access_token', access_token);
          }
          dispatch(userActions.setUserData(userData));
        } catch (err) {
          console.error('Login error:', err);
        }
      },
    }),
    logout: build.mutation<string, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(userActions.setExplicitLogout());
          callAuthFailureHandler();
        } catch (err) {
          console.error('Logout error:', err);
        }
      },
    }),
    sendEmailPasswordChange: build.mutation<void, string>({
      query: (email) => ({
        url: '/users/password/recovery',
        method: 'POST',
        body: {
          email,
        }
      })
    }),
    passwordRecovery: build.mutation<void, {
      new_password: string
      confirm_password: string
      secret_token: string
    }>({
      query: (body) => ({
        url: '/auth/password/recovery',
        method: 'POST',
        body,
      })
    }),
    userInfo: build.query<UserInfo, void>({
      // Авторизация замокана: возвращаем мок-пользователя без запроса к бэкенду.
      queryFn: () => ({ data: MOCK_USER }),
      providesTags: (user) => user ? [{
        type: ApiTag.User,
        id: user.uuid,
      }] : [],
      async onQueryStarted(_arg, {
        dispatch,
        queryFulfilled,
      }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userActions.setUserData(data));
        } catch (err) {
          console.error('User info error:', err);
        } finally {
          dispatch(userActions.initUserData());
        }
      },
    }),
    updateMeInfo: build.mutation<UserInfo, UpdateMeInfo>({
      query: (body) => ({
        url: '/users/me',
        method: 'PUT',
        body,
      }),
      invalidatesTags: (user) => user ? [{
        type: ApiTag.User,
        id: user.uuid,
      }] : [],
    }),
    createUser: build.mutation<UserInfo, UserInfoCreate>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: () => [
        ApiTag.Users,
      ],
    }),
    getUsers: build.query<PaginationResult<UserInfo>, UserFilters | void>({
      query: (params) => {
        const urlParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
              // Пропускаем undefined и null
              if (value === undefined || value === null) {
                  return;
              }

              // Проверяем на пустоту (булевые значения всегда пройдут проверку)
              if (!`${value}`.trim()) {
                  return;
              }

              urlParams.append(key, `${value}`)
            })
        }

        return ({
            url: '/users',
            method: 'GET',
            params: urlParams
        })
    },
      providesTags: (res) => {
        const result = res?.objects.map(({ uuid }) => ({
          type: ApiTag.User,
          id: uuid,
        }))

        return [...(result || []), ApiTag.Users]
      },
    }),
    getUsersSearch: build.query<PaginationResult<UserInfo>, UserFiltersSearch | void>({
      query: (params) => {
        const urlParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
              // Пропускаем undefined и null
              if (value === undefined || value === null) {
                  return;
              }

              // Проверяем на пустоту (булевые значения всегда пройдут проверку)
              if (!`${value}`.trim()) {
                  return;
              }

              urlParams.append(key, `${value}`)
            })
        }

        return ({
            url: '/users/search',
            method: 'GET',
            params: urlParams
        })
    },
      providesTags: (res) => {
        const result = res?.objects.map(({ uuid }) => ({
          type: ApiTag.User,
          id: uuid,
        }))

        return [...(result || []), ApiTag.Users]
      },
    }),
    getUser: build.query<UserInfo, string>({
      query: (uuid) => ({
        url: `/users/${uuid}`,
        method: 'GET',
      }),
      providesTags: (_res, _error, uuid) => ([{
        type: ApiTag.User,
        id: uuid,
      }])
    }),
    updateUser: build.mutation<void, {
      uuid: string
    } & Partial<UserInfoCreate>>({
      query: ({ uuid, ...body }) => ({
        url: `/users/${uuid}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_res, _error, { uuid }) => [
        {
          type: ApiTag.User,
          id: uuid,
        },
        ApiTag.Users,
      ],
    }),
    updateUserRole: build.mutation<void, {
      user_uuid: string
      role: RoleName
    }>({
      query: ({ user_uuid, role }) => ({
        url: `/users/${user_uuid}/roles`,
        method: 'PUT',
        body: {
          role,
        },
      }),
      invalidatesTags: (_res, _error, { user_uuid }) => [
        {
          type: ApiTag.User,
          id: user_uuid,
        },
        ApiTag.Users,
      ],
    }),
    deleteUser: build.mutation<void, string>({
      query: (uuid) => ({
        url: `/users/${uuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: () => [ApiTag.Users],
    }),
  }),
});

export const {
  useCheckOidcMutation,
  useUserInfoQuery,
  useUpdateMeInfoMutation,
  useGetUserQuery,
  useCreateUserMutation,
  useLoginMutation,
  useLoginOidcMutation,
  useLoginImpersonateMutation,
  useLogoutMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  usePasswordRecoveryMutation,
  useSendEmailPasswordChangeMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUsersSearchQuery,
} = userApi;
