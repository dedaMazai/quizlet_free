import { memo, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spin } from 'antd';
import {
    FileSpreadsheet, LucideIcon, PenLine, Sparkles,
} from 'lucide-react';
import { useLazyGetCardsQuery } from '@/entities/Card';
import { useDeleteDeckMutation, useGetDeckQuery } from '@/entities/Deck';
import { CardEditor } from '@/features/CardEditor';
import { DeckForm } from '@/features/DeckForm';
import { useImportVerbsDeck } from '@/features/ImportVerbsDeck';
import { VERB_BANDS } from '@/shared/const/grammar';
import { Blueprint } from '@/shared/ui/Blueprint';
import { Kicker, KickerTone } from '@/shared/ui/Kicker';
import { SessionStage } from '@/shared/ui/SessionStage';
import cls from '../OnboardingPage.module.scss';
import deckCls from './DeckStep.module.scss';

const ICON_SIZE = 24;
const ICON_STROKE = 1.25;

enum DeckSource {
    EXCEL = 'excel',
    MANUAL = 'manual',
    VERBS = 'verbs',
}

interface DeckOption {
    source: DeckSource;
    icon: LucideIcon;
    title: string;
    description: string;
}

interface DeckStepProps {
    header: ReactNode;
    /** Колода, созданная на этом шаге раньше (из URL): повторный выбор не создаёт вторую */
    deckUuid?: string;
    onDeckCreated: (deckUuid: string) => void;
    /** Колода создана, и в ней есть слова */
    onReady: (deckUuid: string) => void;
}

/** Шаг 2: первая колода — импорт из Excel, ввод слов или готовый набор неправильных глаголов */
export const DeckStep = memo((props: DeckStepProps) => {
    const {
        header, deckUuid, onDeckCreated, onReady,
    } = props;
    const { t } = useTranslation();
    const { importBand } = useImportVerbsDeck();
    const [getCards] = useLazyGetCardsQuery();
    const [deleteDeck] = useDeleteDeckMutation();
    // Колода из URL — только если она есть и своя (могли удалить в другой вкладке или подменить ссылку)
    const { data: urlDeck } = useGetDeckQuery(deckUuid ?? '', { skip: !deckUuid });
    const ownDeckUuid = urlDeck?.is_owner ? urlDeck.uuid : undefined;

    const [deckFormOpen, setDeckFormOpen] = useState(false);
    const [editorSource, setEditorSource] = useState<DeckSource>();
    const [pendingSource, setPendingSource] = useState<DeckSource>();
    // Импорт глаголов и уборка пустой колоды — до перехода к сессии
    const [verbsBusy, setVerbsBusy] = useState(false);

    const verbsBand = VERB_BANDS[0];

    const options: DeckOption[] = [
        {
            source: DeckSource.EXCEL,
            icon: FileSpreadsheet,
            title: t('Импорт из Excel'),
            description: t('Загрузите таблицу: слово и перевод в двух столбцах'),
        },
        {
            source: DeckSource.MANUAL,
            icon: PenLine,
            title: t('Ввести слова'),
            description: t('Добавьте слова с переводами вручную'),
        },
        {
            source: DeckSource.VERBS,
            icon: Sparkles,
            title: t('Готовый набор: неправильные глаголы, группа 1'),
            description: t('{{count}} частых глаголов в трёх формах', { count: verbsBand.verbs.length }),
        },
    ];

    /** Есть ли слова в колоде; null — не удалось проверить */
    const hasCards = async (uuid: string): Promise<boolean | null> => {
        try {
            const cards = await getCards(uuid).unwrap();
            return cards.length > 0;
        } catch {
            return null;
        }
    };

    const handleChoose = async (source: DeckSource) => {
        if (source === DeckSource.VERBS) {
            setVerbsBusy(true);
            const created = await importBand(verbsBand);
            if (!created) {
                setVerbsBusy(false);
                return;
            }
            // Передумал после «Импорт»/«Ввести слова»: пустую колоду этого шага не оставляем
            if (ownDeckUuid && await hasCards(ownDeckUuid) === false) {
                try {
                    await deleteDeck(ownDeckUuid).unwrap();
                } catch {
                    // Пустая колода останется в списке — не повод прерывать онбординг
                }
            }
            onReady(created.uuid);
            return;
        }
        if (ownDeckUuid) {
            setEditorSource(source);
            return;
        }
        setPendingSource(source);
        setDeckFormOpen(true);
    };

    const handleEditorClose = async () => {
        setEditorSource(undefined);
        // Слов нет или не удалось проверить — остаёмся на шаге, выбор можно повторить
        if (ownDeckUuid && await hasCards(ownDeckUuid)) onReady(ownDeckUuid);
    };

    return (
        <>
            {header}
            <SessionStage>
                <div className={cls.head}>
                    <Kicker tone={KickerTone.ACCENT}>{t('Первая колода')}</Kicker>
                    <h1 className={cls.title}>{t('С каких слов начнём?')}</h1>
                    <p className={cls.text}>{t('Колода — набор слов с переводами, из неё строятся все режимы.')}</p>
                </div>
                <div className={deckCls.options}>
                    {options.map((option) => {
                        const isLoading = option.source === DeckSource.VERBS && verbsBusy;
                        const Icon = option.icon;
                        return (
                            <Blueprint
                                key={option.source}
                                as="button"
                                type="button"
                                className={deckCls.option}
                                disabled={verbsBusy}
                                onClick={() => handleChoose(option.source)}
                            >
                                <span className={deckCls.icon}>
                                    {isLoading
                                        ? <Spin size="small" />
                                        : <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                                </span>
                                <span className={deckCls.optionTitle}>{option.title}</span>
                                <span className={deckCls.optionText}>{option.description}</span>
                            </Blueprint>
                        );
                    })}
                </div>
            </SessionStage>

            <DeckForm
                open={deckFormOpen}
                onClose={() => setDeckFormOpen(false)}
                onCreated={(created) => {
                    onDeckCreated(created.uuid);
                    setEditorSource(pendingSource);
                }}
            />
            {ownDeckUuid && editorSource && (
                <CardEditor
                    open
                    openFilePicker={editorSource === DeckSource.EXCEL}
                    deckUuid={ownDeckUuid}
                    onClose={handleEditorClose}
                />
            )}
        </>
    );
});

DeckStep.displayName = 'DeckStep';
