
import { Json } from './helpers';
import {
  AlertQueueTable,
  AlertsTable,
} from './tables/alerts';
import {
  GiftStatsTable,
  GiftHistoryTable,
} from './tables/gifts';
import {
  AudioConversationsTable,
  CallSessionsTable,
} from './tables/conversations';
import {
  CodeImplementationsTable,
  CodeVersionsTable,
} from './tables/code';
import {
  NewsRoundupsTable,
  NewsSourcesTable,
  ShowNotesTable,
} from './tables/content';
import {
  ProfilesTable,
  ReviewsTable,
} from './tables/users';
import {
  SystemSettingsTable,
} from './tables/system';
import { InterviewRequestsTable } from './tables/interviews';
import { FritzContestantsTable } from './tables/fritz';
import { DatabaseFunctions } from './functions';
import { DatabaseEnums } from './enums';
import { ShowMembersTable, ShowMemberSocialsTable } from './tables/show';

export interface Database {
  public: {
    Tables: {
      alert_queue: AlertQueueTable
      alerts: AlertsTable
      gift_stats: GiftStatsTable
      gift_history: GiftHistoryTable
      audio_conversations: AudioConversationsTable
      call_sessions: CallSessionsTable
      code_implementations: CodeImplementationsTable
      code_versions: CodeVersionsTable
      fritz_contestants: FritzContestantsTable
      interview_requests: InterviewRequestsTable
      news_roundups: NewsRoundupsTable
      news_sources: NewsSourcesTable
      profiles: ProfilesTable
      reviews: ReviewsTable
      system_settings: SystemSettingsTable
      show_members: ShowMembersTable
      show_member_socials: ShowMemberSocialsTable
      tnj_links: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          last_checked: string | null
          status: string
          target: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: string
          last_checked?: string | null
          status?: string
          target?: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          last_checked?: string | null
          status?: string
          target?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
      }
    }
    Functions: DatabaseFunctions
    Enums: DatabaseEnums
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
