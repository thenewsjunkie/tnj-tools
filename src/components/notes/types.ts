export type NoteType = 'text' | 'link' | 'image' | 'video';

export interface Note {
  id: string;
  type: NoteType;
  content: string;
  title?: string;
  url?: string;
}