import {
  FC, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Select, Tooltip,
} from 'antd';
import type { SelectProps } from 'antd';
import type { Key } from 'react';
import { X } from 'lucide-react';
import {
  AiChunk,
  AiQuotaNotice,
  useAiQuota,
  useGenerateChunksMutation,
  useGetCardsQuery,
  useCreateCardsMutation,
} from '@/entities/Card';
import { useGetDeckQuery } from '@/entities/Deck';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { CheckSquare } from '@/shared/ui/CheckSquare';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { classNames } from '@/shared/lib/classNames/classNames';
import { useToast } from '@/shared/lib/toast';
import cls from './GenerateChunksModal.module.scss';

/** Столько же, сколько принимает Edge Function: один кредит — до 10 слов. */
const MAX_SOURCE_WORDS = 10;
const MODAL_WIDTH = 880;
const CHIP_ICON_SIZE = 12;
const ICON_STROKE = 1.5;

interface GenerateChunksModalProps {
  open: boolean;
  deckUuid: string;
  onClose: () => void;
}

// Строка таблицы: одна предложенная фраза, привязанная к исходному слову.
interface ChunkRow extends AiChunk {
  key: string;
  sourceUuid: string;
  sourceTerm: string;
}

type EditableField = 'term' | 'translation' | 'example';

export const GenerateChunksModal: FC<GenerateChunksModalProps> = (props) => {
  const { open, deckUuid, onClose } = props;
  const { t } = useTranslation();
  const toast = useToast();

  const [sourceUuids, setSourceUuids] = useState<string[]>([]);
  const [rows, setRows] = useState<ChunkRow[] | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const { data: cards } = useGetCardsQuery(deckUuid, { skip: !open });
  const { remaining, isExhausted: noCredits } = useAiQuota({ skip: !open });
  const { data: deck } = useGetDeckQuery(deckUuid, { skip: !open });
  const [generateChunks, { isLoading: isGenerating }] = useGenerateChunksMutation();
  const [createCards, { isLoading: isSaving }] = useCreateCardsMutation();

  // Сбрасываем состояние при каждом открытии модалки.
  useEffect(() => {
    if (open) {
      setSourceUuids([]);
      setRows(null);
      setSelectedKeys([]);
    }
  }, [open]);

  // Коллокации подбираем к одиночным словам: у фраз это уже фразы.
  const wordOptions = useMemo(
    () => (cards ?? [])
      .filter((card) => card.card_type === 'word')
      .map((card) => ({ value: card.uuid, label: `${card.term} — ${card.translation}` })),
    [cards],
  );


  const setRowField = useCallback((key: string, field: EditableField, value: string) => {
    setRows((prev) => (prev ?? []).map(
      (row) => (row.key === key ? { ...row, [field]: value } : row),
    ));
  }, []);

  const handleGenerate = async () => {
    const selectedCards = (cards ?? []).filter((card) => sourceUuids.includes(card.uuid));
    if (selectedCards.length === 0) return;
    try {
      const input = selectedCards.map((c) => ({
        uuid: c.uuid, term: c.term, translation: c.translation,
      }));
      const data = await generateChunks(input).unwrap();

      const termByUuid = new Map(selectedCards.map((c) => [c.uuid, c.term]));
      const next: ChunkRow[] = data.flatMap((result) => (result.chunks ?? []).map(
        (chunk, index) => ({
          ...chunk,
          key: `${result.uuid}:${index}`,
          sourceUuid: result.uuid,
          sourceTerm: termByUuid.get(result.uuid) ?? '',
        }),
      ));

      setRows(next);
      setSelectedKeys(next.map((row) => row.key));
      toast.success(t('Фразы подобраны'));
    } catch (err) {
      const code = (err as { error?: string })?.error;
      if (code === 'AI_LIMIT_EXCEEDED') {
        toast.error(t('Лимит запросов к ИИ исчерпан'));
      } else {
        toast.error(t('Не удалось подобрать фразы'));
      }
    }
  };

  const handleSave = async () => {
    const selected = new Set(selectedKeys.map(String));
    const payload = (rows ?? [])
      .filter((row) => selected.has(row.key) && row.term.trim())
      .map((row) => ({
        deck_uuid: deckUuid,
        term: row.term.trim(),
        translation: row.translation.trim(),
        example: row.example?.trim() || undefined,
        card_type: 'phrase' as const,
        parent_card_uuid: row.sourceUuid,
      }));
    if (payload.length === 0) return;
    try {
      await createCards(payload).unwrap();
      toast.success(t('Фразы добавлены'));
      onClose();
    } catch {
      toast.error(t('Не удалось добавить фразы'));
    }
  };

  // Выбранное слово — чип с крестиком (вместо стандартного тега Select)
  const renderChip: SelectProps['tagRender'] = ({ value, onClose: removeChip }) => {
    const card = cards?.find((item) => item.uuid === value);
    return (
      <span className={cls.chip}>
        {card?.term ?? value}
        <button
          type="button"
          className={cls.chipRemove}
          aria-label={t('Убрать')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={removeChip}
        >
          <X aria-hidden size={CHIP_ICON_SIZE} strokeWidth={ICON_STROKE} />
        </button>
      </span>
    );
  };

  // Фразы группируются по исходному слову в порядке ответа ИИ
  const groups = useMemo(() => {
    const map = new Map<string, ChunkRow[]>();
    (rows ?? []).forEach((row) => {
      map.set(row.sourceUuid, [...(map.get(row.sourceUuid) ?? []), row]);
    });
    return [...map.values()];
  }, [rows]);

  const selected = new Set(selectedKeys.map(String));

  const toggleRow = (key: string, checked: boolean) => {
    setSelectedKeys((prev) => (checked ? [...prev, key] : prev.filter((item) => item !== key)));
  };

  return (
    <ModalFrame
      open={open}
      width={MODAL_WIDTH}
      kicker={deck?.name}
      title={t('Подобрать фразы')}
      quota={t('Осталось {{count}}', { count: remaining ?? 0 })}
      footerNote={t('Фразы свяжутся с исходным словом')}
      onClose={onClose}
      destroyOnHidden
      actions={(
        <>
          <Button onClick={onClose}>{t('Отмена')}</Button>
          <Button
            type="primary"
            loading={isSaving}
            disabled={selectedKeys.length === 0}
            onClick={handleSave}
          >
            <BlueprintMarks />
            {t('Добавить {{count}} фраз', { count: selectedKeys.length })}
          </Button>
        </>
      )}
    >
      <div className={cls.content}>
        <AiQuotaNotice />
        <div className={cls.picker}>
          <Select
            className={cls.select}
            variant="borderless"
            mode="multiple"
            value={sourceUuids}
            onChange={setSourceUuids}
            options={wordOptions}
            maxCount={MAX_SOURCE_WORDS}
            placeholder={t('Слова')}
            optionFilterProp="label"
            tagRender={renderChip}
            suffixIcon={null}
          />
          <span className={cls.hint}>
            {t('ещё до {{count}} слов', { count: MAX_SOURCE_WORDS - sourceUuids.length })}
          </span>
          <Tooltip title={noCredits ? t('Лимит обновится завтра') : undefined}>
            <Button
              className={cls.generate}
              loading={isGenerating}
              disabled={noCredits || sourceUuids.length === 0}
              onClick={handleGenerate}
            >
              {rows ? t('Подобрать ещё') : t('Подобрать фразы')}
            </Button>
          </Tooltip>
        </div>

        {!rows && (
          <span className={cls.hint}>
            {t('Выберите до {{count}} слов — к каждому подберём 2-3 частотные фразы', {
              count: MAX_SOURCE_WORDS,
            })}
          </span>
        )}

        {groups.map((group) => (
          <div key={group[0].sourceUuid} className={cls.group}>
            <span className={cls.groupTitle}>{group[0].sourceTerm}</span>
            {group.map((row) => (
              <div key={row.key} className={cls.row}>
                <CheckSquare
                  checked={selected.has(row.key)}
                  label={row.term}
                  onChange={(checked) => toggleRow(row.key, checked)}
                />
                <Input
                  variant="borderless"
                  className={classNames(cls.cell, [cls.phrase])}
                  value={row.term}
                  onChange={(e) => setRowField(row.key, 'term', e.target.value)}
                />
                <Input
                  variant="borderless"
                  className={cls.cell}
                  value={row.translation}
                  onChange={(e) => setRowField(row.key, 'translation', e.target.value)}
                />
                <Input
                  variant="borderless"
                  className={classNames(cls.cell, [cls.example])}
                  value={row.example}
                  onChange={(e) => setRowField(row.key, 'example', e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </ModalFrame>
  );
};
