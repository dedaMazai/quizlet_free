import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Select, Switch } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { ChevronDown } from 'lucide-react';
import {
  useShareDeckMutation,
  useGetShareableUsersQuery,
  useGetDeckQuery,
  useGetDeckSharesQuery,
  useRemoveDeckShareMutation,
  useSetDeckSharedEditMutation,
} from '@/entities/Deck';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { Loader } from '@/shared/ui/Loader';
import { useToast } from '@/shared/lib/toast';
import { UserAvatar } from './UserAvatar';
import cls from './ShareDeckModal.module.scss';

const MODAL_WIDTH = 520;
const CHEVRON_SIZE = 14;
const ICON_STROKE = 1.5;

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
  const toast = useToast();

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [shareDeck, { isLoading: isSharing }] = useShareDeckMutation();
  const [removeShare] = useRemoveDeckShareMutation();
  const { data: shares, isLoading } = useGetDeckSharesQuery(deckUuid, { skip: !open });
  const { data: users, isLoading: isUsersLoading } = useGetShareableUsersQuery(undefined, { skip: !open });
  const { data: deck } = useGetDeckQuery(deckUuid, { skip: !open });
  const [setSharedEdit, { isLoading: isToggling }] = useSetDeckSharedEditMutation();

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
      toast.success(t('Доступ открыт'));
      setEmail(undefined);
    } catch (err) {
      const text = (err as { error?: string })?.error;
      toast.error(text ? t(text) : t('Не удалось открыть доступ'));
    }
  };

  const handleToggleSharedEdit = async (allow: boolean) => {
    try {
      await setSharedEdit({ uuid: deckUuid, allow }).unwrap();
    } catch {
      toast.error(t('Не удалось изменить настройку'));
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeShare({ deckUuid, userId }).unwrap();
      toast.success(t('Доступ закрыт'));
    } catch {
      toast.error(t('Не удалось закрыть доступ'));
    }
  };

  return (
    <ModalFrame
      open={open}
      width={MODAL_WIDTH}
      kicker={deck?.name}
      title={t('Доступ к колоде')}
      onClose={onClose}
      destroyOnHidden
      actions={<Button onClick={onClose}>{t('Готово')}</Button>}
    >
      <div className={cls.content}>
        <div className={cls.shareRow}>
          <Select<string, ShareOption>
            className={cls.select}
            value={email}
            onChange={setEmail}
            options={options}
            loading={isUsersLoading}
            showSearch
            allowClear
            suffixIcon={<ChevronDown aria-hidden size={CHEVRON_SIZE} strokeWidth={ICON_STROKE} />}
            placeholder={t('Почта или имя пользователя')}
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
                <div className={cls.person}>
                  <UserAvatar email={data.email} name={data.name} />
                  <div className={cls.personText}>
                    <span className={cls.name}>{data.name ?? data.email}</span>
                    {data.name && <span className={cls.email}>{data.email}</span>}
                  </div>
                </div>
              );
            }}
          />
          <Button
            type="primary"
            className={cls.shareButton}
            loading={isSharing}
            disabled={!email}
            onClick={handleShare}
          >
            <BlueprintMarks />
            {t('Поделиться')}
          </Button>
        </div>

        <div className={cls.shared}>
          <Kicker size={KickerSize.SM} className={cls.sharedTitle}>
            {t('Есть доступ · {{count}}', { count: shares?.length ?? 0 })}
          </Kicker>
          {isLoading && <Loader />}
          {!isLoading && !shares?.length && (
            <span className={cls.empty}>{t('Пока ни с кем не поделились')}</span>
          )}
          {shares?.map((share) => (
            <div key={share.user_id} className={cls.person}>
              <UserAvatar email={share.email} name={share.name} />
              <div className={cls.personText}>
                <span className={cls.name}>{share.name ?? share.email}</span>
                {share.name && <span className={cls.email}>{share.email}</span>}
              </div>
              <Button
                type="link"
                className={cls.revoke}
                onClick={() => handleRemove(share.user_id)}
              >
                {t('Закрыть доступ')}
              </Button>
            </div>
          ))}
        </div>

        <label className={cls.editToggle}>
          <span>{t('Разрешить редактирование всем, у кого есть доступ')}</span>
          <Switch
            checked={deck?.allow_shared_edit ?? true}
            loading={isToggling || !deck}
            onChange={handleToggleSharedEdit}
          />
        </label>
        <span className={cls.note}>
          {t('У каждого гостя свой прогресс. Гость может скопировать колоду себе.')}
        </span>
      </div>
    </ModalFrame>
  );
};
