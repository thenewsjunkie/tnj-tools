import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GiftStatsCard } from "@/components/admin/gift-stats/GiftStatsCard";
import { GiftStatsTable } from "@/components/admin/gift-stats/GiftStatsTable";
import { useGiftStats } from "@/hooks/useGiftStats";

const GiftStatsAdmin = () => {
  const [search, setSearch] = useState("");
  const [includeTestData, setIncludeTestData] = useState(false);

  const { data: giftStats, isLoading } = useGiftStats(includeTestData);

  const filteredStats = giftStats?.filter((stat) =>
    stat.username.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  const totalGifts = giftStats?.reduce((acc, stat) => acc + (stat.total_gifts || 0), 0) || 0;
  const lastGiftDate = giftStats?.reduce((latest, stat) =>
    !latest || (stat.last_gift_date && stat.last_gift_date > latest)
      ? stat.last_gift_date
      : latest
  , null as string | null);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <nav className="flex items-center mb-8">
        <Link
          to="/admin"
          className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Admin
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gift Statistics</h1>
          <p className="text-muted-foreground">
            Detailed overview of all gift statistics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GiftStatsCard
            title="Total Gifters"
            description="Number of unique gifters"
            value={giftStats?.length || 0}
            isLoading={isLoading}
          />
          <GiftStatsCard
            title="Total Gifts"
            description="All-time gift count"
            value={totalGifts}
            isLoading={isLoading}
          />
          <GiftStatsCard
            title="Last Gift"
            description="Most recent gift date"
            value={formatDate(lastGiftDate)}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Detailed Statistics</h2>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeTestData"
                  checked={includeTestData}
                  onChange={(e) => setIncludeTestData(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="includeTestData" className="text-sm text-muted-foreground">
                  Include test data
                </label>
              </div>
              <Input
                placeholder="Search by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </div>

          <GiftStatsTable
            stats={filteredStats || []}
            isLoading={isLoading}
            formatDate={formatDate}
            includeTestData={includeTestData}
          />
        </div>
      </div>
    </div>
  );
};

export default GiftStatsAdmin;