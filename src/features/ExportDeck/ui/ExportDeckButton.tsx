import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, MenuProps } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { Card, useGetCardsQuery } from '@/entities/Card';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import {
  exportCardsToExcel,
  exportCardsToJson,
  exportCardsToMarkdown,
} from '../model/cardsExport';

interface ExportDeckButtonProps {
  deckUuid: string;
  deckName: string;
}

type ExportFormat = 'excel' | 'json' | 'markdown';

const EXPORTERS: Record<ExportFormat, (cards: Card[], deckName: string) => Promise<void>> = {
  excel: exportCardsToExcel,
  json: exportCardsToJson,
  markdown: exportCardsToMarkdown,
};

export const ExportDeckButton: FC<ExportDeckButtonProps> = (props) => {
  const { deckUuid, deckName } = props;
  const { t } = useTranslation();
  const { message } = useAntdApp();
  const { data: cards, isLoading } = useGetCardsQuery(deckUuid);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (!cards?.length) {
      message.warning(t('В колоде нет слов для экспорта'));
      return;
    }
    setExporting(true);
    try {
      await EXPORTERS[format](cards, deckName);
      message.success(t('Колода выгружена'));
    } catch {
      message.error(t('Не удалось выгрузить колоду'));
    } finally {
      setExporting(false);
    }
  };

  const items: MenuProps['items'] = [
    { key: 'excel', label: t('Excel') },
    { key: 'json', label: t('JSON') },
    { key: 'markdown', label: t('Markdown') },
  ];

  return (
    <Dropdown
      trigger={['click']}
      menu={{ items, onClick: ({ key }) => handleExport(key as ExportFormat) }}
      disabled={isLoading || !cards?.length}
    >
      <Button icon={<ExportOutlined />} loading={exporting}>
        {t('Экспорт')}
      </Button>
    </Dropdown>
  );
};
