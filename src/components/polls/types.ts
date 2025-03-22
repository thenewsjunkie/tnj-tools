
// Poll option interface with display_order
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  display_order: number;
}

// Poll interface with typed options
export interface Poll {
  id: string;
  question: string;
  status: string;
  poll_options: PollOption[];
  [key: string]: any; // For other properties we might not be using
}

// Raw poll option interface from the database
export interface RawPollOption {
  id: string;
  text: string;
  votes: number;
}

// Raw poll data interface from Supabase
export interface RawPoll {
  id: string;
  question: string;
  status: string;
  poll_options: RawPollOption[];
  [key: string]: any;
}

export interface PollEmbedProps {
  pollId?: string;
  showLatest?: boolean;
  theme?: "light" | "dark";
}
