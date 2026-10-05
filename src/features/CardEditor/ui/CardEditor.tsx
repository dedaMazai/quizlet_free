import {
  FC, useCallback, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  AutoComplete, Button, Input, Spin, Tooltip, Upload,
} from 'antd';
import type { InputRef, UploadProps } from 'antd';
import {
  Plus, Sparkles, Volume2, X,
} from 'lucide-react';
import {
  AiCheckInput,
  CardCreateDto,
  useCheckTranslationsMutation,
  useCreateCardsMutation,
  AiQuotaNotice,
  useAiQuota,
} from '@/entities/Card';
import { useGetDeckQuery } from '@/entities/Deck';
import { TranslationResult } from '@/shared/lib/translate';
import { classNames } from '@/shared/lib/classNames/classNames';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { ModalFrame } from '@/shared/ui/ModalFrame';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { VStack } from '@/shared/ui/Stack';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useToast } from '@/shared/lib/toast';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { useAutoTranslate } from '../model/useAutoTranslate';
import { downloadCardsTemplate, parseCardsFromExcel } from '../model/cardsExcel';
import cls from './CardEditor.module.scss';

/** Карточки сохраняются партиями — Supabase надёжно принимает такой размер insert. */
const IMPORT_CHUNK_SIZE = 500;

const chunk = <T, >(items: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

const MODAL_WIDTH = 920;
const TOOL_ICON_SIZE = 14;
const ROW_ICON_SIZE = 16;
const MOBILE_REMOVE_ICON_SIZE = 14;
const ICON_STROKE = 1.5;

const EXCEL_ACCEPT = '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

interface CardRow {
  id: string;
  term: string;
  translation: string;
  example: string;
  /** true, когда пользователь сам отредактировал перевод — тогда автоперевод его больше не перезаписывает. */
  translationEdited: boolean;
  /** Альтернативные варианты перевода от автопереводчика (для выпадающего списка). */
  alternatives: string[];
  /** true, когда перевод/пример строки подставил ИИ при проверке. */
  aiCorrected: boolean;
}

interface CardEditorProps {
  open: boolean;
  onClose: () => void;
  deckUuid: string;
  /** Сразу открыть выбор Excel-файла — для действия «Импорт» */
  openFilePicker?: boolean;
}

const makeEmptyRow = (): CardRow => ({
  id: crypto.randomUUID(),
  term: '',
  translation: '',
  example: '',
  translationEdited: false,
  alternatives: [],
  aiCorrected: false,
});

const makeInitialRows = (): CardRow[] => [makeEmptyRow(), makeEmptyRow(), makeEmptyRow()];

export const CardEditor: FC<CardEditorProps> = (props) => {
  const {
    open, onClose, deckUuid, openFilePicker,
  } = props;
  const { t } = useTranslation();
  const { modal } = useAntdApp();
  const toast = useToast();
  const { isMobile } = useMatchMedia();

  const [rows, setRows] = useState<CardRow[]>(makeInitialRows);
  // Строка, у которой сейчас открыт список вариантов перевода.
  const [openVariantsId, setOpenVariantsId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [createCards, { isLoading }] = useCreateCardsMutation();
  const [checkTranslations, { isLoading: isChecking }] = useCheckTranslationsMutation();
  const { remaining, isExhausted: noCredits, isUnlimited } = useAiQuota({ skip: !open });
  const { data: deck } = useGetDeckQuery(deckUuid, { skip: !open });

  const termRefs = useRef<Map<string, InputRef>>(new Map());
  const focusIdRef = useRef<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Сброс редактора при каждом открытии.
  useEffect(() => {
    if (open) {
      setRows(makeInitialRows());
    }
  }, [open]);

  // «Импорт»: окно выбора файла открываем сами — клик пользователя был только что,
  // браузер разрешает. Содержимое модалки монтируется после open — ждём кадр.
  useEffect(() => {
    if (!open || !openFilePicker) return undefined;
    const timer = setTimeout(() => {
      toolbarRef.current?.querySelector<HTMLInputElement>('input[type="file"]')?.click();
    });
    return () => clearTimeout(timer);
  }, [open, openFilePicker]);

  // Фокус на только что добавленной строке.
  useEffect(() => {
    if (focusIdRef.current) {
      termRefs.current.get(focusIdRef.current)?.focus();
      focusIdRef.current = null;
    }
  }, [rows]);

  // Подставляем лучший автоперевод и сохраняем альтернативы для выпадающего
  // списка — пока пользователь сам не отредактировал перевод и пока термин не
  // успел измениться (отбрасываем устаревший ответ).
  const handleTranslationResult = useCallback((id: string, result: TranslationResult, term: string) => {
    setRows((prev) => prev.map((row) => (
      row.id === id && !row.translationEdited && row.term.trim() === term
        ? { ...row, translation: result.best, alternatives: result.alternatives }
        : row
    )));
    // Сразу показываем выпадашку, если есть из чего выбрать.
    if (result.alternatives.length) {
      setOpenVariantsId(id);
    }
  }, []);

  const { translatingIds, requestTranslation } = useAutoTranslate(handleTranslationResult);

  const updateRow = useCallback((id: string, field: keyof CardRow, value: string) => {
    setRows((prev) => prev.map((row) => (
      row.id === id ? { ...row, [field]: value, aiCorrected: false } : row
    )));
  }, []);

  const handleTermChange = useCallback((id: string, value: string) => {
    // Сбрасываем устаревшие варианты прошлого термина и закрываем выпадашку.
    setRows((prev) => prev.map((row) => (
      row.id === id ? {
        ...row, term: value, alternatives: [], aiCorrected: false,
      } : row
    )));
    setOpenVariantsId((prev) => (prev === id ? null : prev));
    requestTranslation(id, value);
  }, [requestTranslation]);

  const handleTranslationChange = useCallback((id: string, value: string) => {
    setRows((prev) => prev.map((row) => (
      row.id === id ? {
        ...row, translation: value, translationEdited: true, aiCorrected: false,
      } : row
    )));
  }, []);

  const addRow = useCallback(() => {
    const row = makeEmptyRow();
    focusIdRef.current = row.id;
    setRows((prev) => [...prev, row]);
  }, []);

  const removeRow = useCallback((id: string) => {
    termRefs.current.delete(id);
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length ? next : [makeEmptyRow()];
    });
  }, []);

  const handleSubmit = async () => {
    const dtos: CardCreateDto[] = rows
      .filter((row) => row.term.trim() && row.translation.trim())
      .map((row) => ({
        deck_uuid: deckUuid,
        term: row.term.trim(),
        translation: row.translation.trim(),
        example: row.example.trim() || undefined,
      }));

    if (!dtos.length) {
      toast.warning(t('Заполните хотя бы одно слово'));
      return;
    }

    try {
      await createCards(dtos).unwrap();
      toast.success(t('Добавлено слов: {{count}}', { count: dtos.length }));
      onClose();
    } catch {
      toast.error(t('Не удалось сохранить слова'));
    }
  };

  const handleAiCheck = async () => {
    const input: AiCheckInput[] = rows
      .filter((row) => row.term.trim())
      .map((row) => ({
        uuid: row.id,
        term: row.term.trim(),
        translation: row.translation.trim(),
      }));

    if (!input.length) return;

    try {
      const data = await checkTranslations(input).unwrap();
      const byId = new Map(data.map((r) => [r.uuid, r]));
      setRows((prev) => prev.map((row) => {
        const result = byId.get(row.id);
        if (!result) return row;
        const translation = !result.translation_ok && result.suggested_translation
          ? result.suggested_translation
          : row.translation;
        return {
          ...row,
          translation,
          example: result.example,
          translationEdited: true,
          aiCorrected: true,
        };
      }));
      // Закрываем выпадашку вариантов — перевод подставлен ИИ.
      setOpenVariantsId(null);
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

  const handleDownloadTemplate = useCallback(() => {
    downloadCardsTemplate();
  }, []);

  const saveImported = useCallback(async (dtos: CardCreateDto[]) => {
    try {
      // Сохраняем партиями последовательно, чтобы не превысить лимиты insert.
      for (const part of chunk(dtos, IMPORT_CHUNK_SIZE)) {
        await createCards(part).unwrap();
      }
      toast.success(t('Добавлено слов: {{count}}', { count: dtos.length }));
      onClose();
    } catch {
      toast.error(t('Не удалось сохранить слова'));
    }
  }, [createCards, toast, onClose, t]);

  const handleImport = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const { rows: parsed, skipped } = await parseCardsFromExcel(file);

      if (!parsed.length) {
        toast.warning(t('В файле нет подходящих слов'));
        return;
      }

      const dtos: CardCreateDto[] = parsed.map((row) => ({
        deck_uuid: deckUuid,
        term: row.term,
        translation: row.translation,
        example: row.example,
      }));

      modal.confirm({
        title: t('Импортировать {{count}} слов?', { count: dtos.length }),
        content: (
          <VStack gap="4">
            <span>{t('Найдено слов: {{count}}', { count: dtos.length })}</span>
            {skipped > 0 && <span>{t('Пропущено строк: {{count}}', { count: skipped })}</span>}
          </VStack>
        ),
        okText: t('Сохранить все'),
        cancelText: t('Отмена'),
        onOk: () => saveImported(dtos),
      });
    } catch {
      toast.error(t('Не удалось прочитать файл'));
    } finally {
      setIsImporting(false);
    }
  }, [deckUuid, toast, modal, saveImported, t]);

  // beforeUpload возвращает false — отменяем штатную загрузку antd и парсим файл сами.
  const handleBeforeUpload = useCallback<NonNullable<UploadProps['beforeUpload']>>((file) => {
    handleImport(file);
    return false;
  }, [handleImport]);

  const filledCount = rows.filter((row) => row.term.trim()).length;
  const readyCount = rows.filter((row) => row.term.trim() && row.translation.trim()).length;
  // ИИ-проверка доступна, когда добавлено больше 3 слов.
  const canAiCheck = filledCount > 3;

  return (
    <ModalFrame
      open={open}
      width={MODAL_WIDTH}
      kicker={deck?.name}
      title={t('Добавить слова')}
      // На мобильном — только CTA, без подписи и «Отмены» (закрытие — крестик)
      footerNote={isMobile ? undefined : t('Перевод подставляется автоматически')}
      onClose={onClose}
      actions={(
        <>
          {!isMobile && <Button onClick={onClose}>{t('Отмена')}</Button>}
          <Button type="primary" loading={isLoading} onClick={handleSubmit}>
            <BlueprintMarks />
            {t('Сохранить {{count}} слов', { count: readyCount })}
          </Button>
        </>
      )}
    >
      <div ref={toolbarRef} className={cls.toolbar}>
        <Upload
          accept={EXCEL_ACCEPT}
          showUploadList={false}
          beforeUpload={handleBeforeUpload}
        >
          <Button className={cls.toolButton} loading={isImporting}>
            {t('Импорт из Excel')}
          </Button>
        </Upload>
        {/* Шаблона нет в мобильном макете 6.37 */}
        {!isMobile && (
          <Button
            type="link"
            className={classNames(cls.toolButton, [cls.ghost])}
            onClick={handleDownloadTemplate}
          >
            {t('Скачать шаблон')}
          </Button>
        )}
        {canAiCheck && (
          <Tooltip
            title={noCredits
              ? t('Лимит обновится завтра')
              : !isUnlimited && t('Осталось запросов: {{count}}', { count: remaining ?? 0 })}
          >
            <Button
              className={classNames(cls.toolButton, [cls.aiButton])}
              icon={<Sparkles aria-hidden size={TOOL_ICON_SIZE} strokeWidth={ICON_STROKE} />}
              loading={isChecking}
              disabled={noCredits}
              onClick={handleAiCheck}
            >
              {isMobile ? t('Проверить ИИ') : t('Проверить переводы ИИ')}
            </Button>
          </Tooltip>
        )}
      </div>
      {canAiCheck && <AiQuotaNotice className={cls.aiNotice} />}

      <div className={cls.table}>
        {!isMobile && (
          <div className={classNames(cls.grid, [cls.head])}>
            <span>#</span>
            <span>{t('Слово')}</span>
            <span>{t('Перевод · авто')}</span>
            <span>{t('Пример')}</span>
            <span />
            <span />
          </div>
        )}

        {rows.map((row, index) => {
          const termInput = (
            <Input
              ref={(el) => {
                if (el) {
                  termRefs.current.set(row.id, el);
                } else {
                  termRefs.current.delete(row.id);
                }
              }}
              className={cls.field}
              value={row.term}
              placeholder={t('Слово')}
              onChange={(e) => handleTermChange(row.id, e.target.value)}
              onPressEnter={addRow}
            />
          );
          const hasVariants = row.alternatives.length > 0;
          const translationSuffix = (() => {
            if (translatingIds.has(row.id)) {
              return <Spin size="small" />;
            }
            if (hasVariants) {
              return (
                <Tooltip title={t('Есть другие варианты перевода')}>
                  <button
                    type="button"
                    className={cls.variants}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenVariantsId((prev) => (prev === row.id ? null : row.id));
                    }}
                  >
                    {`+${row.alternatives.length}`}
                  </button>
                </Tooltip>
              );
            }
            if (row.aiCorrected) {
              return (
                <Tooltip title={t('Исправлено ИИ')}>
                  <Sparkles
                    aria-hidden
                    className={cls.aiHint}
                    size={TOOL_ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                  />
                </Tooltip>
              );
            }
            return <span />;
          })();
          // Перевод подставил автопереводчик, пользователь его не трогал
          const isAuto = Boolean(row.translation.trim()) && !row.translationEdited;
          const translationInput = (
            <AutoComplete
              className={classNames(cls.field, [], { [cls.auto]: isAuto })}
              value={row.translation}
              options={row.alternatives.map((variant) => ({ value: variant }))}
              filterOption={false}
              open={openVariantsId === row.id && hasVariants}
              onOpenChange={(visible) => {
                setOpenVariantsId(visible && hasVariants ? row.id : null);
              }}
              onChange={(value) => handleTranslationChange(row.id, value)}
            >
              <Input
                placeholder={t('Перевод')}
                onPressEnter={addRow}
                suffix={translationSuffix}
              />
            </AutoComplete>
          );
          const exampleInput = (
            <Input
              className={classNames(cls.field, [cls.example])}
              value={row.example}
              placeholder={t('Пример')}
              onChange={(e) => updateRow(row.id, 'example', e.target.value)}
              onPressEnter={addRow}
            />
          );
          const speakButton = row.term.trim()
            ? (
              <SpeakButton
                className={cls.iconButton}
                text={row.term}
                icon={<Volume2 aria-hidden size={ROW_ICON_SIZE} strokeWidth={ICON_STROKE} />}
              />
            )
            : <span />;
          const deleteButton = (
            <Button
              type="text"
              className={classNames(cls.iconButton, [cls.remove])}
              aria-label={t('Удалить строку')}
              icon={<X aria-hidden size={isMobile ? MOBILE_REMOVE_ICON_SIZE : ROW_ICON_SIZE} strokeWidth={ICON_STROKE} />}
              onClick={() => removeRow(row.id)}
            />
          );
          const number = String(index + 1).padStart(2, '0');

          // Mobile 6.37: номер и ×, слово и перевод (без примера и озвучки)
          if (isMobile) {
            return (
              <div key={row.id} className={cls.cardRow}>
                <div className={cls.cardRowHead}>
                  <span className={cls.index}>{number}</span>
                  {deleteButton}
                </div>
                {termInput}
                {translationInput}
              </div>
            );
          }

          return (
            <div key={row.id} className={classNames(cls.grid, [cls.row])}>
              <span className={cls.index}>{number}</span>
              {termInput}
              {translationInput}
              {exampleInput}
              {speakButton}
              {deleteButton}
            </div>
          );
        })}

        <div className={cls.addRow}>
          <Button
            type="link"
            className={classNames(cls.toolButton, [cls.ghost])}
            icon={<Plus aria-hidden size={TOOL_ICON_SIZE} strokeWidth={ICON_STROKE} />}
            onClick={addRow}
          >
            {t('Строка · Enter')}
          </Button>
        </div>
      </div>
    </ModalFrame>
  );
};
