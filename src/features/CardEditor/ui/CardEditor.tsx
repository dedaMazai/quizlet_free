import {
  FC, useCallback, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Input, Modal, Spin,
} from 'antd';
import type { InputRef } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { CardCreateDto, useCreateCardsMutation } from '@/entities/Card';
import { SpeakButton } from '@/shared/ui/SpeakButton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useAntdApp } from '@/shared/lib/hooks/useAntdApp';
import { useMatchMedia } from '@/shared/lib/hooks/useMatchMedia';
import { useAutoTranslate } from '../model/useAutoTranslate';
import cls from './CardEditor.module.scss';

interface CardRow {
  id: string;
  term: string;
  translation: string;
  example: string;
  /** true, когда пользователь сам отредактировал перевод — тогда автоперевод его больше не перезаписывает. */
  translationEdited: boolean;
}

interface CardEditorProps {
  open: boolean;
  onClose: () => void;
  deckUuid: string;
}

const makeEmptyRow = (): CardRow => ({
  id: crypto.randomUUID(),
  term: '',
  translation: '',
  example: '',
  translationEdited: false,
});

const makeInitialRows = (): CardRow[] => [makeEmptyRow(), makeEmptyRow(), makeEmptyRow()];

export const CardEditor: FC<CardEditorProps> = (props) => {
  const { open, onClose, deckUuid } = props;
  const { t } = useTranslation();
  const { message } = useAntdApp();
  const { isMobile } = useMatchMedia();

  const [rows, setRows] = useState<CardRow[]>(makeInitialRows);
  const [createCards, { isLoading }] = useCreateCardsMutation();

  const termRefs = useRef<Map<string, InputRef>>(new Map());
  const focusIdRef = useRef<string | null>(null);

  // Сброс редактора при каждом открытии.
  useEffect(() => {
    if (open) {
      setRows(makeInitialRows());
    }
  }, [open]);

  // Фокус на только что добавленной строке.
  useEffect(() => {
    if (focusIdRef.current) {
      termRefs.current.get(focusIdRef.current)?.focus();
      focusIdRef.current = null;
    }
  }, [rows]);

  // Подставляем автоперевод, пока пользователь сам не отредактировал перевод и
  // пока термин не успел измениться (отбрасываем устаревший ответ).
  const handleTranslationResult = useCallback((id: string, translation: string, term: string) => {
    setRows((prev) => prev.map((row) => (
      row.id === id && !row.translationEdited && row.term.trim() === term
        ? { ...row, translation }
        : row
    )));
  }, []);

  const { translatingIds, requestTranslation } = useAutoTranslate(handleTranslationResult);

  const updateRow = useCallback((id: string, field: keyof CardRow, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }, []);

  const handleTermChange = useCallback((id: string, value: string) => {
    updateRow(id, 'term', value);
    requestTranslation(id, value);
  }, [updateRow, requestTranslation]);

  const handleTranslationChange = useCallback((id: string, value: string) => {
    setRows((prev) => prev.map((row) => (
      row.id === id ? { ...row, translation: value, translationEdited: true } : row
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
      message.warning(t('Заполните хотя бы одно слово'));
      return;
    }

    try {
      await createCards(dtos).unwrap();
      message.success(t('Добавлено слов: {{count}}', { count: dtos.length }));
      onClose();
    } catch {
      message.error(t('Не удалось сохранить слова'));
    }
  };

  return (
    <Modal
      open={open}
      width={isMobile ? 'calc(100vw - 24px)' : 760}
      title={t('Добавить слова')}
      okText={t('Сохранить все')}
      cancelText={t('Отмена')}
      confirmLoading={isLoading}
      onOk={handleSubmit}
      onCancel={onClose}
    >
      <VStack max gap={isMobile ? '12' : '8'}>
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
              className={cls.grow}
              value={row.term}
              placeholder={t('Слово')}
              onChange={(e) => handleTermChange(row.id, e.target.value)}
              onPressEnter={addRow}
              suffix={row.term.trim() ? <SpeakButton text={row.term} /> : <span />}
            />
          );
          const translationInput = (
            <Input
              className={cls.grow}
              value={row.translation}
              placeholder={t('Перевод')}
              onChange={(e) => handleTranslationChange(row.id, e.target.value)}
              onPressEnter={addRow}
              suffix={translatingIds.has(row.id) ? <Spin size="small" /> : <span />}
            />
          );
          const exampleInput = (
            <Input
              className={cls.grow}
              value={row.example}
              placeholder={t('Пример')}
              onChange={(e) => updateRow(row.id, 'example', e.target.value)}
              onPressEnter={addRow}
            />
          );
          const deleteButton = (
            <Button
              type="text"
              danger
              aria-label={t('Удалить строку')}
              icon={<DeleteOutlined />}
              onClick={() => removeRow(row.id)}
            />
          );

          if (isMobile) {
            return (
              <VStack key={row.id} max gap="8" align="start" className={cls.cardRow}>
                <HStack max justify="between" align="center">
                  <span className={cls.indexBadge}>{index + 1}</span>
                  {deleteButton}
                </HStack>
                {termInput}
                {translationInput}
                {exampleInput}
              </VStack>
            );
          }

          return (
            <HStack key={row.id} max gap="8" align="center" className={cls.row}>
              <span className={cls.index}>{index + 1}</span>
              {termInput}
              {translationInput}
              {exampleInput}
              {deleteButton}
            </HStack>
          );
        })}

        <Button type="dashed" icon={<PlusOutlined />} onClick={addRow} block>
          {t('Добавить строку')}
        </Button>
      </VStack>
    </Modal>
  );
};
