import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Divider, Empty, Modal, Tag,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Card,
  useGetCardsQuery,
  useDeleteCardMutation,
  findDuplicateGroups,
  FavoriteToggle,
} from '@/entities/Card';
import { CardForm } from '@/features/CardForm';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useToast, useUndoableDelete } from '@/shared/lib/toast';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { MODAL_MOTION } from '@/shared/const/motion';
import cls from './DuplicateCardsModal.module.scss';

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
  const { isMobile } = useMatchMedia();

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
      return <Empty description={t('Дубли не найдены')} />;
    }

    return (
      <VStack max gap="8">
        {groups.map((group, index) => (
          <div key={group[0].uuid} className={cls.group}>
            {index > 0 && <Divider className={cls.divider} />}
            <VStack max gap="8">
              <Tag bordered={false}>{t('{{count}} совпадения', { count: group.length })}</Tag>
              {group.map((card) => (
                <HStack key={card.uuid} max justify="between" align="start" gap="8" className={cls.row}>
                  <VStack gap="2" align="start" className={cls.main}>
                    <HStack gap="4" align="center">
                      <span className={cls.term}>{card.term}</span>
                      <SpeakButton text={card.term} />
                    </HStack>
                    <MyTypography.Base>{card.translation}</MyTypography.Base>
                    {card.example && (
                      <MyTypography.Small type="secondary" className={cls.example}>
                        {card.example}
                      </MyTypography.Small>
                    )}
                  </VStack>
                  <HStack gap="2" align="center">
                    <FavoriteToggle cardUuid={card.uuid} />
                    <Button
                      type="text"
                      size="small"
                      aria-label={t('Редактировать')}
                      icon={<EditOutlined />}
                      onClick={() => setEditingCard(card)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      aria-label={t('Удалить')}
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(card)}
                    />
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </div>
        ))}
      </VStack>
    );
  };

  return (
    <>
      {isMobile ? (
        // Mobile: шторка вместо модалки
        <ModalFrame open={open} width="100%" title={t('Дубли слов')} onClose={onClose}>
          <div className={cls.sheetContent}>{renderContent()}</div>
        </ModalFrame>
      ) : (
        <Modal
          {...MODAL_MOTION}
          open={open}
          title={t('Дубли слов')}
          footer={null}
          width={640}
          onCancel={onClose}
        >
          {renderContent()}
        </Modal>
      )}
      <CardForm
        open={Boolean(editingCard)}
        deckUuid={deckUuid}
        card={editingCard}
        onClose={() => setEditingCard(undefined)}
      />
    </>
  );
};
