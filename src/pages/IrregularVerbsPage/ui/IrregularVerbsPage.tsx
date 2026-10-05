import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Input } from 'antd';
import { Search } from 'lucide-react';
import { useGetMasteryQuery } from '@/entities/Statistics';
import { SectionPageHeader } from '@/widgets/SectionPage';
import { NavSectionKey } from '@/shared/const/menu';
import { RoutePath } from '@/shared/config/router/routePath';
import { IRREGULAR_VERBS, IrregularVerb, VERB_BANDS } from '@/shared/const/grammar';
import { classNames } from '@/shared/lib/classNames/classNames';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { MasteryBar } from '@/shared/ui/MasteryBar';
import { useImportVerbsDeck } from '../model/useImportVerbsDeck';

import cls from './IrregularVerbsPage.module.scss';

const SEARCH_ICON_SIZE = 15;
/** Сколько глаголов перечислить в подписи группы */
const PREVIEW_VERBS = 5;
const FIRST_BAND = 1;
/** Обозначения форм глагола — не переводятся */
const FORM_LABELS = ['V1', 'V2', 'V3'];

const toPercent = (part: number, total: number): number => (
    total > 0 ? Math.round((part / total) * 100) : 0
);

const IrregularVerbsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [openBands, setOpenBands] = useState<number[]>([FIRST_BAND]);
    const { importBand, importingBand, findExistingDeck } = useImportVerbsDeck();
    const { data: mastery } = useGetMasteryQuery();

    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = (verb: IrregularVerb): boolean => (
        !normalizedSearch
        || verb.base.toLowerCase().includes(normalizedSearch)
        || verb.past.toLowerCase().includes(normalizedSearch)
        || verb.participle.toLowerCase().includes(normalizedSearch)
        || verb.translation.toLowerCase().includes(normalizedSearch)
    );

    // Главная кнопка — у первой группы, для которой ещё нет колоды
    const nextBandIndex = VERB_BANDS.find((band) => !findExistingDeck(band))?.index;

    const toggleBand = (index: number) => {
        setOpenBands((prev) => (
            prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
        ));
    };

    return (
        <div className={cls.IrregularVerbsPage}>
            <SectionPageHeader section={NavSectionKey.GRAMMAR} />

            <div className={cls.toolbar}>
                <Input
                    className={cls.search}
                    prefix={<Search aria-hidden size={SEARCH_ICON_SIZE} strokeWidth={1.5} />}
                    allowClear
                    value={search}
                    placeholder={t('Форма глагола или перевод')}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <span className={cls.total}>
                    {t('{{count}} глаголов по частоте · {{bands}} группы', {
                        count: IRREGULAR_VERBS.length,
                        bands: VERB_BANDS.length,
                    })}
                </span>
            </div>

            <div className={cls.bands}>
                {VERB_BANDS.map((band) => {
                    const visibleVerbs = band.verbs.filter(matchesSearch);
                    if (normalizedSearch && visibleVerbs.length === 0) return null;

                    const deck = findExistingDeck(band);
                    const deckMastery = deck && mastery?.perDeck.find((item) => item.deckKey === deck.uuid);
                    const percent = toPercent(deckMastery?.mastered ?? 0, deck?.cards_count ?? 0);
                    // При поиске раскрываются все группы с совпадениями
                    const isOpen = Boolean(normalizedSearch) || openBands.includes(band.index);
                    const preview = band.verbs.slice(0, PREVIEW_VERBS).map((verb) => verb.base).join(', ');

                    return (
                        <Blueprint key={band.index} className={cls.band}>
                            <div className={cls.bandHeader}>
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    className={cls.bandToggle}
                                    onClick={() => toggleBand(band.index)}
                                >
                                    <span className={cls.bandTitle}>
                                        {t('Группа {{index}} · глаголы {{from}}–{{to}}', {
                                            index: band.index,
                                            from: band.from,
                                            to: band.to,
                                        })}
                                    </span>
                                    <span className={cls.bandSub}>
                                        {band.index === FIRST_BAND
                                            ? t('Самые частотные: {{verbs}}…', { verbs: preview })
                                            : `${preview}…`}
                                    </span>
                                </button>
                                <div className={cls.mastery}>
                                    <MasteryBar mastered={percent} learning={0} />
                                    <Kicker size={KickerSize.SM}>
                                        {t('{{percent}}% усвоено', { percent })}
                                    </Kicker>
                                </div>
                                {deck ? (
                                    <Button className={cls.cta} onClick={() => navigate(RoutePath.DECK(deck.uuid))}>
                                        {t('Открыть колоду')}
                                    </Button>
                                ) : (
                                    <Button
                                        type={band.index === nextBandIndex ? 'primary' : 'default'}
                                        className={cls.cta}
                                        loading={importingBand === band.index}
                                        disabled={importingBand !== null && importingBand !== band.index}
                                        onClick={() => importBand(band)}
                                    >
                                        {t('Создать колоду · {{count}}', { count: band.verbs.length })}
                                    </Button>
                                )}
                            </div>
                            {isOpen && (
                                <div className={cls.table}>
                                    <div className={classNames(cls.row, [cls.head])}>
                                        {FORM_LABELS.map((label) => <span key={label}>{label}</span>)}
                                        <span>{t('Перевод')}</span>
                                    </div>
                                    {visibleVerbs.map((verb) => (
                                        <div key={verb.base} className={cls.row}>
                                            <span className={cls.base}>{verb.base}</span>
                                            <span>{verb.past}</span>
                                            <span>{verb.participle}</span>
                                            <span className={cls.translation}>{verb.translation}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Blueprint>
                    );
                })}
            </div>
        </div>
    );
};

export default IrregularVerbsPage;
