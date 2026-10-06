import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Switch } from 'antd';
import {
  useShareDeckMutation,
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
// Достаточная проверка формата: остальное (есть ли такой аккаунт) решает RPC share_deck_by_email
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ShareDeckModalProps {
  open: boolean;
  deckUuid: string;
  onClose: () => void;
}

export const ShareDeckModal: FC<ShareDeckModalProps> = (props) => {
  const { open, deckUuid, onClose } = props;
  const { t } = useTranslation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [shareDeck, { isLoading: isSharing }] = useShareDeckMutation();
  const [removeShare] = useRemoveDeckShareMutation();
  const { data: shares, isLoading } = useGetDeckSharesQuery(deckUuid, { skip: !open });
  const { data: deck } = useGetDeckQuery(deckUuid, { skip: !open });
  const [setSharedEdit, { isLoading: isToggling }] = useSetDeckSharedEditMutation();

  // Список всех пользователей не показываем: чужие email — персональные данные.
  // Доступ открывается по точному адресу, который владелец колоды уже знает.
  const trimmedEmail = email.trim();
  const isEmailValid = EMAIL_PATTERN.test(trimmedEmail);

  const handleShare = async () => {
    if (!isEmailValid) return;
    try {
      await shareDeck({ deckUuid, email: trimmedEmail }).unwrap();
      toast.success(t('Доступ открыт'));
      setEmail('');
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
          <Input
            className={cls.emailInput}
            type="email"
            inputMode="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onPressEnter={handleShare}
            placeholder={t('Почта пользователя Zubrika')}
            allowClear
          />
          <Button
            type="primary"
            className={cls.shareButton}
            loading={isSharing}
            disabled={!isEmailValid}
            onClick={handleShare}
          >
            <BlueprintMarks />
            {t('Поделиться')}
          </Button>
        </div>

        <span className={cls.note}>
          {t('Введите email, с которым человек зарегистрирован. Мы не показываем список пользователей.')}
        </span>

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
