import { useCallback, useEffect, useRef, useState } from 'react';
import type { Mp3Encoder } from '@breezystack/lamejs';

export type VoiceRecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopping' | 'error';
export type VoiceRecorderError = 'permission_denied' | 'no_device' | 'limit_exceeded' | 'unknown';

export interface UseVoiceRecorderResult {
    status: VoiceRecorderStatus;
    durationMs: number;
    level: number;
    error: VoiceRecorderError | null;
    start: () => Promise<void>;
    stop: () => Promise<File | null>;
    cancel: () => void;
}

export const MAX_RECORDING_MS = 10 * 60 * 1000;
const MIN_RECORDING_MS = 300;
const SAMPLE_RATE = 44100;
const BIT_RATE_KBPS = 128;
const BUFFER_SIZE = 4096;

interface WebkitWindow extends Window {
    webkitAudioContext?: typeof AudioContext;
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
    const [status, setStatus] = useState<VoiceRecorderStatus>('idle');
    const [durationMs, setDurationMs] = useState(0);
    const [level, setLevel] = useState(0);
    const [error, setError] = useState<VoiceRecorderError | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const encoderRef = useRef<Mp3Encoder | null>(null);
    const chunksRef = useRef<Uint8Array[]>([]);
    const startedAtRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);
    const autoStopTimeoutRef = useRef<number | null>(null);
    const levelRef = useRef(0);
    const cancelledRef = useRef(false);

    const cleanup = useCallback(() => {
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        if (autoStopTimeoutRef.current !== null) {
            window.clearTimeout(autoStopTimeoutRef.current);
            autoStopTimeoutRef.current = null;
        }
        try { processorRef.current?.disconnect(); } catch { /* noop */ }
        try { sourceRef.current?.disconnect(); } catch { /* noop */ }
        processorRef.current = null;
        sourceRef.current = null;
        const ctx = audioContextRef.current;
        if (ctx && ctx.state !== 'closed') {
            ctx.close().catch(() => {});
        }
        audioContextRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        encoderRef.current = null;
        levelRef.current = 0;
    }, []);

    const tickDuration = useCallback(() => {
        if (!startedAtRef.current) return;
        const elapsed = Date.now() - startedAtRef.current;
        setDurationMs(elapsed);
        setLevel(levelRef.current);
        rafIdRef.current = requestAnimationFrame(tickDuration);
    }, []);

    const start = useCallback(async () => {
        if (status === 'recording' || status === 'requesting') return;
        setError(null);
        setDurationMs(0);
        setLevel(0);
        setStatus('requesting');
        cancelledRef.current = false;
        chunksRef.current = [];

        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    noiseSuppression: true,
                    echoCancellation: true,
                    channelCount: 1,
                    sampleRate: SAMPLE_RATE,
                },
            });
        } catch (e) {
            const errName = (e as DOMException)?.name;
            const mapped: VoiceRecorderError =
                errName === 'NotAllowedError' || errName === 'SecurityError'
                    ? 'permission_denied'
                    : errName === 'NotFoundError' || errName === 'OverconstrainedError'
                        ? 'no_device'
                        : 'unknown';
            setError(mapped);
            setStatus('error');
            return;
        }

        // Если cancel/unmount случился во время permission‑диалога — освобождаем
        // стрим и выходим, чтобы не оставить открытый микрофон.
        if (cancelledRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
        }

        let Mp3EncoderCtor: typeof Mp3Encoder;
        try {
            const lamejs = await import('@breezystack/lamejs');
            Mp3EncoderCtor = lamejs.Mp3Encoder;
        } catch {
            stream.getTracks().forEach((t) => t.stop());
            setError('unknown');
            setStatus('error');
            return;
        }

        if (cancelledRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
        }

        const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
        if (!Ctor) {
            stream.getTracks().forEach((t) => t.stop());
            setError('unknown');
            setStatus('error');
            return;
        }
        const audioContext = new Ctor({ sampleRate: SAMPLE_RATE });
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);
        const encoder = new Mp3EncoderCtor(1, SAMPLE_RATE, BIT_RATE_KBPS);

        const int16Buffer = new Int16Array(BUFFER_SIZE);

        processor.onaudioprocess = (event) => {
            const channel = event.inputBuffer.getChannelData(0);
            let sumSq = 0;
            const len = channel.length;
            for (let i = 0; i < len; i++) {
                const sample = Math.max(-1, Math.min(1, channel[i]));
                int16Buffer[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                sumSq += sample * sample;
            }
            const rms = Math.sqrt(sumSq / len);
            const target = Math.min(1, rms * 4);
            levelRef.current = levelRef.current * 0.7 + target * 0.3;
            const mp3buf = encoder.encodeBuffer(int16Buffer);
            if (mp3buf.length > 0) {
                chunksRef.current.push(new Uint8Array(mp3buf));
            }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        streamRef.current = stream;
        audioContextRef.current = audioContext;
        sourceRef.current = source;
        processorRef.current = processor;
        encoderRef.current = encoder;

        startedAtRef.current = Date.now();
        rafIdRef.current = requestAnimationFrame(tickDuration);
        autoStopTimeoutRef.current = window.setTimeout(() => {
            setError('limit_exceeded');
        }, MAX_RECORDING_MS);

        setStatus('recording');
    }, [status, tickDuration]);

    const finalize = useCallback((): File | null => {
        const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
        const encoder = encoderRef.current;
        if (encoder) {
            const flushed = encoder.flush();
            if (flushed.length > 0) chunksRef.current.push(new Uint8Array(flushed));
        }
        const totalChunks = chunksRef.current;
        const totalBytes = totalChunks.reduce((acc, c) => acc + c.length, 0);
        cleanup();
        startedAtRef.current = 0;
        if (cancelledRef.current || elapsed < MIN_RECORDING_MS || totalBytes === 0) {
            chunksRef.current = [];
            return null;
        }
        const blob = new Blob(totalChunks as BlobPart[], { type: 'audio/mpeg' });
        chunksRef.current = [];
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        return new File([blob], `voice-${ts}.mp3`, {
            type: 'audio/mpeg',
            lastModified: Date.now(),
        });
    }, [cleanup]);

    const stop = useCallback(async (): Promise<File | null> => {
        if (status !== 'recording' && status !== 'error') return null;
        setStatus('stopping');
        const file = finalize();
        setDurationMs(0);
        setLevel(0);
        setStatus('idle');
        return file;
    }, [status, finalize]);

    const cancel = useCallback(() => {
        cancelledRef.current = true;
        cleanup();
        chunksRef.current = [];
        startedAtRef.current = 0;
        setDurationMs(0);
        setLevel(0);
        setStatus('idle');
        setError(null);
    }, [cleanup]);

    useEffect(() => () => {
        cleanup();
    }, [cleanup]);

    return { status, durationMs, level, error, start, stop, cancel };
}
