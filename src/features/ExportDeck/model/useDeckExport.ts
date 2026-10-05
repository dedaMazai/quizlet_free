import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, useGetCardsQuery } from '@/entities/Card';
import { useToast } from '@/shared/lib/toast';
import {
  exportCardsToExcel,
  exportCardsToJson,
  exportCardsToMarkdown,
} from './cardsExport';

export type ExportFormat = 'excel' | 'json' | 'markdown';

const EXPORTERS: Record<ExportFormat, (cards: Card[], deckName: string) => Promise<void>> = {
  excel: exportCardsToExcel,
  json: exportCardsToJson,
  markdown: exportCardsToMarkdown,
};

interface UseDeckExport {
  exportDeck: (format: ExportFormat) => Promise<void>;
  exporting: boolean;
  /** true, пока карточки грузятся или колода пуста — экспортировать нечего. */
  disabled: boolean;
}

/** Загружает карточки колоды и выгружает их в выбранный формат с нотификациями. */
export const useDeckExport = (deckUuid: string, deckName: string): UseDeckExport => {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: cards, isLoading } = useGetCardsQuery(deckUuid);
  const [exporting, setExporting] = useState(false);

  const exportDeck = async (format: ExportFormat) => {
    if (!cards?.length) {
      toast.warning(t('В колоде нет слов для экспорта'));
      return;
    }
    setExporting(true);
    try {
      await EXPORTERS[format](cards, deckName);
      toast.success(t('Колода выгружена'));
    } catch {
      toast.error(t('Не удалось выгрузить колоду'));
    } finally {
      setExporting(false);
    }
  };

  return { exportDeck, exporting, disabled: isLoading || !cards?.length };
};
