import { Json } from './helpers';
import {
  AlertQueueTable,
  AlertsTable,
} from './tables/alerts';
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
  ScreenShareSessionsTable,
  TnjLinksTable,
} from './tables/system';
import { InterviewRequestsTable } from './tables/interviews';
import { FritzContestantsTable } from './tables/fritz';
import { DatabaseFunctions } from './functions';
import { DatabaseEnums } from './enums';

export interface Database {
  public: {
    Tables: {
      alert_queue: AlertQueueTable
      alerts: AlertsTable
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
      screen_share_sessions: ScreenShareSessionsTable
      show_notes: ShowNotesTable
      system_settings: SystemSettingsTable
      tnj_links: TnjLinksTable
    }
    Functions: DatabaseFunctions
    Enums: DatabaseEnums
    CompositeTypes: {
      [_ in never]: never
    }
  }
}