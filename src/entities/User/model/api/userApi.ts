import {
  ApiTag,
  rtkApi,
} from '@/shared/api/rtkApi';
import { supabase, supabaseError } from '@/shared/api/supabaseClient';
import { userActions } from '../slice/userSlice';
import { TLanguageUser, UserInfo, RoleName } from '../types/user';
import { fetchUserInfo } from '../lib/fetchUserInfo';
import { mapProfile, ProfileRow } from '../lib/mapProfile';
import { OrderingType, PaginationResult } from '@/shared/types/types';
import { GenderUser } from '@/shared/const/const';
import { RoutePath } from '@/shared/config/router/routePath';
import { isTelegramMiniApp } from '@/shared/lib/telegram';
import { getFunctionErrorCode } from '../lib/getFunctionErrorCode';
import { invokeTelegramAuth } from '../lib/telegramAuth';
import { getUserLoggedOut } from '../selectors/getUserData';

interface RequestLogin {
  password: string
  email: string
}

interface RequestRegister {
  email: string
  password: string
  name?: string
  /** Редакция принятых документов: триггер record_signup_consent пишет её в user_consents */
  legalVersion: string
}

/** Сводка по пользователю для админа (admin_user_stats). */
export interface AdminUserStats {
  decks: number
  words: number
  streak: number
}

/** Привязанный к аккаунту Telegram (строка telegram_accounts). */
export interface TelegramLink {
  username: string | null
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
      queryFn: async ({
        email, password, name, legalVersion,
      }) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { ...(name ? { name } : {}), legal_version: legalVersion } },
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
    requestPasswordReset: build.mutation<void, string>({
      // Письмо со ссылкой на /change_password?token_hash=… (шаблон Reset Password в дашборде Supabase).
      // Supabase не сообщает, есть ли такой email, — ответ одинаковый.
      queryFn: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}${RoutePath.CHANGE_PASSWORD()}`,
        });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
    }),
    verifyPasswordReset: build.mutation<void, string>({
      // Одноразовый токен из письма обменивается на сессию; затем пароль меняет changePassword.
      queryFn: async (tokenHash) => {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
    }),
    userInfo: build.query<UserInfo, void>({
      // Восстанавливаем пользователя из сессии Supabase (хранится в localStorage).
      // В Telegram Mini App без сессии пробуем войти по привязанному Telegram — кроме случая явного выхода.
      queryFn: async (_arg, { getState }) => {
        let { data, error } = await supabase.auth.getSession();
        if (error) return supabaseError(error.message);
        const loggedOut = getUserLoggedOut(getState() as Parameters<typeof getUserLoggedOut>[0]);
        if (!data.session && isTelegramMiniApp() && !loggedOut) {
          const { signedIn } = await invokeTelegramAuth('login');
          if (signedIn) ({ data, error } = await supabase.auth.getSession());
        }
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
            timezone: body.timezone ?? null,
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
    changePassword: build.mutation<void, string>({
      // Смена пароля текущего пользователя (сессия уже есть — старый пароль Supabase не требует).
      queryFn: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
    }),
    getUsersAiUsage: build.query<Record<string, number>, void>({
      // Израсходовано запросов к ИИ сегодня: { [user_id]: used } (только админ).
      queryFn: async () => {
        const { data, error } = await supabase.rpc('admin_get_ai_usage');
        if (error) return supabaseError(error.message);
        const rows = (data as { user_id: string; used: number }[] | null) ?? [];
        return { data: Object.fromEntries(rows.map((row) => [row.user_id, row.used])) };
      },
      providesTags: [ApiTag.Users, ApiTag.AiUsage],
    }),
    getAdminUserStats: build.query<AdminUserStats, string>({
      queryFn: async (uuid) => {
        const { data, error } = await supabase.rpc('admin_user_stats', { p_user_id: uuid });
        if (error) return supabaseError(error.message);
        return { data: data as AdminUserStats };
      },
      providesTags: (_res, _error, uuid) => [{
        type: ApiTag.User,
        id: uuid,
      }],
    }),
    impersonateUser: build.mutation<void, string>({
      // Edge Function выпускает одноразовый токен, verifyOtp заменяет сессию админа сессией пользователя.
      queryFn: async (uuid) => {
        const { data, error } = await supabase.functions.invoke('impersonate-user', {
          body: { user_id: uuid },
        });
        if (error) {
          // Достаём код ошибки из тела ответа функции (например, CANNOT_IMPERSONATE_ADMIN).
          return supabaseError(await getFunctionErrorCode(error));
        }
        const tokenHash = (data as { token_hash?: string } | null)?.token_hash;
        if (!tokenHash) return supabaseError('LINK_FAILED');
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'magiclink',
        });
        if (verifyError) return supabaseError(verifyError.message);
        return { data: undefined };
      },
    }),
    telegramCreateAccount: build.mutation<UserInfo, void>({
      // Mini App: новый аккаунт для Telegram-пользователя (или вход, если он уже привязан).
      queryFn: async () => {
        const { signedIn, error } = await invokeTelegramAuth('create');
        if (!signedIn) return supabaseError(error ?? 'CREATE_FAILED');
        const { data } = await supabase.auth.getSession();
        if (!data.session) return supabaseError('NOT_AUTHENTICATED');
        return { data: await fetchUserInfo(data.session.user) };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userActions.setUserData(data));
        } catch (err) {
          console.error('Telegram account error:', err);
        }
      },
    }),
    linkTelegram: build.mutation<void, void>({
      // Привязать Telegram из Mini App к текущему (вошедшему по email) пользователю.
      queryFn: async () => {
        const { error } = await invokeTelegramAuth('link');
        if (error) return supabaseError(error);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.TelegramAccount],
    }),
    getTelegramLink: build.query<TelegramLink | null, void>({
      // RLS отдаёт только собственную строку.
      queryFn: async () => {
        const { data, error } = await supabase
          .from('telegram_accounts')
          .select('username')
          .maybeSingle<TelegramLink>();
        if (error) return supabaseError(error.message);
        return { data };
      },
      providesTags: [ApiTag.TelegramAccount],
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
  useUserInfoQuery,
  useUpdateMeInfoMutation,
  useGetUserQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateUserRoleMutation,
  useRequestPasswordResetMutation,
  useVerifyPasswordResetMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUsersSearchQuery,
  useSetUserBlockedMutation,
  useSetUserAiLimitMutation,
  useChangePasswordMutation,
  useGetUsersAiUsageQuery,
  useGetAdminUserStatsQuery,
  useImpersonateUserMutation,
  useTelegramCreateAccountMutation,
  useLinkTelegramMutation,
  useGetTelegramLinkQuery,
} = userApi;
