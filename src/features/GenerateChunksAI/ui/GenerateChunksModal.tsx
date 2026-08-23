import {
  FC, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Modal, Select, Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';
import { RobotOutlined } from '@ant-design/icons';
import {
  AiChunk,
  useGenerateChunksMutation,
  useGetAiUsageQuery,
  useGetCardsQuery,
  useCreateCardsMutation,
} from '@/entities/Card';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import cls from './GenerateChunksModal.module.scss';

/** Столько же, сколько принимает Edge Function: один кредит — до 10 слов. */
const MAX_SOURCE_WORDS = 10;

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
  const { message } = useAntdApp();

  const [sourceUuids, setSourceUuids] = useState<string[]>([]);
  const [rows, setRows] = useState<ChunkRow[] | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const { data: cards } = useGetCardsQuery(deckUuid, { skip: !open });
  const { data: remaining } = useGetAiUsageQuery(undefined, { skip: !open });
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

  const noCredits = remaining !== undefined && remaining <= 0;

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
      message.success(t('Фразы подобраны'));
    } catch (err) {
      const code = (err as { error?: string })?.error;
      if (code === 'AI_LIMIT_EXCEEDED') {
        message.error(t('Лимит запросов к ИИ исчерпан'));
      } else {
        message.error(t('Не удалось подобрать фразы'));
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
      message.success(t('Фразы добавлены'));
      onClose();
    } catch {
      message.error(t('Не удалось добавить фразы'));
    }
  };

  const columns: ColumnsType<ChunkRow> = [
    {
      title: t('Слово'),
      dataIndex: 'sourceTerm',
      key: 'sourceTerm',
      width: 140,
      render: (value: string) => <MyTypography.Base type="secondary">{value}</MyTypography.Base>,
    },
    {
      title: t('Фраза'),
      key: 'term',
      width: 220,
      render: (_, row) => (
        <Input
          value={row.term}
          onChange={(e) => setRowField(row.key, 'term', e.target.value)}
        />
      ),
    },
    {
      title: t('Перевод'),
      key: 'translation',
      width: 220,
      render: (_, row) => (
        <Input
          value={row.translation}
          onChange={(e) => setRowField(row.key, 'translation', e.target.value)}
        />
      ),
    },
    {
      title: t('Пример'),
      key: 'example',
      render: (_, row) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={row.example}
          onChange={(e) => setRowField(row.key, 'example', e.target.value)}
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={t('Сгенерировать фразы (ИИ)')}
      footer={null}
      onCancel={onClose}
      width={rows ? 1000 : 560}
      destroyOnClose
    >
      <VStack max gap="16">
        <MyTypography.Base type="secondary">
          {t('Осталось запросов: {{count}}', { count: remaining ?? 0 })}
        </MyTypography.Base>

        {!rows && (
          <>
            <MyTypography.Small type="secondary">
              {t('Выберите до {{count}} слов — к каждому подберём 2-3 частотные фразы', {
                count: MAX_SOURCE_WORDS,
              })}
            </MyTypography.Small>
            <Select
              className={cls.fullWidth}
              mode="multiple"
              value={sourceUuids}
              onChange={setSourceUuids}
              options={wordOptions}
              maxCount={MAX_SOURCE_WORDS}
              placeholder={t('Слова')}
              optionFilterProp="label"
              allowClear
            />
            <Button
              type="primary"
              icon={<RobotOutlined />}
              loading={isGenerating}
              disabled={noCredits || sourceUuids.length === 0}
              onClick={handleGenerate}
            >
              {t('Подобрать фразы')}
            </Button>
          </>
        )}

        {rows && (
          <>
            <Table<ChunkRow>
              className={cls.fullWidth}
              size="small"
              rowKey="key"
              columns={columns}
              dataSource={rows}
              scroll={{ y: 440 }}
              pagination={false}
              rowSelection={{
                selectedRowKeys: selectedKeys,
                onChange: setSelectedKeys,
                preserveSelectedRowKeys: true,
              }}
            />
            <Button
              type="primary"
              loading={isSaving}
              disabled={selectedKeys.length === 0}
              onClick={handleSave}
            >
              {t('Добавить выбранные')}
            </Button>
          </>
        )}
      </VStack>
    </Modal>
  );
};
