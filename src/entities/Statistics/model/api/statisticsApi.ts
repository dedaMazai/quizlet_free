import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError, getCurrentUserId } from '@/shared/api/supabaseClient';
import {
  DeckAccuracy,
  DeckClozeStats,
  DueSummary,
  DueSummaryArgs,
  HeatmapDay,
  LogStudyEventsDto,
  MasteryStats,
  PeriodStats,
  ProgressSummary,
  ProgressSummaryArgs,
  StatsPeriod,
  StudyOverview,
} from '../types/statistics';

/** Длина периода в днях — окно get_progress_summary */
const PERIOD_DAYS: Record<StatsPeriod, number> = {
  [StatsPeriod.WEEK]: 7,
  [StatsPeriod.MONTH]: 30,
  [StatsPeriod.YEAR]: 365,
};

interface OverviewRow {
  total_answers: number;
  correct_answers: number;
  accuracy: number | null;
  total_duration_ms: number;
  current_streak: number;
  longest_streak: number;
}

interface DeckProgressRow {
  deck_key: string;
  deck_name: string | null;
  total_answers: number;
  correct_answers: number;
  accuracy: number;
}

interface MasteryRow {
  overall: { new: number; learning: number; mastered: number };
  per_deck: { deck_key: string; new: number; learning: number; mastered: number }[];
}

interface DueSummaryRow {
  forecast: { date: string; count: number }[];
  per_deck: { deck_id: string; due: number; new: number }[];
}

interface PeriodStatsRow {
  total_answers: number;
  correct_answers: number;
  total_duration_ms: number;
  sessions: number;
}

interface ProgressSummaryRow {
  current: PeriodStatsRow;
  previous: PeriodStatsRow;
}

const mapPeriodStats = (row: PeriodStatsRow): PeriodStats => ({
  totalAnswers: row.total_answers,
  correctAnswers: row.correct_answers,
  totalDurationMs: row.total_duration_ms,
  sessions: row.sessions,
});

interface ClozeStatsRow {
  deck_id: string;
  examples_count: number;
  last_cloze_at: string | null;
}

const statisticsApi = rtkApi.injectEndpoints({
  endpoints: (build) => ({
    logStudyEvents: build.mutation<void, LogStudyEventsDto>({
      queryFn: async ({ deckKey, deckName, events }) => {
        const userId = await getCurrentUserId();
        if (!userId) return supabaseError('Not authenticated');
        const rows = events.map((e) => ({
          user_id: userId,
          card_id: e.card_id,
          deck_key: deckKey,
          deck_name: deckName,
          is_correct: e.is_correct,
          level_before: e.level_before,
          level_after: e.level_after,
          mode: e.mode,
          duration_ms: e.duration_ms,
          // Пачки из outbox, сохранённые до появления поля, уходят без сессии
          session_id: e.session_id ?? null,
        }));
        const { error } = await supabase.from('study_events').insert(rows);
        if (error) return supabaseError(error.message);
        return { data: undefined };
      },
      invalidatesTags: [ApiTag.StudyStats],
    }),
    getStudyOverview: build.query<StudyOverview, string>({
      queryFn: async (tz) => {
        const { data, error } = await supabase.rpc('get_study_overview', { p_tz: tz });
        if (error) return supabaseError(error.message);
        const row = data as OverviewRow;
        return {
          data: {
            totalAnswers: row.total_answers,
            correctAnswers: row.correct_answers,
            accuracy: row.accuracy,
            totalDurationMs: row.total_duration_ms,
            currentStreak: row.current_streak,
            longestStreak: row.longest_streak,
          },
        };
      },
      providesTags: [ApiTag.StudyStats],
    }),
    getProgressSummary: build.query<ProgressSummary, ProgressSummaryArgs>({
      queryFn: async ({ tz, period }) => {
        const { data, error } = await supabase.rpc('get_progress_summary', {
          p_tz: tz,
          p_days: PERIOD_DAYS[period],
        });
        if (error) return supabaseError(error.message);
        const row = data as ProgressSummaryRow;
        return {
          data: {
            current: mapPeriodStats(row.current),
            previous: mapPeriodStats(row.previous),
          },
        };
      },
      providesTags: [ApiTag.StudyStats],
    }),
    getStudyHeatmap: build.query<HeatmapDay[], string>({
      queryFn: async (tz) => {
        const { data, error } = await supabase.rpc('get_study_heatmap', { p_tz: tz });
        if (error) return supabaseError(error.message);
        return { data: (data as HeatmapDay[]) ?? [] };
      },
      providesTags: [ApiTag.StudyStats],
    }),
    getDeckProgress: build.query<DeckAccuracy[], string>({
      queryFn: async (tz) => {
        const { data, error } = await supabase.rpc('get_deck_progress', { p_tz: tz });
        if (error) return supabaseError(error.message);
        return {
          data: ((data as DeckProgressRow[]) ?? []).map((r) => ({
            deckKey: r.deck_key,
            deckName: r.deck_name,
            totalAnswers: r.total_answers,
            correctAnswers: r.correct_answers,
            accuracy: r.accuracy,
          })),
        };
      },
      providesTags: [ApiTag.StudyStats],
    }),
    getMastery: build.query<MasteryStats, void>({
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_mastery');
        if (error) return supabaseError(error.message);
        const row = data as MasteryRow;
        return {
          data: {
            overall: row.overall,
            perDeck: row.per_deck.map((d) => ({
              deckKey: d.deck_key,
              new: d.new,
              learning: d.learning,
              mastered: d.mastered,
            })),
          },
        };
      },
      providesTags: [ApiTag.StudyStats, ApiTag.CardReviews],
    }),
    getDueSummary: build.query<DueSummary, DueSummaryArgs>({
      queryFn: async ({ tz, days }) => {
        const { data, error } = await supabase.rpc('get_due_summary', { p_tz: tz, p_days: days });
        if (error) return supabaseError(error.message);
        const row = data as DueSummaryRow;
        return {
          data: {
            forecast: row.forecast,
            perDeck: row.per_deck.map((d) => ({ deckUuid: d.deck_id, due: d.due, new: d.new })),
          },
        };
      },
      providesTags: [ApiTag.CardReviews, ApiTag.Cards],
    }),
    getClozeStats: build.query<DeckClozeStats[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_cloze_stats');
        if (error) return supabaseError(error.message);
        return {
          data: ((data as ClozeStatsRow[]) ?? []).map((r) => ({
            deckUuid: r.deck_id,
            examplesCount: r.examples_count,
            lastClozeAt: r.last_cloze_at,
          })),
        };
      },
      providesTags: [ApiTag.StudyStats, ApiTag.Cards],
    }),
  }),
});

export const {
  useLogStudyEventsMutation,
  useGetStudyOverviewQuery,
  useGetProgressSummaryQuery,
  useGetStudyHeatmapQuery,
  useGetDeckProgressQuery,
  useGetMasteryQuery,
  useGetDueSummaryQuery,
  useGetClozeStatsQuery,
} = statisticsApi;
