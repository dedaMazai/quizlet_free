import { rtkApi as api } from './rtkApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    askAgentAgentPost: build.mutation<
      AskAgentAgentPostApiResponse,
      AskAgentAgentPostApiArg
    >({
      query: (queryArg) => ({
        url: `/agent/`,
        method: 'POST',
        body: queryArg.agentRequest,
      }),
    }),
    askAgentStreamAgentStreamPost: build.mutation<
      AskAgentStreamAgentStreamPostApiResponse,
      AskAgentStreamAgentStreamPostApiArg
    >({
      query: (queryArg) => ({
        url: `/agent/stream`,
        method: 'POST',
        body: queryArg.agentRequest,
      }),
    }),
    createChatEndpointChatsPost: build.mutation<
      CreateChatEndpointChatsPostApiResponse,
      CreateChatEndpointChatsPostApiArg
    >({
      query: (queryArg) => ({
        url: `/chats`,
        method: 'POST',
        body: queryArg.chatCreateRequest,
      }),
    }),
    listChatsEndpointChatsGet: build.query<
      ListChatsEndpointChatsGetApiResponse,
      ListChatsEndpointChatsGetApiArg
    >({
      query: (queryArg) => ({
        url: `/chats`,
        params: {
          context_type: queryArg.contextType,
          context_uuid: queryArg.contextUuid,
          search: queryArg.search,
          page: queryArg.page,
          limit: queryArg.limit,
        },
      }),
    }),
    getChatEndpointChatsChatIdGet: build.query<
      GetChatEndpointChatsChatIdGetApiResponse,
      GetChatEndpointChatsChatIdGetApiArg
    >({
      query: (queryArg) => ({ url: `/chats/${queryArg.chatId}` }),
    }),
    updateChatEndpointChatsChatIdPut: build.mutation<
      UpdateChatEndpointChatsChatIdPutApiResponse,
      UpdateChatEndpointChatsChatIdPutApiArg
    >({
      query: (queryArg) => ({
        url: `/chats/${queryArg.chatId}`,
        method: 'PUT',
        body: queryArg.chatUpdateRequest,
      }),
    }),
    deleteChatEndpointChatsChatIdDelete: build.mutation<
      DeleteChatEndpointChatsChatIdDeleteApiResponse,
      DeleteChatEndpointChatsChatIdDeleteApiArg
    >({
      query: (queryArg) => ({
        url: `/chats/${queryArg.chatId}`,
        method: 'DELETE',
      }),
    }),
    streamChatMessageEndpointChatsChatIdMessagesStreamPost: build.mutation<
      StreamChatMessageEndpointChatsChatIdMessagesStreamPostApiResponse,
      StreamChatMessageEndpointChatsChatIdMessagesStreamPostApiArg
    >({
      query: (queryArg) => ({
        url: `/chats/${queryArg.chatId}/messages/stream`,
        method: 'POST',
        body: queryArg.chatMessageRequest,
      }),
    }),
    healthzHealthzGet: build.query<
      HealthzHealthzGetApiResponse,
      HealthzHealthzGetApiArg
    >({
      query: () => ({ url: `/healthz` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type AskAgentAgentPostApiResponse =
  /** status 200 Successful Response */ AgentResponse;
export type AskAgentAgentPostApiArg = {
  agentRequest: AgentRequest;
};
export type AskAgentStreamAgentStreamPostApiResponse =
  /** status 200 Successful Response */ any;
export type AskAgentStreamAgentStreamPostApiArg = {
  agentRequest: AgentRequest;
};
export type CreateChatEndpointChatsPostApiResponse =
  /** status 201 Successful Response */ ChatSchema;
export type CreateChatEndpointChatsPostApiArg = {
  chatCreateRequest: ChatCreateRequest;
};
export type ListChatsEndpointChatsGetApiResponse =
  /** status 200 Successful Response */ ChatListResponse;
export type ListChatsEndpointChatsGetApiArg = {
  contextType?: string | null;
  contextUuid?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
};
export type GetChatEndpointChatsChatIdGetApiResponse =
  /** status 200 Successful Response */ ChatDetailSchema;
export type GetChatEndpointChatsChatIdGetApiArg = {
  chatId: string;
};
export type UpdateChatEndpointChatsChatIdPutApiResponse =
  /** status 200 Successful Response */ ChatSchema;
export type UpdateChatEndpointChatsChatIdPutApiArg = {
  chatId: string;
  chatUpdateRequest: ChatUpdateRequest;
};
export type DeleteChatEndpointChatsChatIdDeleteApiResponse = unknown;
export type DeleteChatEndpointChatsChatIdDeleteApiArg = {
  chatId: string;
};
export type StreamChatMessageEndpointChatsChatIdMessagesStreamPostApiResponse =
  /** status 200 Successful Response */ any;
export type StreamChatMessageEndpointChatsChatIdMessagesStreamPostApiArg = {
  chatId: string;
  chatMessageRequest: ChatMessageRequest;
};
export type HealthzHealthzGetApiResponse = unknown;
export type HealthzHealthzGetApiArg = void;
export type SourceItem = {
  type: string;
  uuid?: string | null;
  title?: string | null;
  url?: string | null;
};
export type AgentResponse = {
  answer: string;
  sources?: SourceItem[];
  used_tool?: string;
  referenced_documents?: {
    [key: string]: any;
  }[];
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: any;
  ctx?: object;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type DocumentContext = {
  active_document_uuid?: string | null;
  selection_text?: string | null;
  referenced_document_uuids?: string[];
  collection_uuid?: string | null;
};
export type AgentRequest = {
  query: string;
  context?: DocumentContext | null;
};
export type ChatSchema = {
  id: string;
  name: string | null;
  context_type: string;
  context_uuid: string | null;
  created_at: string;
  updated_at: string;
  message_count?: number;
};
export type ChatCreateRequest = {
  name?: string | null;
  context_type?: string;
  context_uuid?: string | null;
};
export type ChatListItemSchema = {
  id: string;
  name: string | null;
  context_type: string;
  context_uuid: string | null;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message_preview?: string | null;
};
export type ChatListResponse = {
  objects: ChatListItemSchema[];
  total: number;
};
export type MessageSchema = {
  id: string;
  role: string;
  content: string;
  created_at: string;
  context?: {
    [key: string]: any;
  } | null;
  sources?: SourceItem[];
  used_tool?: string | null;
};
export type ChatDetailSchema = {
  id: string;
  name: string | null;
  context_type: string;
  context_uuid: string | null;
  created_at: string;
  updated_at: string;
  message_count?: number;
  messages?: MessageSchema[];
};
export type ChatUpdateRequest = {
  name: string;
};
export type ChatMessageRequest = {
  query: string;
  context?: DocumentContext | null;
};
export const {
  useAskAgentAgentPostMutation,
  useAskAgentStreamAgentStreamPostMutation,
  useCreateChatEndpointChatsPostMutation,
  useListChatsEndpointChatsGetQuery,
  useGetChatEndpointChatsChatIdGetQuery,
  useUpdateChatEndpointChatsChatIdPutMutation,
  useDeleteChatEndpointChatsChatIdDeleteMutation,
  useStreamChatMessageEndpointChatsChatIdMessagesStreamPostMutation,
  useHealthzHealthzGetQuery,
} = injectedRtkApi;
