import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Select } from 'antd';
import { Plus } from 'lucide-react';
import { useGetCardsCountQuery, useGetFavoritesQuery } from '@/entities/Card';
import { useGetDecksQuery } from '@/entities/Deck';
import { useUserAccesses } from '@/entities/User';
import { CardEditor } from '@/features/CardEditor';
import { DeckForm } from '@/features/DeckForm';
import { DuplicateCardsModal } from '@/features/DuplicateCardsModal';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { PageHeader } from '@/shared/ui/PageHeader';
import { RoutePath } from '@/shared/config/router/routePath';
import { getNavSections, NavSectionKey } from '@/shared/const/menu';
import { Accesses } from '@/shared/types/accesses';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './LibraryHeader.module.scss';

const ICON_SIZE = 16;
const MOBILE_ICON_SIZE = 20;
const ICON_STROKE = 1.5;
const PICKER_WIDTH = 520;

/** Действие уровня библиотеки, которому нужна колода */
type DeckAction = 'import' | 'dups';

interface LibraryHeaderProps {
  /** «Создать колоду» — только на вкладке «Колоды» */
  showCreateDeck?: boolean;
}

/** Шапка библиотеки: H1, «Импорт из Excel», «Найти дубли», вкладки со счётчиками (6.3–6.5) */
export const LibraryHeader = memo(({ showCreateDeck }: LibraryHeaderProps) => {
  const { t, i18n } = useTranslation();
  const isAdmin = useUserAccesses().includes(Accesses.administration);
  const { isMobile } = useMatchMedia();

  const { data: decks } = useGetDecksQuery();
  const { data: wordsCount } = useGetCardsCountQuery();
  const { data: favorites } = useGetFavoritesQuery();

  const [deckFormOpen, setDeckFormOpen] = useState(false);
  const [pickerFor, setPickerFor] = useState<DeckAction | null>(null);
  const [pickedDeck, setPickedDeck] = useState<string | undefined>(undefined);
  const [target, setTarget] = useState<{ action: DeckAction; deckUuid: string } | null>(null);

  const tabs = useMemo(() => {
    const format = new Intl.NumberFormat(i18n.language);
    const counts: Record<string, number | undefined> = {
      [RoutePath.DECKS()]: decks?.length,
      [RoutePath.ALL_WORDS()]: wordsCount,
      [RoutePath.FAVORITES()]: favorites?.length,
    };
    const section = getNavSections({ t }).find(({ key }) => key === NavSectionKey.LIBRARY);
    return (section?.tabs ?? []).map((tab) => {
      const count = counts[tab.to];
      return count === undefined ? tab : { ...tab, count: format.format(count) };
    });
  }, [t, i18n.language, decks?.length, wordsCount, favorites?.length]);

  // Импорт и дубли меняют слова: только колоды, где правка доступна
  const deckOptions = useMemo(
    () => (decks ?? [])
      .filter((deck) => deck.is_owner || deck.allow_shared_edit || isAdmin)
      .map((deck) => ({ value: deck.uuid, label: deck.name })),
    [decks, isAdmin],
  );

  const openPicker = (action: DeckAction) => {
    setPickedDeck(undefined);
    setPickerFor(action);
  };

  const handlePick = () => {
    if (!pickerFor || !pickedDeck) return;
    setTarget({ action: pickerFor, deckUuid: pickedDeck });
    setPickerFor(null);
  };

  // Mobile 6.38: только «+» (создать колоду); импорт и дубли скрыты
  const mobileExtra = showCreateDeck ? (
    <Button
      className={cls.mobileCreate}
      aria-label={t('Создать колоду')}
      icon={<Plus size={MOBILE_ICON_SIZE} strokeWidth={ICON_STROKE} />}
      onClick={() => setDeckFormOpen(true)}
    />
  ) : undefined;

  return (
    <>
      <PageHeader
        title={t('Библиотека')}
        tabs={tabs}
        extra={isMobile ? mobileExtra : (
          <>
            <Button className={cls.button} onClick={() => openPicker('import')}>
              {t('Импорт из Excel')}
            </Button>
            <Button className={cls.button} onClick={() => openPicker('dups')}>
              {t('Найти дубли')}
            </Button>
            {showCreateDeck && (
              <Button
                type="primary"
                className={cls.button}
                icon={<Plus size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={() => setDeckFormOpen(true)}
              >
                <BlueprintMarks />
                {t('Создать колоду')}
              </Button>
            )}
          </>
        )}
      />

      <ModalFrame
        open={Boolean(pickerFor)}
        onClose={() => setPickerFor(null)}
        width={PICKER_WIDTH}
        kicker={t('Библиотека')}
        title={pickerFor === 'dups' ? t('Найти дубли') : t('Импорт из Excel')}
        actions={(
          <>
            <Button onClick={() => setPickerFor(null)}>
              {t('Отмена')}
            </Button>
            <Button
              type="primary"
              disabled={!pickedDeck}
              onClick={handlePick}
            >
              <BlueprintMarks />
              {t('Далее')}
            </Button>
          </>
        )}
      >
        <div className={cls.picker}>
          <span className={cls.pickerLabel}>{t('В какой колоде?')}</span>
          <Select
            className={cls.pickerSelect}
            aria-label={t('Выберите колоду')}
            showSearch
            optionFilterProp="label"
            value={pickedDeck}
            options={deckOptions}
            placeholder={t('Выберите колоду')}
            notFoundContent={t('Нет колод, которые можно изменить')}
            onChange={setPickedDeck}
          />
        </div>
      </ModalFrame>

      <CardEditor
        open={target?.action === 'import'}
        deckUuid={target?.deckUuid ?? ''}
        onClose={() => setTarget(null)}
      />
      <DuplicateCardsModal
        open={target?.action === 'dups'}
        deckUuid={target?.deckUuid ?? ''}
        onClose={() => setTarget(null)}
      />
      <DeckForm open={deckFormOpen} onClose={() => setDeckFormOpen(false)} />
    </>
  );
});

LibraryHeader.displayName = 'LibraryHeader';
