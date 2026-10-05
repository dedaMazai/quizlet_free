import {
  FC, useMemo, useState, useEffect, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Tooltip } from 'antd';
import type { Key } from 'react';
import {
  useGetCardsQuery,
  useUpdateCardsBulkMutation,
  useCheckTranslationsMutation,
  useAiQuota,
  AiCheckResult,
  AiQuotaNotice,
} from '@/entities/Card';
import { useGetDeckQuery } from '@/entities/Deck';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { CheckSquare } from '@/shared/ui/CheckSquare';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useToast } from '@/shared/lib/toast';
import cls from './CheckTranslationsModal.module.scss';

const MODAL_WIDTH = 920;

interface CheckTranslationsModalProps {
  open: boolean;
  deckUuid: string;
  onClose: () => void;
}

// Строка таблицы: ответ ИИ, дополненный текущими данными карточки.
interface ResultRow extends AiCheckResult {
  term: string;
  current: string;
}

// Редактируемые пользователем значения по uuid карточки.
interface EditValue {
  translation: string;
  example: string;
}

export const CheckTranslationsModal: FC<CheckTranslationsModalProps> = (props) => {
  const { open, deckUuid, onClose } = props;
  const { t } = useTranslation();
  const toast = useToast();

  const [results, setResults] = useState<AiCheckResult[] | null>(null);
  const [edits, setEdits] = useState<Record<string, EditValue>>({});
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const { data: cards } = useGetCardsQuery(deckUuid, { skip: !open });
  const { remaining, isExhausted: noCredits, isUnlimited } = useAiQuota({ skip: !open });
  const { data: deck } = useGetDeckQuery(deckUuid, { skip: !open });
  const [checkTranslations, { isLoading: isChecking }] = useCheckTranslationsMutation();
  const [updateCardsBulk, { isLoading: isApplying }] = useUpdateCardsBulkMutation();

  // Сбрасываем состояние при каждом открытии модалки.
  useEffect(() => {
    if (open) {
      setResults(null);
      setEdits({});
      setSelectedKeys([]);
    }
  }, [open]);

  const cardsByUuid = useMemo(
    () => new Map((cards ?? []).map((c) => [c.uuid, c])),
    [cards],
  );

  // Сопоставляем ответ ИИ с актуальными карточками (по uuid).
  const rows = useMemo<ResultRow[]>(() => {
    if (!results) return [];
    return results
      .map((r) => {
        const card = cardsByUuid.get(r.uuid);
        if (!card) return null;
        return { ...r, term: card.term, current: card.translation };
      })
      .filter((r): r is ResultRow => r !== null);
  }, [results, cardsByUuid]);

  const hasCards = (cards?.length ?? 0) > 0;

  const setEditField = useCallback((uuid: string, field: keyof EditValue, value: string) => {
    setEdits((prev) => ({ ...prev, [uuid]: { ...prev[uuid], [field]: value } }));
  }, []);

  const handleCheck = async () => {
    if (!cards?.length) return;
    try {
      const input = cards.map((c) => ({ uuid: c.uuid, term: c.term, translation: c.translation }));
      const data = await checkTranslations(input).unwrap();
      setResults(data);
      // Предзаполняем правки: перевод — предложение ИИ (или текущий, если ИИ счёл его корректным).
      const initialEdits: Record<string, EditValue> = {};
      data.forEach((r) => {
        const card = cardsByUuid.get(r.uuid);
        initialEdits[r.uuid] = {
          translation: !r.translation_ok && r.suggested_translation
            ? r.suggested_translation
            : (card?.translation ?? ''),
          example: r.example ?? '',
        };
      });
      setEdits(initialEdits);
      // По умолчанию выбираем все строки — ИИ заполняет примеры для каждого слова.
      setSelectedKeys(data.map((r) => r.uuid));
      toast.success(t('Переводы проверены'));
    } catch (err) {
      const code = (err as { error?: string })?.error;
      if (code === 'AI_LIMIT_EXCEEDED') {
        toast.error(t('Лимит запросов к ИИ исчерпан'));
      } else {
        toast.error(t('Не удалось проверить переводы'));
      }
    }
  };

  const handleApply = async () => {
    const selected = new Set(selectedKeys.map(String));
    const payload = rows
      .filter((r) => selected.has(r.uuid))
      .map((r) => ({
        uuid: r.uuid,
        translation: edits[r.uuid]?.translation ?? r.current,
        example: edits[r.uuid]?.example ? edits[r.uuid].example : null,
      }));
    if (payload.length === 0) return;
    try {
      await updateCardsBulk(payload).unwrap();
      toast.success(t('Изменения применены'));
      onClose();
    } catch {
      toast.error(t('Не удалось применить изменения'));
    }
  };

  const selected = new Set(selectedKeys.map(String));
  const fixCount = rows.filter((r) => !r.translation_ok).length;
  const exampleCount = rows.filter((r) => r.example).length;
  const selectedFixCount = rows.filter((r) => selected.has(r.uuid) && !r.translation_ok).length;
  const selectedExampleCount = rows.filter((r) => selected.has(r.uuid) && r.example).length;

  const toggleRow = (uuid: string, checked: boolean) => {
    setSelectedKeys((prev) => (checked ? [...prev, uuid] : prev.filter((key) => key !== uuid)));
  };

  return (
    <ModalFrame
      open={open}
      width={MODAL_WIDTH}
      kicker={deck?.name}
      title={t('Проверка переводов')}
      quota={isUnlimited ? t('без лимита') : t('Осталось {{count}}', { count: remaining ?? 0 })}
      footerNote={results
        ? t('Выбрано {{fixes}} и {{examples}}', {
          fixes: t('{{count}} правок', { count: selectedFixCount }),
          examples: t('{{count}} примеров', { count: selectedExampleCount }),
        })
        : undefined}
      onClose={onClose}
      destroyOnHidden
      actions={(
        <>
          <Button onClick={onClose}>{t('Закрыть')}</Button>
          {results ? (
            <Button
              type="primary"
              loading={isApplying}
              disabled={selectedKeys.length === 0}
              onClick={handleApply}
            >
              <BlueprintMarks />
              {t('Применить выбранное')}
            </Button>
          ) : (
            <Tooltip title={noCredits ? t('Лимит обновится завтра') : undefined}>
              <Button
                type="primary"
                loading={isChecking}
                disabled={noCredits || !hasCards}
                onClick={handleCheck}
              >
                <BlueprintMarks />
                {t('Проверить')}
              </Button>
            </Tooltip>
          )}
        </>
      )}
    >
      <div className={cls.content}>
        {!results && <AiQuotaNotice />}
        {!results && (
          <span className={cls.summary}>
            {t('ИИ проверит переводы {{count}} слов колоды и подберёт к ним примеры.', {
              count: cards?.length ?? 0,
            })}
          </span>
        )}

        {results && (
          <>
            <span className={cls.summary}>
              {t('ИИ проверил {{count}} слов', { count: rows.length })}
              {': '}
              {t('{{count}} переводов стоит поправить', { count: fixCount })}
              {', '}
              {t('к {{count}} словам добавлены примеры', { count: exampleCount })}
              .
            </span>
            <div className={classNames(cls.grid, [cls.head])}>
              <span />
              <span>{t('Слово')}</span>
              <span>{t('Сейчас')}</span>
              <span>{t('Предлагает ИИ')}</span>
              <span>{t('Пример')}</span>
            </div>
            <div className={cls.list}>
              {rows.map((row) => {
                const isFix = !row.translation_ok;
                const translation = edits[row.uuid]?.translation ?? '';
                return (
                  <div key={row.uuid} className={classNames(cls.grid, [cls.row])}>
                    <CheckSquare
                      checked={selected.has(row.uuid)}
                      label={row.term}
                      onChange={(checked) => toggleRow(row.uuid, checked)}
                    />
                    <span className={cls.term}>{row.term}</span>
                    <span className={isFix ? cls.replaced : undefined}>
                      {row.current}
                    </span>
                    {/* Без правки поле пустое и показывает «без изменений»;
                        очищенное поле возвращает текущий перевод */}
                    <Input
                      variant="borderless"
                      className={classNames(cls.cell, [], { [cls.suggested]: isFix })}
                      value={!isFix && translation === row.current ? '' : translation}
                      placeholder={t('без изменений')}
                      onChange={(e) => setEditField(
                        row.uuid,
                        'translation',
                        isFix ? e.target.value : (e.target.value || row.current),
                      )}
                    />
                    <Input
                      variant="borderless"
                      className={classNames(cls.cell, [cls.example])}
                      value={edits[row.uuid]?.example ?? ''}
                      onChange={(e) => setEditField(row.uuid, 'example', e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </ModalFrame>
  );
};
