import { ApiTag, rtkApi } from '@/shared/api/rtkApi';
import { supabase, supabaseError, getCurrentUserId } from '@/shared/api/supabaseClient';
import {
  DeckAccuracy,
  HeatmapDay,
  LogStudyEventsDto,
  MasteryStats,
  StudyOverview,
} from '../types/statistics';

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
      providesTags: [ApiTag.StudyStats, ApiTag.LearnProgress],
    }),
  }),
});

export const {
  useLogStudyEventsMutation,
  useGetStudyOverviewQuery,
  useGetStudyHeatmapQuery,
  useGetDeckProgressQuery,
  useGetMasteryQuery,
} = statisticsApi;
