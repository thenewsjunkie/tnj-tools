import { Json } from '../helpers';

export interface SystemSettingsRow {
  key: string;
  value: Json;
  updated_at: string;
}

export interface LeaderboardVisibilityValue {
  isVisible: boolean;
}