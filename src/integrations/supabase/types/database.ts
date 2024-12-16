export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alert_queue: AlertQueueTable
      alerts: AlertsTable
      audio_conversations: AudioConversationsTable
      call_sessions: CallSessionsTable
      code_implementations: CodeImplementationsTable
      code_versions: CodeVersionsTable
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