import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Popconfirm, Tooltip, Typography,
} from 'antd';
import {
  Menu, Play, Star, Trash2,
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CycleWord,
  CycleWordStatus,
  LearningCycle,
  getStartIndex,
  getWordStatus,
  useDeleteCycleWordMutation,
  useReorderCycleWordsMutation,
  useUpdateCycleMutation,
  useUpdateCycleWordMutation,
} from '@/entities/LearningCycle';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './CycleWordList.module.scss';

const ICON_SIZE = 14;
const STAR_SIZE = 16;
const ICON_STROKE = 1.5;
/** Номер слова — двумя цифрами: «01» */
const INDEX_DIGITS = 2;

const ROW_CLASSES: Record<CycleWordStatus, string | undefined> = {
  today: cls.today,
  unlocked: undefined,
  skipped: cls.skipped,
  locked: cls.locked,
};

const TAG_CLASSES: Record<CycleWordStatus, string> = {
  today: cls.todayTag,
  unlocked: cls.unlockedTag,
  skipped: cls.skippedTag,
  locked: cls.lockedTag,
};

interface CycleWordListProps {
  cycle: LearningCycle;
  /** Слова в порядке цикла. */
  words: CycleWord[];
}

interface WordRowProps {
  word: CycleWord;
  index: number;
  status: CycleWordStatus;
  isStartPoint: boolean;
  onToggleImportant: (word: CycleWord) => void;
  onEdit: (word: CycleWord, field: 'term' | 'translation', value: string) => void;
  onSetStart: (word: CycleWord) => void;
  onDelete: (word: CycleWord) => void;
}

const WordRow = memo((props: WordRowProps) => {
  const {
    word, index, status, isStartPoint, onToggleImportant, onEdit, onSetStart, onDelete,
  } = props;
  const { t } = useTranslation();
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging,
  } = useSortable({ id: word.uuid });

  const statusLabels: Record<CycleWordStatus, string> = {
    today: t('Сегодня'),
    unlocked: t('В повторе'),
    skipped: t('Пропуск'),
    locked: t('В очереди'),
  };

  return (
    <div
      ref={setNodeRef}
      // Позиция перетаскиваемой строки считается dnd-kit на лету — только инлайн.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={classNames(cls.row, [ROW_CLASSES[status]], { [cls.dragging]: isDragging })}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className={cls.handle}
        aria-label={t('Перетащить')}
        {...attributes}
        {...listeners}
      >
        <Menu aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </button>
      <span className={cls.index}>{String(index + 1).padStart(INDEX_DIGITS, '0')}</span>
      <Typography.Text
        className={cls.term}
        ellipsis
        editable={{ triggerType: ['text'], onChange: (value) => onEdit(word, 'term', value) }}
      >
        {word.term}
      </Typography.Text>
      <Typography.Text
        className={cls.translation}
        ellipsis
        editable={{ triggerType: ['text'], onChange: (value) => onEdit(word, 'translation', value) }}
      >
        {word.translation}
      </Typography.Text>
      <span className={classNames(cls.tag, [TAG_CLASSES[status]])}>{statusLabels[status]}</span>
      <Tooltip title={word.is_important ? t('Убрать из важных') : t('Пометить важным')}>
        <button
          type="button"
          className={classNames(cls.iconButton, [], { [cls.important]: word.is_important })}
          aria-pressed={word.is_important}
          aria-label={t('Пометить важным')}
          onClick={() => onToggleImportant(word)}
        >
          <Star aria-hidden size={STAR_SIZE} strokeWidth={ICON_STROKE} />
        </button>
      </Tooltip>
      <Tooltip title={isStartPoint ? t('Точка старта повтора') : t('Начинать повтор с этого слова')}>
        <button
          type="button"
          className={classNames(cls.iconButton, [cls.startButton], { [cls.startPoint]: isStartPoint })}
          aria-pressed={isStartPoint}
          aria-label={t('Начинать повтор с этого слова')}
          onClick={() => onSetStart(word)}
        >
          <Play aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </button>
      </Tooltip>
      <Popconfirm
        title={t('Удалить слово?')}
        okText={t('Удалить')}
        cancelText={t('Отмена')}
        okButtonProps={{ danger: true }}
        onConfirm={() => onDelete(word)}
      >
        <Button
          type="text"
          size="small"
          danger
          className={cls.deleteButton}
          aria-label={t('Удалить')}
          icon={<Trash2 aria-hidden size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
        />
      </Popconfirm>
    </div>
  );
});

export const CycleWordList: FC<CycleWordListProps> = (props) => {
  const { cycle, words } = props;

  const [reorderWords] = useReorderCycleWordsMutation();
  const [updateWord] = useUpdateCycleWordMutation();
  const [deleteWord] = useDeleteCycleWordMutation();
  const [updateCycle] = useUpdateCycleMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const startIdx = getStartIndex(cycle, words);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = words.map((w) => w.uuid);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    reorderWords({ cycleUuid: cycle.uuid, wordUuids: arrayMove(ids, from, to) });
  };

  const handleToggleImportant = useCallback((word: CycleWord) => {
    updateWord({ uuid: word.uuid, cycleUuid: cycle.uuid, is_important: !word.is_important });
  }, [updateWord, cycle.uuid]);

  const handleEdit = useCallback((word: CycleWord, field: 'term' | 'translation', value: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === word[field]) return;
    updateWord({ uuid: word.uuid, cycleUuid: cycle.uuid, [field]: trimmed });
  }, [updateWord, cycle.uuid]);

  // Повторный клик по текущей точке старта снимает её — повтор снова с начала.
  const handleSetStart = useCallback((word: CycleWord) => {
    updateCycle({
      uuid: cycle.uuid,
      start_word_uuid: cycle.start_word_uuid === word.uuid ? null : word.uuid,
    });
  }, [updateCycle, cycle.uuid, cycle.start_word_uuid]);

  const handleDelete = useCallback((word: CycleWord) => {
    deleteWord({ uuid: word.uuid, cycleUuid: cycle.uuid });
  }, [deleteWord, cycle.uuid]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={words.map((w) => w.uuid)} strategy={verticalListSortingStrategy}>
        <div className={cls.list}>
          {words.map((word, index) => (
            <WordRow
              key={word.uuid}
              word={word}
              index={index}
              status={getWordStatus(cycle, word, index, startIdx)}
              isStartPoint={cycle.start_word_uuid === word.uuid}
              onToggleImportant={handleToggleImportant}
              onEdit={handleEdit}
              onSetStart={handleSetStart}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
