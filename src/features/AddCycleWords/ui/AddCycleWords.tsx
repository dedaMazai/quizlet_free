import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, InputRef } from 'antd';
import { Import, Plus } from 'lucide-react';
import { CycleWord, useAddCycleWordsMutation } from '@/entities/LearningCycle';
import { BlueprintMarks } from '@/shared/ui/Blueprint';
import { HStack } from '@/shared/ui/Stack';
import { useToast } from '@/shared/lib/toast';
import { ImportCycleWordsModal } from './ImportCycleWordsModal';
import cls from './AddCycleWords.module.scss';

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

interface AddCycleWordsProps {
  cycleUuid: string;
  /** Текущие слова цикла — чтобы при импорте отметить уже добавленные. */
  words: CycleWord[];
}

/** Быстрое добавление слова в конец цикла, как запись в тетрадь, и импорт из колод. */
export const AddCycleWords: FC<AddCycleWordsProps> = (props) => {
  const { cycleUuid, words } = props;
  const { t } = useTranslation();
  const toast = useToast();
  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const termRef = useRef<InputRef>(null);
  const translationRef = useRef<InputRef>(null);

  const [addWords] = useAddCycleWordsMutation();
  // Слова отправляются строго по очереди: позиция считается от последнего слова,
  // и параллельные вставки получили бы одинаковые позиции.
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const submit = () => {
    const word = { term: term.trim(), translation: translation.trim() };
    if (!word.term) {
      termRef.current?.focus();
      return;
    }
    if (!word.translation) {
      translationRef.current?.focus();
      return;
    }
    // Поля очищаются сразу — можно записывать следующее слово, не дожидаясь сервера.
    setTerm('');
    setTranslation('');
    termRef.current?.focus();
    queueRef.current = queueRef.current
      .then(() => addWords({ cycleUuid, words: [word] }).unwrap())
      .catch(() => {
        toast.error(t('Не удалось добавить слово «{{term}}»', { term: word.term }));
      });
  };

  return (
    <HStack max gap="8" wrap className={cls.form}>
      <Input
        ref={termRef}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onPressEnter={() => translationRef.current?.focus()}
        placeholder={t('Слово на английском')}
        autoComplete="off"
        className={cls.field}
      />
      <Input
        ref={translationRef}
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
        onPressEnter={submit}
        placeholder={t('Перевод')}
        autoComplete="off"
        className={cls.field}
      />
      <Button
        type="primary"
        icon={<Plus aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        onClick={submit}
      >
        <BlueprintMarks />
        {t('Добавить')}
      </Button>
      <Button
        icon={<Import aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        onClick={() => setImportOpen(true)}
      >
        {t('Импорт из колод')}
      </Button>
      <ImportCycleWordsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        cycleUuid={cycleUuid}
        words={words}
      />
    </HStack>
  );
};
