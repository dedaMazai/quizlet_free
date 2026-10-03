import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Popconfirm, Tag, Tooltip, Typography,
} from 'antd';
import {
  DeleteOutlined, FlagFilled, FlagOutlined, HolderOutlined, StarFilled, StarOutlined,
} from '@ant-design/icons';
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
import { HStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './CycleWordList.module.scss';

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

  // Обычное открытое слово без тега — помечаем только отличия, чтобы список не пестрил.
  const statusTags: Record<CycleWordStatus, { color?: string; label: string } | null> = {
    today: { color: 'blue', label: t('Сегодня') },
    unlocked: null,
    skipped: { label: t('Пропускается') },
    locked: { label: t('В очереди') },
  };
  const statusTag = statusTags[status];

  return (
    <div
      ref={setNodeRef}
      // Позиция перетаскиваемой строки считается dnd-kit на лету — только инлайн.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={classNames(cls.row, {
        [cls.dragging]: isDragging,
        [cls.locked]: status === 'locked',
        [cls.skipped]: status === 'skipped',
        [cls.startPoint]: isStartPoint,
      })}
    >
      <Button
        ref={setActivatorNodeRef}
        type="text"
        size="small"
        icon={<HolderOutlined />}
        className={cls.handle}
        aria-label={t('Перетащить')}
        {...attributes}
        {...listeners}
      />
      <span className={cls.index}>{index + 1}</span>
      <Typography.Text strong editable={{ onChange: (value) => onEdit(word, 'term', value) }}>
        {word.term}
      </Typography.Text>
      <Typography.Text
        className={cls.translation}
        editable={{ onChange: (value) => onEdit(word, 'translation', value) }}
      >
        {word.translation}
      </Typography.Text>
      <span className={cls.status}>
        {statusTag && <Tag color={statusTag.color}>{statusTag.label}</Tag>}
      </span>
      <HStack gap="2" className={cls.actions}>
        <Tooltip title={word.is_important ? t('Убрать из важных') : t('Пометить важным')}>
          <Button
            type="text"
            size="small"
            icon={word.is_important ? <StarFilled className={cls.important} /> : <StarOutlined />}
            onClick={() => onToggleImportant(word)}
          />
        </Tooltip>
        <Tooltip title={isStartPoint ? t('Точка старта повтора') : t('Начинать повтор с этого слова')}>
          <Button
            type="text"
            size="small"
            icon={isStartPoint ? <FlagFilled /> : <FlagOutlined />}
            onClick={() => onSetStart(word)}
          />
        </Tooltip>
        <Popconfirm
          title={t('Удалить слово?')}
          okText={t('Удалить')}
          cancelText={t('Отмена')}
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(word)}
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </HStack>
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
