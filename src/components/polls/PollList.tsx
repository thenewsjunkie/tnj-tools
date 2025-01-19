import { PollCard } from "./PollCard";

interface PollListProps {
  polls: Array<{
    id: string;
    question: string;
    status: string;
    created_at: string;
    image_url?: string;
    poll_options: Array<{
      id: string;
      text: string;
      votes: number;
    }>;
  }>;
  editingPoll: { id: string; question: string } | null;
  setEditingPoll: (poll: { id: string; question: string } | null) => void;
  handleDelete: (pollId: string) => Promise<void>;
  handleUpdatePoll: () => Promise<void>;
}

export function PollList({ polls, editingPoll, setEditingPoll, handleDelete, handleUpdatePoll }: PollListProps) {
  return (
    <div className="grid gap-6">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          poll={poll}
          editingPoll={editingPoll}
          setEditingPoll={setEditingPoll}
          handleDelete={handleDelete}
          handleUpdatePoll={handleUpdatePoll}
        />
      ))}
    </div>
  );
}