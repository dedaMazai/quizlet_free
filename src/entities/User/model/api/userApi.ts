import { setCookie } from 'typescript-cookie';
import {
  ApiTag,
  rtkApi,
} from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';
import { userActions } from '../slice/userSlice';
import { TLanguageUser, UserInfo, UserInfoCreate, RoleName } from '../types/user';
import { fetchUserInfo } from '../lib/fetchUserInfo';
import { mapProfile, ProfileRow } from '../lib/mapProfile';
import { OrderingType, PaginationResult } from '@/shared/types/types';
import { GenderUser, IS_OLD_SAFARI } from '@/shared/const/const';

interface RequestLogin {
  password: string
  email: string
}

interface RequestRegister {
  email: string
  password: string
  name?: string
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
  name: string
  middle_name?: string
  tel?: string
  description?: string
  avatar?: string
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
    login: build.mutation<UserInfo, RequestLogin>({
      queryFn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return supabaseError(error.message);
        const userInfo = await fetchUserInfo(data.user);
        // Страховка на случай, если нативный бан ещё не применился: блокируем вход на клиенте.
        if (userInfo.blocked) {
          await supabase.auth.signOut();
          return supabaseError('USER_BLOCKED');
        }
        return { data: userInfo };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userActions.setUserData(data));
        } catch (err) {
          console.error('Login error:', err);
        }
      },
    }),
    register: build.mutation<UserInfo | null, RequestRegister>({
      queryFn: async ({ email, password, name }) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: name ? { data: { name } } : undefined,
        });
        if (error) return supabaseError(error.message);
        // Если в проекте включено подтверждение email — сессии ещё нет (data.session === null).
        return { data: data.session && data.user ? await fetchUserInfo(data.user) : null };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) dispatch(userActions.setUserData(data));
        } catch (err) {
          console.error('Register error:', err);
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
    logout: build.mutation<void, void>({
      queryFn: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          dispatch(userActions.setExplicitLogout());
          dispatch(userActions.logout());
          dispatch(rtkApi.util.resetApiState());
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
      // Восстанавливаем пользователя из сессии Supabase (хранится в localStorage).
      queryFn: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) return supabaseError(error.message);
        if (!data.session) return { error: { status: 401, data: 'No session' } };
        const userInfo = await fetchUserInfo(data.session.user);
        // Пользователя заблокировали при активной сессии — разлогиниваем.
        if (userInfo.blocked) {
          await supabase.auth.signOut();
          return { error: { status: 401, data: 'User blocked' } };
        }
        return { data: userInfo };
      },
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
        } catch {
          // Нет активной сессии — пользователь остаётся неавторизованным.
        } finally {
          dispatch(userActions.initUserData());
        }
      },
    }),
    updateMeInfo: build.mutation<UserInfo, UpdateMeInfo>({
      // Обновляем свою строку profiles (RLS пропускает только собственные поля; роль не передаём).
      queryFn: async (body) => {
        const { data: sessionData } = await supabase.auth.getSession();
        const authUser = sessionData.session?.user;
        if (!authUser) return supabaseError('NOT_AUTHENTICATED');

        const { error } = await supabase
          .from('profiles')
          .update({
            surname: body.surname ?? null,
            name: body.name,
            middle_name: body.middle_name ?? null,
            tel: body.tel ?? null,
            description: body.description ?? null,
            avatar: body.avatar ?? null,
          })
          .eq('id', authUser.id);
        if (error) return supabaseError(error.message);

        return { data: await fetchUserInfo(authUser) };
      },
      invalidatesTags: (user) => user ? [{
        type: ApiTag.User,
        id: user.uuid,
      }] : [],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userActions.setUserData(data));
        } catch (err) {
          console.error('Update profile error:', err);
        }
      },
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
    getUsers: build.query<UserInfo[], UserFilters | void>({
      // Список пользователей из таблицы profiles. Поиск по name/email — на клиенте (список небольшой).
      queryFn: async (params) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('email');
        if (error) return supabaseError(error.message);

        let users = (data as ProfileRow[]).map(mapProfile);

        const search = params?.name || params?.email;
        if (search) {
          const q = search.toLowerCase();
          users = users.filter(
            (u) => u.email.toLowerCase().includes(q)
              || (u.name?.toLowerCase().includes(q) ?? false),
          );
        }

        return { data: users };
      },
      providesTags: (res) => {
        const result = res?.map(({ uuid }) => ({
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
      queryFn: async (uuid) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uuid)
          .single<ProfileRow>();
        if (error) return supabaseError(error.message);
        return { data: mapProfile(data) };
      },
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
      queryFn: async ({ user_uuid, role }) => {
        const { error } = await supabase.rpc('set_user_role', {
          p_user_id: user_uuid,
          p_role: role,
        });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: (_res, _error, { user_uuid }) => [
        {
          type: ApiTag.User,
          id: user_uuid,
        },
        ApiTag.Users,
      ],
    }),
    setUserBlocked: build.mutation<void, {
      user_uuid: string
      blocked: boolean
    }>({
      queryFn: async ({ user_uuid, blocked }) => {
        const { error } = await supabase.rpc('set_user_blocked', {
          p_user_id: user_uuid,
          p_blocked: blocked,
        });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: (_res, _error, { user_uuid }) => [
        {
          type: ApiTag.User,
          id: user_uuid,
        },
        ApiTag.Users,
      ],
    }),
    setUserAiLimit: build.mutation<void, {
      user_uuid: string
      ai_limit: number
    }>({
      queryFn: async ({ user_uuid, ai_limit }) => {
        const { error } = await supabase.rpc('set_user_ai_limit', {
          p_user_id: user_uuid,
          p_limit: ai_limit,
        });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: (_res, _error, { user_uuid }) => [
        {
          type: ApiTag.User,
          id: user_uuid,
        },
        ApiTag.Users,
      ],
    }),
    deleteUser: build.mutation<void, string>({
      queryFn: async (uuid) => {
        const { error } = await supabase.rpc('delete_user', { p_user_id: uuid });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
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
  useRegisterMutation,
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
  useSetUserBlockedMutation,
  useSetUserAiLimitMutation,
} = userApi;
