import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, List, Modal, Select,
} from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
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
import { UserAvatar } from './UserAvatar';
import cls from './ShareDeckModal.module.scss';

interface ShareOption extends DefaultOptionType {
  value: string;
  name?: string;
  email: string;
}

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
  const options = useMemo<ShareOption[]>(() => {
    const sharedIds = new Set((shares ?? []).map((s) => s.user_id));
    return (users ?? [])
      .filter((u) => !sharedIds.has(u.user_id))
      .map((u) => ({
        value: u.email,
        label: u.name ? `${u.name} (${u.email})` : u.email,
        name: u.name,
        email: u.email,
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
        <HStack max gap="8" align="start">
          <Select<string, ShareOption>
            className={cls.select}
            size="large"
            value={email}
            onChange={setEmail}
            options={options}
            loading={isUsersLoading}
            showSearch
            allowClear
            placeholder={t('Выберите пользователя')}
            notFoundContent={t('Нет доступных пользователей')}
            filterOption={(input, option) => {
              const query = input.trim().toLowerCase();
              return Boolean(
                option?.name?.toLowerCase().includes(query)
                || option?.email.toLowerCase().includes(query),
              );
            }}
            optionRender={(option) => {
              const data = option.data as ShareOption;
              return (
                <HStack gap="12" align="center" className={cls.option}>
                  <UserAvatar email={data.email} name={data.name} size={32} />
                  <VStack gap="2">
                    <MyTypography.Base strong className={cls.name}>
                      {data.name ?? data.email}
                    </MyTypography.Base>
                    {data.name && (
                      <MyTypography.Small type="secondary">{data.email}</MyTypography.Small>
                    )}
                  </VStack>
                </HStack>
              );
            }}
          />
          <Button
            type="primary"
            size="large"
            icon={<UserAddOutlined />}
            loading={isSharing}
            disabled={!email}
            onClick={handleShare}
          >
            {t('Поделиться')}
          </Button>
        </HStack>

        <VStack max gap="8">
          <MyTypography.Small type="secondary" className={cls.sectionTitle}>
            {t('Есть доступ')}
          </MyTypography.Small>
          <List
            className={cls.list}
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
                <List.Item.Meta
                  avatar={<UserAvatar email={share.email} name={share.name} />}
                  title={share.name ?? share.email}
                  description={share.name ? share.email : undefined}
                />
              </List.Item>
            )}
          />
        </VStack>
      </VStack>
    </Modal>
  );
};
