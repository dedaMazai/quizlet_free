export { ContactLabel } from './model/types/contact';
export type {
  Contact, ContactRequest, ContactInvite, ContactInviteInfo,
} from './model/types/contact';
export { useContactLabelOptions } from './model/lib/useContactLabelOptions';
export {
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
} from './model/api/contactApi';
