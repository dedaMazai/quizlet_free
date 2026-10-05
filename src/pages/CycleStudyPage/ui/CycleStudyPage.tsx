import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CycleStudyMode,
  addLearnedToday,
  buildNewWords,
  buildReviewWords,
  getLearnedToday,
  getToday,
  useCyclePortionSync,
  useGetCycleQuery,
  useGetCycleWordsQuery,
} from '@/entities/LearningCycle';
import { CycleSession, getCycleSessionKey } from '@/features/CycleSession';
import { PageLoader } from '@/widgets/PageLoader';
import { SessionResult } from '@/widgets/SessionResult';
import { RoutePath } from '@/shared/config/router/routePath';
import { useSessionCardFilter } from '@/shared/lib/session';

const CycleStudyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cycleId, mode: modeParam } = useParams();
  const mode: CycleStudyMode = modeParam === 'new' ? 'new' : 'review';

  const { data: cycle } = useGetCycleQuery(cycleId!, { skip: !cycleId });
  const { data: words } = useGetCycleWordsQuery(cycleId!, { skip: !cycleId });
  // Сессию строим только по актуальной порции: иначе в новый день она соберётся из вчерашней.
  const isSynced = useCyclePortionSync(cycle, words);
  // Снимок на старте: отметка «выучено» в конце сессии не должна менять её состав
  const [learned] = useState(() => (cycleId ? getLearnedToday(cycleId, getToday()) : new Set<string>()));

  const sessionWords = useMemo(() => {
    if (!cycle || !words) return [];
    if (mode === 'review') return buildReviewWords(cycle, words);
    // «Учить новые» — то, что сегодня ещё не выучено; всё выучено — снова вся порция
    const newWords = buildNewWords(cycle, words);
    const rest = newWords.filter((word) => !learned.has(word.uuid));
    return rest.length ? rest : newWords;
  }, [cycle, words, mode, learned]);
  // «Повторить трудные» запускает сессию по части слов
  const { cards: filteredWords, sessionKey } = useSessionCardFilter(sessionWords);

  if (!cycleId) return null;

  const modeTitle = mode === 'new' ? t('Новые слова') : t('Повтор цикла');
  const exit = () => navigate(RoutePath.CYCLE(cycleId));
  const sessionList = filteredWords ?? sessionWords;
  const handleFinish = mode === 'new'
    ? () => addLearnedToday(cycleId, getToday(), sessionList.map((word) => word.uuid))
    : undefined;

  if (!isSynced) return <PageLoader />;

  return (
    <CycleSession
      // Свой экземпляр сессии на режим: при переходе «новые → повтор» состояние не переносится.
      key={`${mode}:${sessionKey}`}
      words={sessionList}
      storageKey={getCycleSessionKey(cycleId, mode)}
      title={cycle ? `${cycle.name} · ${modeTitle}` : modeTitle}
      onExit={exit}
      onFinish={handleFinish}
      renderResult={(summary, restart) => (
        <SessionResult
          summary={summary}
          words={sessionList}
          onRestart={restart}
          primaryAction={mode === 'new' ? {
            label: t('Повторить весь цикл'),
            onClick: () => navigate(RoutePath.CYCLE_STUDY(cycleId, 'review')),
          } : undefined}
        />
      )}
    />
  );
};

export default CycleStudyPage;
