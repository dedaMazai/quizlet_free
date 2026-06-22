import {
  FC, useMemo, useState, useEffect, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Modal, Table, Tag, Input,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';
import { RobotOutlined } from '@ant-design/icons';
import { useGetCardsQuery, useUpdateCardsBulkMutation } from '@/entities/Card';
import { VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useCheckTranslationsMutation, useGetAiUsageQuery } from '../model/api/aiCheckApi';
import { AiCheckResult } from '../model/types/aiCheck';

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
  const { message } = useAntdApp();

  const [results, setResults] = useState<AiCheckResult[] | null>(null);
  const [edits, setEdits] = useState<Record<string, EditValue>>({});
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const { data: cards } = useGetCardsQuery(deckUuid, { skip: !open });
  const { data: remaining } = useGetAiUsageQuery(undefined, { skip: !open });
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

  const noCredits = remaining !== undefined && remaining <= 0;
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
      message.success(t('Переводы проверены'));
    } catch (err) {
      const code = (err as { error?: string })?.error;
      if (code === 'AI_LIMIT_EXCEEDED') {
        message.error(t('Лимит запросов к ИИ исчерпан'));
      } else {
        message.error(t('Не удалось проверить переводы'));
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
      message.success(t('Изменения применены'));
      onClose();
    } catch {
      message.error(t('Не удалось применить изменения'));
    }
  };

  const columns: ColumnsType<ResultRow> = [
    {
      title: t('Слово'),
      dataIndex: 'term',
      key: 'term',
      width: 160,
    },
    {
      title: t('Текущий перевод'),
      key: 'current',
      width: 180,
      render: (_, row) => (row.translation_ok
        ? <MyTypography.Base type="secondary">{row.current}</MyTypography.Base>
        : (
          <VStack gap="2">
            <MyTypography.Base type="secondary">{row.current}</MyTypography.Base>
            <Tag color="warning">{t('Требует правки')}</Tag>
          </VStack>
        )),
    },
    {
      title: t('Новый перевод'),
      key: 'translation',
      width: 220,
      render: (_, row) => (
        <Input
          value={edits[row.uuid]?.translation ?? ''}
          onChange={(e) => setEditField(row.uuid, 'translation', e.target.value)}
        />
      ),
    },
    {
      title: t('Пример'),
      key: 'example',
      render: (_, row) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          value={edits[row.uuid]?.example ?? ''}
          onChange={(e) => setEditField(row.uuid, 'example', e.target.value)}
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={t('Проверка переводов ИИ')}
      footer={null}
      onCancel={onClose}
      width={results ? 1000 : 520}
      destroyOnClose
    >
      <VStack max gap="16">
        <MyTypography.Base type="secondary">
          {t('Осталось запросов: {{count}}', { count: remaining ?? 0 })}
        </MyTypography.Base>

        {!results && (
          <Button
            type="primary"
            icon={<RobotOutlined />}
            loading={isChecking}
            disabled={noCredits || !hasCards}
            onClick={handleCheck}
          >
            {t('Проверить через ИИ')}
          </Button>
        )}

        {results && (
          <>
            <Table<ResultRow>
              size="small"
              rowKey="uuid"
              columns={columns}
              dataSource={rows}
              scroll={{ y: 440 }}
              pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: [20, 50, 100] }}
              rowSelection={{
                selectedRowKeys: selectedKeys,
                onChange: setSelectedKeys,
                preserveSelectedRowKeys: true,
              }}
            />
            <Button
              type="primary"
              loading={isApplying}
              disabled={selectedKeys.length === 0}
              onClick={handleApply}
            >
              {t('Применить выбранные')}
            </Button>
          </>
        )}
      </VStack>
    </Modal>
  );
};
