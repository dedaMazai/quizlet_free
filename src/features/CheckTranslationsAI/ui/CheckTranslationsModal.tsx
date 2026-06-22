import {
  FC, useMemo, useState, useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Modal, Table, Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';
import { RobotOutlined } from '@ant-design/icons';
import { useGetCardsQuery, useUpdateCardMutation } from '@/entities/Card';
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

// Строка таблицы результатов: ответ ИИ, дополненный текущими данными карточки.
interface ResultRow extends AiCheckResult {
  term: string;
  current: string;
}

export const CheckTranslationsModal: FC<CheckTranslationsModalProps> = (props) => {
  const { open, deckUuid, onClose } = props;
  const { t } = useTranslation();
  const { message } = useAntdApp();

  const [results, setResults] = useState<AiCheckResult[] | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [applying, setApplying] = useState(false);

  const { data: cards } = useGetCardsQuery(deckUuid, { skip: !open });
  const { data: remaining } = useGetAiUsageQuery(undefined, { skip: !open });
  const [checkTranslations, { isLoading: isChecking }] = useCheckTranslationsMutation();
  const [updateCard] = useUpdateCardMutation();

  // Сбрасываем результаты при каждом открытии модалки.
  useEffect(() => {
    if (open) {
      setResults(null);
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

  const handleCheck = async () => {
    if (!cards?.length) return;
    try {
      const input = cards.map((c) => ({ uuid: c.uuid, term: c.term, translation: c.translation }));
      const data = await checkTranslations(input).unwrap();
      setResults(data);
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
    const toApply = rows.filter((r) => selected.has(r.uuid));
    if (toApply.length === 0) return;
    setApplying(true);
    try {
      await Promise.all(
        toApply.map((r) =>
          updateCard({
            uuid: r.uuid,
            term: r.term,
            translation: !r.translation_ok && r.suggested_translation
              ? r.suggested_translation
              : r.current,
            example: r.example,
          }).unwrap()),
      );
      message.success(t('Изменения применены'));
      onClose();
    } catch {
      message.error(t('Не удалось применить изменения'));
    } finally {
      setApplying(false);
    }
  };

  const columns: ColumnsType<ResultRow> = [
    {
      title: t('Слово'),
      dataIndex: 'term',
      key: 'term',
    },
    {
      title: t('Текущий перевод'),
      dataIndex: 'current',
      key: 'current',
    },
    {
      title: t('Предложение ИИ'),
      key: 'suggestion',
      render: (_, row) => (row.translation_ok
        ? <Tag color="success">{t('Корректно')}</Tag>
        : <MyTypography.Base>{row.suggested_translation ?? '—'}</MyTypography.Base>),
    },
    {
      title: t('Пример'),
      dataIndex: 'example',
      key: 'example',
    },
  ];

  return (
    <Modal
      open={open}
      title={t('Проверка переводов ИИ')}
      footer={null}
      onCancel={onClose}
      width={results ? 900 : 520}
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
              pagination={false}
              scroll={{ y: 420 }}
              rowSelection={{
                selectedRowKeys: selectedKeys,
                onChange: setSelectedKeys,
              }}
            />
            <Button
              type="primary"
              loading={applying}
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
