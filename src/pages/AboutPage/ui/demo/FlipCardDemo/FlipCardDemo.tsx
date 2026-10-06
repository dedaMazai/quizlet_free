import {
    KeyboardEvent, memo, MouseEvent, TouchEvent, useCallback, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames/classNames';
import { KeyHint } from '@/shared/ui/KeyHint';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { BlueprintMarks } from '@/shared/ui/Blueprint';

import { DEMO_CARDS } from '../demoData';
import cls from './FlipCardDemo.module.scss';

const NAV_ICON_SIZE = 18;
const NAV_ICON_STROKE = 1.5;
/** Стрелки — символы клавиш, не переводятся */
const ARROWS_HINT = '← →';
/** Горизонтальный сдвиг пальца, после которого жест — свайп, а не тап */
const SWIPE_THRESHOLD = 40;

interface FlipCardDemoProps {
    className?: string;
}

/** Живая карточка: клик или пробел переворачивает, стрелки листают. Клавиши — только при фокусе на демо */
export const FlipCardDemo = memo(({ className }: FlipCardDemoProps) => {
    const { t } = useTranslation();
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const card = DEMO_CARDS[index];

    const touchStartX = useRef<number | null>(null);
    const swiped = useRef(false);

    const flip = useCallback(() => setFlipped((prev) => !prev), []);
    const go = useCallback((step: number) => {
        setFlipped(false);
        setIndex((prev) => (prev + step + DEMO_CARDS.length) % DEMO_CARDS.length);
    }, []);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            flip();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            go(1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(-1);
        }
    };

    // Свайп влево-вправо листает карточки на тач-экране, тап — переворачивает
    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.touches[0].clientX;
        swiped.current = false;
    };

    const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        swiped.current = true;
        go(dx < 0 ? 1 : -1);
    };

    const handleClick = () => {
        // Клик, порождённый свайпом, не переворачивает новую карточку
        if (swiped.current) {
            swiped.current = false;
            return;
        }
        flip();
    };

    // Кнопки внутри карточки не должны её переворачивать
    const stop = (e: MouseEvent) => e.stopPropagation();

    return (
        <div className={classNames(cls.FlipCardDemo, [className])}>
            <div
                role="button"
                tabIndex={0}
                aria-pressed={flipped}
                aria-label={t('Перевернуть карточку')}
                className={cls.scene}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className={classNames(cls.flipper, { [cls.flipped]: flipped })}>
                    <div className={classNames(cls.side, [cls.front])} aria-hidden={flipped}>
                        <BlueprintMarks />
                        <span className={cls.label}>{t('Слово')}</span>
                        <span className={cls.tools} onClick={stop}>
                            <SpeakButton text={card.term} />
                        </span>
                        <span className={cls.term}>{card.term}</span>
                        <span className={cls.example}>{card.example}</span>
                        <span className={cls.hint}>{t('Нажмите, чтобы перевернуть')}</span>
                        <span className={cls.hintTouch}>{t('Тап — перевернуть, свайп — следующая')}</span>
                    </div>
                    <div className={classNames(cls.side, [cls.back])} aria-hidden={!flipped}>
                        <BlueprintMarks />
                        <span className={cls.label}>{t('Перевод')}</span>
                        <span className={cls.translation}>{card.translation}</span>
                        <span className={cls.example}>{card.example}</span>
                    </div>
                </div>
            </div>

            <div className={cls.footer}>
                <button type="button" className={cls.nav} onClick={() => go(-1)} aria-label={t('Предыдущая карточка')}>
                    <ChevronLeft size={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE} />
                </button>
                <span className={cls.counter}>{`${index + 1} / ${DEMO_CARDS.length}`}</span>
                <button type="button" className={cls.nav} onClick={() => go(1)} aria-label={t('Следующая карточка')}>
                    <ChevronRight size={NAV_ICON_SIZE} strokeWidth={NAV_ICON_STROKE} />
                </button>
                <span className={cls.keys}>
                    <KeyHint>{t('ПРОБЕЛ')}</KeyHint>
                    <KeyHint>{ARROWS_HINT}</KeyHint>
                </span>
            </div>
        </div>
    );
});

FlipCardDemo.displayName = 'FlipCardDemo';
