import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface BaseDisplayMessage {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    isError?: boolean;
    isStreaming?: boolean;
    isClarification?: boolean;
    attachments?: Array<{ name: string; url?: string; mime?: string; durationMs?: number }>;
}

interface StreamingState {
    content: string;
    chatId: string | null;
    error: string | null;
    isStreaming: boolean;
}

interface UseOptimisticMessagesOptions<TServerMsg> {
    serverMessages: TServerMsg[] | undefined;
    mapServerMessage: (msg: TServerMsg) => BaseDisplayMessage;
    streaming: StreamingState;
    chatId: string | null;
    resetStream: () => void;
    buildStreamingExtras?: () => Record<string, unknown>;
}

function toTimestamp(): string {
    return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function useOptimisticMessages<TServerMsg>({
    serverMessages,
    mapServerMessage,
    streaming,
    chatId,
    resetStream,
    buildStreamingExtras,
}: UseOptimisticMessagesOptions<TServerMsg>) {
    const [optimisticMessages, setOptimisticMessages] = useState<BaseDisplayMessage[]>([]);
    const pendingClearRef = useRef(false);
    const msgCountAtSendRef = useRef(0);

    const errorTimestamp = useMemo(
        () => toTimestamp(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [streaming.error],
    );

    // Handle streaming error — add error message to optimistic
    useEffect(() => {
        if (streaming.error && !streaming.isStreaming) {
            setOptimisticMessages((prev) => {
                if (prev.length > 0 && prev[prev.length - 1].isError) return prev;
                return [...prev, {
                    id: `err-${Date.now()}`,
                    type: 'assistant' as const,
                    content: streaming.error!,
                    timestamp: errorTimestamp,
                    isError: true,
                }];
            });
        }
    }, [streaming.error, streaming.isStreaming, errorTimestamp]);

    // Clear optimistic + streaming state only once the server has actually caught up
    // (i.e. returned MORE messages than at send time). Relying on any non-empty
    // serverMessages fires prematurely — RTK Query invalidation itself can mutate the
    // reference on the cache tick before the refetch response arrives, which would wipe
    // freshly-flushed streaming content before it ever renders.
    // While stream is active we only drop optimistic (server already echoes the user
    // message) but keep streaming state intact — resetStream would null streamingChatId
    // and stop the in-flight tokens from rendering.
    useLayoutEffect(() => {
        if (!pendingClearRef.current) return;
        const count = serverMessages?.length ?? 0;
        if (count <= msgCountAtSendRef.current) return;
        setOptimisticMessages([]);
        if (!streaming.isStreaming) {
            pendingClearRef.current = false;
            resetStream();
        }
    }, [serverMessages, resetStream, streaming.isStreaming]);

    const allMessages = useMemo(() => {
        const messages = serverMessages ?? [];
        const mapped = messages.map(mapServerMessage);

        if (pendingClearRef.current && messages.length > msgCountAtSendRef.current) {
            return mapped;
        }

        return [...mapped, ...optimisticMessages];
    }, [serverMessages, mapServerMessage, optimisticMessages]);

    const streamingMessage = useMemo<BaseDisplayMessage | null>(() => {
        if (!streaming.isStreaming && !streaming.content) return null;
        if (streaming.chatId !== chatId) return null;
        // Серверный ответ уже подтянулся, но useLayoutEffect ещё не успел отработать
        // resetStream() — гасим streaming, чтобы не было 1-кадрового дубля.
        if (
            pendingClearRef.current
            && !streaming.isStreaming
            && (serverMessages?.length ?? 0) > msgCountAtSendRef.current
        ) {
            return null;
        }
        const extras = buildStreamingExtras?.() ?? {};
        return {
            id: 'streaming',
            type: 'assistant' as const,
            content: streaming.content,
            timestamp: toTimestamp(),
            isStreaming: true,
            ...extras,
        };
    }, [streaming.content, streaming.chatId, streaming.isStreaming, chatId, buildStreamingExtras, serverMessages]);

    const displayMessages = useMemo(() => {
        const msgs: BaseDisplayMessage[] = allMessages.map((msg) => ({
            ...msg,
            isStreaming: false,
        }));

        if (streamingMessage) {
            msgs.push(streamingMessage);
        }

        return msgs;
    }, [allMessages, streamingMessage]);

    const addOptimistic = useCallback((msg: BaseDisplayMessage) => {
        setOptimisticMessages((prev) => [...prev, msg]);
    }, []);

    const clearOptimistic = useCallback(() => {
        setOptimisticMessages([]);
    }, []);

    const updateOptimisticAttachments = useCallback((
        id: string,
        attachments: BaseDisplayMessage['attachments'],
    ) => {
        setOptimisticMessages((prev) => prev.map((m) => (
            m.id === id ? { ...m, attachments } : m
        )));
    }, []);

    const updateOptimisticMessage = useCallback((
        id: string,
        patch: Partial<BaseDisplayMessage>,
    ) => {
        setOptimisticMessages((prev) => prev.map((m) => (
            m.id === id ? { ...m, ...patch } : m
        )));
    }, []);

    const recordSendBaseline = useCallback(() => {
        msgCountAtSendRef.current = serverMessages?.length ?? 0;
    }, [serverMessages]);

    // Перенос отправки в новый chat (chat_history_created): baseline для
    // старого чата (N сообщений) перестаёт быть валидным. В новой истории
    // ровно 0 сообщений на момент переключения — useLayoutEffect должен
    // сравнивать с 0, иначе после done:true optimistic не очистится и UI
    // навсегда зависнет с дублем (server messages + optimistic).
    const resetSendBaseline = useCallback(() => {
        msgCountAtSendRef.current = 0;
    }, []);

    const markPendingClear = useCallback(() => {
        pendingClearRef.current = true;
    }, []);

    const clearErrors = useCallback(() => {
        setOptimisticMessages((prev) => prev.filter((m) => !m.isError));
    }, []);

    return {
        displayMessages,
        addOptimistic,
        clearOptimistic,
        updateOptimisticAttachments,
        updateOptimisticMessage,
        recordSendBaseline,
        resetSendBaseline,
        markPendingClear,
        clearErrors,
        pendingClearRef,
    };
}
