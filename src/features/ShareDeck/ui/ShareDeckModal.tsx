import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Select, Switch } from 'antd';
import {
  useShareDeckMutation,
  useGetDeckQuery,
  useGetDeckSharesQuery,
  useRemoveDeckShareMutation,
  useSetDeckSharedEditMutation,
} from '@/entities/Deck';
import { useContactLabelOptions, useGetContactsQuery } from '@/entities/Contact';
import { RoutePath } from '@/shared/config/router/routePath';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { Kicker, KickerSize } from '@/shared/ui/Kicker';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { Loader } from '@/shared/ui/Loader';
import { useToast } from '@/shared/lib/toast';
import { UserAvatar } from './UserAvatar';
import cls from './ShareDeckModal.module.scss';

const MODAL_WIDTH = 520;

interface RecipientOption {
  value: string;
  label: string;
  email: string;
  tag?: string;
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
  const navigate = useNavigate();
  const labelOptions = useContactLabelOptions();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [shareDeck, { isLoading: isSharing }] = useShareDeckMutation();
  const [removeShare] = useRemoveDeckShareMutation();
  const { data: shares, isLoading } = useGetDeckSharesQuery(deckUuid, { skip: !open });
  const { data: deck } = useGetDeckQuery(deckUuid, { skip: !open });
  const [setSharedEdit, { isLoading: isToggling }] = useSetDeckSharedEditMutation();
  const { data: contacts, isLoading: isContactsLoading } = useGetContactsQuery(undefined, { skip: !open });

  // Делиться можно только с контактами: чужие email не вводятся и не перебираются.
  // В выборе — контакты, у которых ещё нет доступа.
  const options = useMemo<RecipientOption[]>(() => {
    const sharedIds = new Set(shares?.map((share) => share.user_id));
    const tagByLabel = new Map(labelOptions.map((option) => [option.value, option.label]));
    return (contacts ?? [])
      .filter((contact) => !sharedIds.has(contact.id))
      .map((contact) => ({
        value: contact.id,
        label: contact.name || contact.email,
        email: contact.email,
        tag: contact.label && tagByLabel.get(contact.label),
      }));
  }, [contacts, shares, labelOptions]);

  const goToContacts = () => {
    onClose();
    navigate(RoutePath.CONTACTS());
  };

  const handleShare = async () => {
    if (!selectedIds.length) return;
    try {
      await shareDeck({ deckUuid, userIds: selectedIds }).unwrap();
      toast.success(t('Доступ открыт'));
      setSelectedIds([]);
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
        {!isContactsLoading && !contacts?.length ? (
          <div className={cls.noContacts}>
            <span className={cls.note}>
              {t('Колодой можно поделиться с контактами. Пригласите друга или учеников по ссылке.')}
            </span>
            <Button className={cls.shareButton} onClick={goToContacts}>
              {t('Добавить контакты')}
            </Button>
          </div>
        ) : (
          <>
            <div className={cls.shareRow}>
              <Select<string[], RecipientOption>
                className={cls.recipients}
                mode="multiple"
                value={selectedIds}
                onChange={setSelectedIds}
                options={options}
                loading={isContactsLoading}
                placeholder={t('Выберите контакты')}
                notFoundContent={t('Все контакты уже имеют доступ')}
                filterOption={(input, option) => {
                  const query = input.trim().toLowerCase();
                  return Boolean(option && `${option.label} ${option.email}`.toLowerCase().includes(query));
                }}
                optionRender={({ data }) => (
                  <div className={cls.option}>
                    <span className={cls.optionText}>
                      <span className={cls.name}>{data.label}</span>
                      {data.label !== data.email && <span className={cls.email}>{data.email}</span>}
                    </span>
                    {data.tag && <span className={cls.tag}>{data.tag}</span>}
                  </div>
                )}
                maxTagCount="responsive"
              />
              <Button
                type="primary"
                className={cls.shareButton}
                loading={isSharing}
                disabled={!selectedIds.length}
                onClick={handleShare}
              >
                <BlueprintMarks />
                {t('Поделиться')}
              </Button>
            </div>

            <span className={cls.note}>
              {t('В списке — ваши контакты.')}
              {' '}
              <Button type="link" className={cls.inlineLink} onClick={goToContacts}>
                {t('Добавить контакты')}
              </Button>
            </span>
          </>
        )}

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
