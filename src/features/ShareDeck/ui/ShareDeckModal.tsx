import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, List, Modal, Select,
} from 'antd';
import { DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import {
  useShareDeckMutation,
  useGetShareableUsersQuery,
  useGetDeckSharesQuery,
  useRemoveDeckShareMutation,
} from '@/entities/Deck';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import cls from './ShareDeckModal.module.scss';

interface ShareDeckModalProps {
  open: boolean;
  deckUuid: string;
  onClose: () => void;
}

export const ShareDeckModal: FC<ShareDeckModalProps> = (props) => {
  const { open, deckUuid, onClose } = props;
  const { t } = useTranslation();
  const { message } = useAntdApp();

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [shareDeck, { isLoading: isSharing }] = useShareDeckMutation();
  const [removeShare] = useRemoveDeckShareMutation();
  const { data: shares, isLoading } = useGetDeckSharesQuery(deckUuid, { skip: !open });
  const { data: users, isLoading: isUsersLoading } = useGetShareableUsersQuery(undefined, { skip: !open });

  // Кандидаты на доступ — все пользователи, кроме тех, у кого доступ уже есть.
  const options = useMemo(() => {
    const sharedIds = new Set((shares ?? []).map((s) => s.user_id));
    return (users ?? [])
      .filter((u) => !sharedIds.has(u.user_id))
      .map((u) => ({
        value: u.email,
        label: u.name ? `${u.name} (${u.email})` : u.email,
      }));
  }, [users, shares]);

  const handleShare = async () => {
    if (!email) return;
    try {
      await shareDeck({ deckUuid, email }).unwrap();
      message.success(t('Доступ открыт'));
      setEmail(undefined);
    } catch (err) {
      const text = (err as { error?: string })?.error;
      message.error(text ? t(text) : t('Не удалось открыть доступ'));
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeShare({ deckUuid, userId }).unwrap();
      message.success(t('Доступ закрыт'));
    } catch {
      message.error(t('Не удалось закрыть доступ'));
    }
  };

  return (
    <Modal
      open={open}
      title={t('Доступ к колоде')}
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <VStack max gap="16">
        <HStack max gap="8">
          <Select
            className={cls.select}
            value={email}
            onChange={setEmail}
            options={options}
            loading={isUsersLoading}
            showSearch
            optionFilterProp="label"
            placeholder={t('Выберите пользователя')}
            notFoundContent={t('Нет доступных пользователей')}
          />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            loading={isSharing}
            disabled={!email}
            onClick={handleShare}
          >
            {t('Поделиться')}
          </Button>
        </HStack>

        <List
          loading={isLoading}
          dataSource={shares ?? []}
          locale={{ emptyText: t('Пока ни с кем не поделились') }}
          renderItem={(share) => (
            <List.Item
              actions={[
                <Button
                  key="remove"
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(share.user_id)}
                />,
              ]}
            >
              <VStack gap="2">
                {share.name && <MyTypography.Base>{share.name}</MyTypography.Base>}
                <MyTypography.Small type="secondary">{share.email}</MyTypography.Small>
              </VStack>
            </List.Item>
          )}
        />
      </VStack>
    </Modal>
  );
};
