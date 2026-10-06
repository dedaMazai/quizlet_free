import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError, getCurrentUserId } from '@/shared/api/supabaseClient';
import {
  Contact, ContactInvite, ContactInviteInfo, ContactLabel, ContactRequest,
} from '../types/contact';

// Все чтения и записи — через RPC supabase/contacts.sql. Ни один из них не сообщает,
// зарегистрирован ли email: запрос по любому адресу отвечает одинаково.

// Строки RPC: null вместо отсутствующих полей.
interface ContactRow {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  label: ContactLabel | null;
  created_at: string;
}

interface ContactRequestRow {
  id: string;
  from_id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  created_at: string;
}

interface ContactInviteInfoRow {
  inviter_name: string;
  avatar: string | null;
  is_self: boolean;
  is_contact: boolean;
}

// Коды ошибок RPC → ключи i18n; компонент переводит через t().
const contactErrorMessage = (raw: string): string => {
  if (raw.includes('RATE_LIMIT')) return 'Слишком много запросов. Попробуйте завтра';
  if (raw.includes('INVITE_INVALID')) return 'Приглашение недействительно или устарело';
  if (raw.includes('INVITE_SELF')) return 'Это ваше собственное приглашение';
  if (raw.includes('REQUEST_NOT_FOUND')) return 'Запрос уже обработан';
  return raw;
};

export const contactApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    getContacts: build.query<Contact[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_my_contacts');
        if (error) return supabaseError(error.message);
        return {
          data: (data as ContactRow[]).map((row) => ({
            id: row.id,
            email: row.email,
            name: row.name ?? undefined,
            avatar: row.avatar ?? undefined,
            label: row.label ?? undefined,
            created_at: row.created_at,
          })),
        };
      },
      providesTags: [ApiTag.Contacts],
    }),
    getContactRequests: build.query<ContactRequest[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_contact_requests');
        if (error) return supabaseError(error.message);
        return {
          data: (data as ContactRequestRow[]).map((row) => ({
            id: row.id,
            from_id: row.from_id,
            email: row.email,
            name: row.name ?? undefined,
            avatar: row.avatar ?? undefined,
            created_at: row.created_at,
          })),
        };
      },
      providesTags: [ApiTag.ContactRequests],
    }),
    requestContact: build.mutation<void, string>({
      queryFn: async (email) => {
        const { error } = await supabase.rpc('request_contact_by_email', {
          p_email: email.trim().toLowerCase(),
        });
        if (error) return supabaseError(contactErrorMessage(error.message));
        return { data: undefined };
      },
      // Встречный запрос принимается сразу — список контактов мог измениться.
      invalidatesTags: [ApiTag.Contacts],
    }),
    respondContactRequest: build.mutation<void, { id: string; accept: boolean }>({
      queryFn: async ({ id, accept }) => {
        const { error } = await supabase.rpc('respond_contact_request', { p_id: id, p_accept: accept });
        if (error) return supabaseError(contactErrorMessage(error.message));
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.ContactRequests, ApiTag.Contacts, ApiTag.Notifications],
    }),
    removeContact: build.mutation<void, string>({
      queryFn: async (contactId) => {
        const { error } = await supabase.rpc('remove_contact', { p_contact_id: contactId });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.Contacts],
    }),
    setContactLabel: build.mutation<void, { id: string; label: ContactLabel | null }>({
      queryFn: async ({ id, label }) => {
        const userId = await getCurrentUserId();
        if (!userId) return supabaseError('Not authenticated');
        const { error } = await supabase
          .from('contacts')
          .update({ label })
          .eq('user_id', userId)
          .eq('contact_id', id);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.Contacts],
    }),
    // Выдаёт действующую ссылку; если её нет или она истекла — создаёт новую.
    getContactInvite: build.query<ContactInvite, void>({
      queryFn: async () => {
        const { data, error } = await supabase.rpc('create_contact_invite', { p_renew: false });
        if (error) return supabaseError(error.message);
        return { data: (data as ContactInvite[])[0] };
      },
      providesTags: [ApiTag.ContactInvite],
    }),
    renewContactInvite: build.mutation<void, void>({
      queryFn: async () => {
        const { error } = await supabase.rpc('create_contact_invite', { p_renew: true });
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.ContactInvite],
    }),
    // null — ссылка недействительна или устарела.
    getContactInviteInfo: build.query<ContactInviteInfo | null, string>({
      queryFn: async (token) => {
        const { data, error } = await supabase.rpc('get_contact_invite', { p_token: token });
        if (error) return supabaseError(error.message);
        const row = (data as ContactInviteInfoRow[])[0];
        if (!row) return { data: null };
        return { data: { ...row, avatar: row.avatar ?? undefined } };
      },
      providesTags: [ApiTag.Contacts],
    }),
    acceptContactInvite: build.mutation<void, string>({
      queryFn: async (token) => {
        const { error } = await supabase.rpc('accept_contact_invite', { p_token: token });
        if (error) return supabaseError(contactErrorMessage(error.message));
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.Contacts],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactRequestsQuery,
  useRequestContactMutation,
  useRespondContactRequestMutation,
  useRemoveContactMutation,
  useSetContactLabelMutation,
  useGetContactInviteQuery,
  useRenewContactInviteMutation,
  useGetContactInviteInfoQuery,
  useAcceptContactInviteMutation,
} = contactApi;
