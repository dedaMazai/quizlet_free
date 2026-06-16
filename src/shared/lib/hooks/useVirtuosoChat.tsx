import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VirtuosoHandle } from 'react-virtuoso';

const SCROLL_BOTTOM_THRESHOLD = 100;

interface UseVirtuosoChatOptions {
    containerRef: RefObject<HTMLDivElement | null>;
    displayMessages: Array<{ type: string }>;
}

const VIRTUOSO_HEADER = { Header: () => <div style={{ height: 20 }} /> };

export function useVirtuosoChat({ containerRef, displayMessages }: UseVirtuosoChatOptions) {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [atBottom, setAtBottom] = useState(true);
    const [scrollPadding, setScrollPadding] = useState(0);
    const scrollPaddingRef = useRef(0);
    scrollPaddingRef.current = scrollPadding;

    const shouldScrollToBottomRef = useRef(true);
    const shouldScrollToUserRef = useRef(false);

    const baseContentHeightRef = useRef(0);
    const currentContentHeightRef = useRef(0);
    const targetContainerHeightRef = useRef(0);
    const scrollToBottomRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollToUserRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [sendTick, setSendTick] = useState(0);

    const virtuosoComponents = useMemo(() => ({
        ...VIRTUOSO_HEADER,
        Footer: () => <div style={{ height: scrollPadding > 0 ? scrollPadding : 4 }} />,
    }), [scrollPadding]);

    const handleTotalHeightChanged = useCallback((totalHeight: number) => {
        const footerH = scrollPaddingRef.current > 0 ? scrollPaddingRef.current : 4;
        currentContentHeightRef.current = totalHeight - footerH - 20;

        if (targetContainerHeightRef.current <= 0) return;

        const growth = Math.max(0, currentContentHeightRef.current - baseContentHeightRef.current);
        const needed = Math.max(0, targetContainerHeightRef.current - growth);

        if (needed < scrollPaddingRef.current) {
            setScrollPadding(needed);
            if (needed === 0) {
                targetContainerHeightRef.current = 0;
            }
        }
    }, []);

    const notifySend = useCallback(() => {
        shouldScrollToUserRef.current = true;
        baseContentHeightRef.current = currentContentHeightRef.current;
        const ch = containerRef.current?.clientHeight ?? 800;
        targetContainerHeightRef.current = ch;
        setScrollPadding(ch);
        setSendTick((prev) => prev + 1);
    }, [containerRef]);

    // Принудительно убрать остаточный footer-spacer (использовать после завершения
    // стрима, если он не успел подрезаться сам — иначе под последним сообщением
    // остаётся «пустое» место.)
    const finalizeStreamScroll = useCallback(() => {
        targetContainerHeightRef.current = 0;
        setScrollPadding(0);
    }, []);

    // Scroll to user message after sending.
    // Двойной RAF + страховочный setTimeout — Virtuoso может не успеть отрендерить
    // увеличенный Footer за один кадр, и одиночный scrollToIndex(align:'start') не
    // срабатывает корректно. behavior:'auto' избавляет от прерывания плавного скролла
    // ростом контента (стрим докидывает токены).
    useEffect(() => {
        if (!shouldScrollToUserRef.current) return;
        shouldScrollToUserRef.current = false;

        const msgs = displayMessages;
        const findLastUserIdx = () => {
            for (let i = msgs.length - 1; i >= 0; i--) {
                if (msgs[i].type === 'user') return i;
            }
            return -1;
        };

        const doScroll = () => {
            const idx = findLastUserIdx();
            if (idx >= 0) {
                virtuosoRef.current?.scrollToIndex({
                    index: idx,
                    align: 'start',
                    behavior: 'auto',
                });
            }
        };

        let raf2 = 0;
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                doScroll();
            });
        });
        if (scrollToUserRetryRef.current) clearTimeout(scrollToUserRetryRef.current);
        scrollToUserRetryRef.current = setTimeout(() => {
            scrollToUserRetryRef.current = null;
            doScroll();
        }, 120);

        return () => {
            cancelAnimationFrame(raf1);
            if (raf2) cancelAnimationFrame(raf2);
            if (scrollToUserRetryRef.current) {
                clearTimeout(scrollToUserRetryRef.current);
                scrollToUserRetryRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sendTick]);

    const scheduleScrollToBottom = useCallback(() => {
        shouldScrollToBottomRef.current = true;
    }, []);

    // Scroll to absolute bottom when history loads or chat changes
    useEffect(() => {
        if (!shouldScrollToBottomRef.current) return;
        if (displayMessages.length === 0) return;
        shouldScrollToBottomRef.current = false;

        const scrollToEnd = () => {
            const scroller = containerRef.current?.querySelector<HTMLElement>(
                '[data-virtuoso-scroller]',
            );
            if (scroller) {
                scroller.scrollTop = scroller.scrollHeight;
            }
        };

        // Two attempts: after Virtuoso init + after it recalculates heights
        const t1 = setTimeout(scrollToEnd, 50);
        const t2 = setTimeout(scrollToEnd, 200);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [displayMessages.length, containerRef]);

    const scrollToBottom = useCallback(() => {
        setScrollPadding(0);
        targetContainerHeightRef.current = 0;

        if (scrollToBottomRetryRef.current) {
            clearTimeout(scrollToBottomRetryRef.current);
        }

        const scroller = containerRef.current?.querySelector<HTMLElement>(
            '[data-virtuoso-scroller]',
        );

        if (!scroller || (
            scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight > scroller.clientHeight * 2
        )) {
            // Far from bottom — instant jump via DOM
            if (scroller) scroller.scrollTop = scroller.scrollHeight;
        } else {
            virtuosoRef.current?.scrollToIndex({ index: 'LAST', align: 'end', behavior: 'auto' });
        }

        // Retry to guarantee reaching the absolute bottom
        scrollToBottomRetryRef.current = setTimeout(() => {
            scrollToBottomRetryRef.current = null;
            const el = containerRef.current?.querySelector<HTMLElement>(
                '[data-virtuoso-scroller]',
            );
            if (el) el.scrollTop = el.scrollHeight;
        }, 150);
    }, [containerRef]);

    const resetScroll = useCallback(() => {
        if (scrollToBottomRetryRef.current) {
            clearTimeout(scrollToBottomRetryRef.current);
            scrollToBottomRetryRef.current = null;
        }
        if (scrollToUserRetryRef.current) {
            clearTimeout(scrollToUserRetryRef.current);
            scrollToUserRetryRef.current = null;
        }
        setScrollPadding(0);
        setAtBottom(true);
        shouldScrollToBottomRef.current = false;
        shouldScrollToUserRef.current = false;
        baseContentHeightRef.current = 0;
        currentContentHeightRef.current = 0;
        targetContainerHeightRef.current = 0;
    }, []);

    useEffect(() => {
        return () => {
            if (scrollToBottomRetryRef.current) {
                clearTimeout(scrollToBottomRetryRef.current);
            }
            if (scrollToUserRetryRef.current) {
                clearTimeout(scrollToUserRetryRef.current);
            }
        };
    }, []);

    return {
        virtuosoRef,
        atBottom,
        setAtBottom,
        scrollPadding,
        virtuosoComponents,
        handleTotalHeightChanged,
        notifySend,
        scheduleScrollToBottom,
        scrollToBottom,
        resetScroll,
        finalizeStreamScroll,
        SCROLL_BOTTOM_THRESHOLD,
    };
}
