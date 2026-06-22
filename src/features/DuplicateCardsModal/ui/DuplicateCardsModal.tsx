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
} from '@/entities/Card';
import { CardForm } from '@/features/CardForm';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import cls from './DuplicateCardsModal.module.scss';

interface DuplicateCardsModalProps {
  open: boolean;
  onClose: () => void;
  deckUuid: string;
}

export const DuplicateCardsModal: FC<DuplicateCardsModalProps> = (props) => {
  const { open, onClose, deckUuid } = props;
  const { t } = useTranslation();
  const { modal, message } = useAntdApp();
  const { isMobile } = useMatchMedia();

  const { data: cards, isLoading } = useGetCardsQuery(deckUuid, { skip: !open });
  const [deleteCard] = useDeleteCardMutation();

  const groups = useMemo(() => findDuplicateGroups(cards ?? []), [cards]);

  const [editingCard, setEditingCard] = useState<Card | undefined>(undefined);

  const handleDelete = (card: Card) => {
    modal.confirm({
      title: t('Удалить слово «{{term}}»?', { term: card.term }),
      okText: t('Удалить'),
      okButtonProps: { danger: true },
      cancelText: t('Отмена'),
      onOk: async () => {
        await deleteCard(card.uuid).unwrap();
        message.success(t('Слово удалено'));
      },
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
      <Modal
        open={open}
        title={t('Дубли слов')}
        footer={null}
        width={isMobile ? 'calc(100vw - 24px)' : 640}
        onCancel={onClose}
      >
        {renderContent()}
      </Modal>
      <CardForm
        open={Boolean(editingCard)}
        deckUuid={deckUuid}
        card={editingCard}
        onClose={() => setEditingCard(undefined)}
      />
    </>
  );
};
