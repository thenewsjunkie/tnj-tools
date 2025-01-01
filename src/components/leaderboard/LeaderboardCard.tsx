import { GiftStats } from "@/integrations/supabase/types/tables/gifts";

interface LeaderboardCardProps {
  stats: GiftStats[];
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ stats }) => {
  return (
    <div className="leaderboard-card">
      <h2 className="text-xl font-bold">Leaderboard</h2>
      <ul>
        {stats.map((stat) => (
          <li key={stat.id} className="flex justify-between">
            <span>{stat.username}</span>
            <span>{stat.total_gifts}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderboardCard;
