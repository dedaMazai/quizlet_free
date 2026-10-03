import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { ArrowLeftOutlined, SyncOutlined } from '@ant-design/icons';
import {
  CycleStudyMode,
  buildNewWords,
  buildReviewWords,
  useCyclePortionSync,
  useGetCycleQuery,
  useGetCycleWordsQuery,
} from '@/entities/LearningCycle';
import { CycleSession, getCycleSessionKey } from '@/features/CycleSession';
import { HStack, VStack } from '@/shared/ui/Stack';
import { MyTypography } from '@/shared/ui/MyTypography';
import { Loader } from '@/shared/ui/Loader';
import { RoutePath } from '@/shared/config/router/routePath';

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

  if (!cycleId) return null;

  return (
    <VStack max fullHeight gap="24">
      <HStack gap="8" align="center">
        <Button type="text" icon={<ArrowLeftOutlined />} aria-label={t('Назад')} onClick={() => navigate(RoutePath.CYCLE(cycleId))} />
        <MyTypography.Large strong>
          {mode === 'new' ? t('Новые слова') : t('Повтор цикла')}
          {cycle ? `: ${cycle.name}` : ''}
        </MyTypography.Large>
      </HStack>
      {isSynced ? (
        <CycleSession
          // Свой экземпляр сессии на режим: при переходе «новые → повтор» состояние не переносится.
          key={mode}
          words={sessionWords}
          storageKey={getCycleSessionKey(cycleId, mode)}
          finishedTitle={mode === 'new' ? t('Новые слова выучены!') : t('Цикл повторён!')}
          finishedActions={(
            <>
              {mode === 'new' && (
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={() => navigate(RoutePath.CYCLE_STUDY(cycleId, 'review'))}
                >
                  {t('Повторить весь цикл')}
                </Button>
              )}
              <Button
                type={mode === 'new' ? 'default' : 'primary'}
                onClick={() => navigate(RoutePath.CYCLE(cycleId))}
              >
                {t('К циклу')}
              </Button>
            </>
          )}
        />
      ) : <Loader />}
    </VStack>
  );
};

export default CycleStudyPage;
