import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CycleStudyMode,
  buildNewWords,
  buildReviewWords,
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

  const sessionWords = useMemo(() => {
    if (!cycle || !words) return [];
    return mode === 'new' ? buildNewWords(cycle, words) : buildReviewWords(cycle, words);
  }, [cycle, words, mode]);
  // «Повторить трудные» запускает сессию по части слов
  const { cards: filteredWords, sessionKey } = useSessionCardFilter(sessionWords);

  if (!cycleId) return null;

  const modeTitle = mode === 'new' ? t('Новые слова') : t('Повтор цикла');
  const exit = () => navigate(RoutePath.CYCLE(cycleId));

  if (!isSynced) return <PageLoader />;

  return (
    <CycleSession
      // Свой экземпляр сессии на режим: при переходе «новые → повтор» состояние не переносится.
      key={`${mode}:${sessionKey}`}
      words={filteredWords ?? sessionWords}
      storageKey={getCycleSessionKey(cycleId, mode)}
      title={cycle ? `${cycle.name} · ${modeTitle}` : modeTitle}
      onExit={exit}
      renderResult={(summary, restart) => (
        <SessionResult
          summary={summary}
          words={filteredWords ?? sessionWords}
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
