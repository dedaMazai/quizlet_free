import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import {
  CopyCheck, Pencil, Trash2, Volume2,
} from 'lucide-react';
import {
  Card,
  useGetCardsQuery,
  useDeleteCardMutation,
  findDuplicateGroups,
  FavoriteToggle,
} from '@/entities/Card';
import { CardForm } from '@/features/CardForm';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { EmptyState, EmptyStateAlign } from '@/shared/ui/EmptyState';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { Loader } from '@/shared/ui/Loader';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useToast, useUndoableDelete } from '@/shared/lib/toast';
import cls from './DuplicateCardsModal.module.scss';

const MODAL_WIDTH = 640;
const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

interface DuplicateCardsModalProps {
  open: boolean;
  onClose: () => void;
  deckUuid: string;
}

export const DuplicateCardsModal: FC<DuplicateCardsModalProps> = (props) => {
  const { open, onClose, deckUuid } = props;
  const { t } = useTranslation();
  const { modal } = useAntdApp();
  const toast = useToast();

  const { data: cards, isLoading } = useGetCardsQuery(deckUuid, { skip: !open });
  const [deleteCard] = useDeleteCardMutation();

  // Удаление с «Отменить»: слово скрыто сразу, запрос уходит через 6 с
  const { hiddenIds, remove: removeCard } = useUndoableDelete({
    onCommit: (uuid) => deleteCard(uuid).unwrap(),
    onError: () => toast.error(t('Не удалось удалить слово')),
  });

  const groups = useMemo(
    () => findDuplicateGroups((cards ?? []).filter((card) => !hiddenIds.has(card.uuid))),
    [cards, hiddenIds],
  );

  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);

  const handleDelete = (card: Card) => {
    modal.confirm({
      title: t('Удалить слово «{{term}}»?', { term: card.term }),
      okText: t('Удалить'),
      okButtonProps: { danger: true },
      cancelText: t('Отмена'),
      onOk: () => removeCard(card.uuid, t('Слово удалено'), t('Отменить')),
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    if (!groups.length) {
      return (
        <EmptyState
          icon={CopyCheck}
          kicker={t('Дубли слов')}
          title={t('Дубли не найдены')}
          align={EmptyStateAlign.CENTER}
        />
      );
    }

    return groups.map((group) => (
      <div key={group[0].uuid} className={cls.group}>
        <Kicker size={KickerSize.SM}>{t('{{count}} совпадения', { count: group.length })}</Kicker>
        {group.map((card) => (
          <div key={card.uuid} className={cls.row}>
            <div className={cls.main}>
              <span className={cls.termRow}>
                <span className={cls.term}>{card.term}</span>
                <SpeakButton
                  text={card.term}
                  icon={<Volume2 aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                />
              </span>
              <span className={cls.translation}>{card.translation}</span>
              {card.example && <span className={cls.example}>{card.example}</span>}
            </div>
            <div className={cls.actions}>
              <FavoriteToggle cardUuid={card.uuid} />
              <Button
                type="text"
                aria-label={t('Редактировать')}
                icon={<Pencil aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={() => setEditingCard(card)}
              />
              <Button
                type="text"
                aria-label={t('Удалить')}
                icon={<Trash2 aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
                onClick={() => handleDelete(card)}
              />
            </div>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <>
      <ModalFrame
        open={open}
        width={MODAL_WIDTH}
        title={t('Дубли слов')}
        onClose={onClose}
        actions={<Button onClick={onClose}>{t('Закрыть')}</Button>}
      >
        <div className={cls.content}>{renderContent()}</div>
      </ModalFrame>
      <CardForm
        open={Boolean(editingCard)}
        deckUuid={deckUuid}
        card={editingCard}
        onClose={() => setEditingCard(undefined)}
      />
    </>
  );
};
