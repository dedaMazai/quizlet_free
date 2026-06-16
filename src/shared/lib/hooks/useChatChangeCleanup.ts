import { RefObject, useEffect, useRef } from 'react';

interface UseChatChangeCleanupOptions {
    chatId: string | null;
    isCreatingChatRef: RefObject<boolean>;
    cancelStream: () => void;
    onCleanup: () => void;
    onNewChat: () => void;
}

export function useChatChangeCleanup({
    chatId,
    isCreatingChatRef,
    cancelStream,
    onCleanup,
    onNewChat,
}: UseChatChangeCleanupOptions) {
    const prevChatIdRef = useRef<string | null>(chatId);
    const onCleanupRef = useRef(onCleanup);
    const onNewChatRef = useRef(onNewChat);
    onCleanupRef.current = onCleanup;
    onNewChatRef.current = onNewChat;

    useEffect(() => {
        const chatChanged = prevChatIdRef.current !== chatId;
        prevChatIdRef.current = chatId;

        if (chatChanged && !isCreatingChatRef.current) {
            onCleanupRef.current();
            if (chatId) {
                onNewChatRef.current();
            }
        }

        const creatingRef = isCreatingChatRef;
        return () => {
            if (!creatingRef.current) {
                cancelStream();
            }
        };
    }, [chatId, cancelStream, isCreatingChatRef]);
}
