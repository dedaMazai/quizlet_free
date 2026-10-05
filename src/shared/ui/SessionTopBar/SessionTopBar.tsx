import { memo, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Popover } from 'antd';
import {
    Settings, Volume2, VolumeX, X,
} from 'lucide-react';
import { KeyHint } from '@/shared/ui/KeyHint';
import { TickProgress, TickProgressSize, TickState } from '@/shared/ui/TickProgress';
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown';
import cls from './SessionTopBar.module.scss';

const EXIT_ICON_SIZE = 16;
const ACTION_ICON_SIZE = 18;
const ICON_STROKE = 1.5;

/** Esc не должен закрывать сессию, пока открыт попап или модалка — их закрывает сам Esc */
const hasOpenOverlay = () => Boolean(document.querySelector(
    '.ant-modal-wrap:not([style*="display: none"]), .ant-popover:not(.ant-popover-hidden)',
));

interface SessionTopBarProps {
    title: ReactNode;
    counter: ReactNode;
    ticks: TickState[];
    onExit: () => void;
    /** Автопроизношение; без обработчика кнопка неактивна (пустые состояния) */
    autoSpeak?: boolean;
    onToggleAutoSpeak?: () => void;
    /** Содержимое попапа настроек; без него кнопка неактивна */
    settings?: ReactNode;
}

/** Топбар фокус-режима: «✕ Выйти ESC» · название, счётчик и 14 делений · озвучка и настройки */
export const SessionTopBar = memo((props: SessionTopBarProps) => {
    const {
        title, counter, ticks, onExit, autoSpeak, onToggleAutoSpeak, settings,
    } = props;
    const { t } = useTranslation();
    const [settingsOpen, setSettingsOpen] = useState(false);

    useKeyDown((e) => {
        if (e.key !== 'Escape' || settingsOpen || hasOpenOverlay()) return;
        onExit();
    }, { ignoreInputs: false });

    return (
        <header className={cls.SessionTopBar}>
            <div className={cls.left}>
                <Button className={cls.exit} onClick={onExit}>
                    <X size={EXIT_ICON_SIZE} strokeWidth={ICON_STROKE} />
                    <span className={cls.exitLabel}>{t('Выйти')}</span>
                    <KeyHint className={cls.exitLabel}>ESC</KeyHint>
                </Button>
            </div>

            <div className={cls.center}>
                <div className={cls.titleRow}>
                    <span className={cls.title}>{title}</span>
                    <span className={cls.counter}>{counter}</span>
                </div>
                <TickProgress ticks={ticks} size={TickProgressSize.MD} className={cls.ticks} />
            </div>

            <div className={cls.right}>
                <Button
                    className={cls.iconBtn}
                    aria-label={autoSpeak ? t('Выключить озвучку') : t('Включить озвучку')}
                    aria-pressed={autoSpeak}
                    disabled={!onToggleAutoSpeak}
                    onClick={onToggleAutoSpeak}
                    icon={autoSpeak
                        ? <Volume2 size={ACTION_ICON_SIZE} strokeWidth={ICON_STROKE} />
                        : <VolumeX size={ACTION_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                />
                <Popover
                    trigger="click"
                    placement="bottomRight"
                    open={settings ? settingsOpen : false}
                    onOpenChange={setSettingsOpen}
                    content={settings}
                >
                    <Button
                        className={cls.iconBtn}
                        aria-label={t('Настройки')}
                        disabled={!settings}
                        icon={<Settings size={ACTION_ICON_SIZE} strokeWidth={ICON_STROKE} />}
                    />
                </Popover>
            </div>
        </header>
    );
});

SessionTopBar.displayName = 'SessionTopBar';
