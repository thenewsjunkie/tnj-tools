import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";

const GiftStatsAdmin = () => {
  const [search, setSearch] = useState("");
  const [includeTestData, setIncludeTestData] = useState(false);

  const { data: giftStats, isLoading } = useQuery({
    queryKey: ["gift-stats", includeTestData],
    queryFn: async () => {
      let query = supabase
        .from("gift_stats")
        .select("*");
      
      if (!includeTestData) {
        query = query.eq('is_test_data', false);
      }
      
      // Order by last_gift_date in descending order (most recent first)
      // Null values will automatically be placed last
      const { data, error } = await query
        .order('last_gift_date', { ascending: false });

      if (error) throw error;
      return data as GiftStats[];
    },
  });

  const filteredStats = giftStats?.filter((stat) =>
    stat.username.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

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
          <Card>
            <CardHeader>
              <CardTitle>Total Gifters</CardTitle>
              <CardDescription>Number of unique gifters</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {isLoading ? "..." : giftStats?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Gifts</CardTitle>
              <CardDescription>All-time gift count</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {isLoading
                  ? "..."
                  : giftStats?.reduce((acc, stat) => acc + stat.total_gifts, 0) ||
                    0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last Gift</CardTitle>
              <CardDescription>Most recent gift date</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {isLoading
                  ? "..."
                  : formatDate(
                      giftStats?.reduce((latest, stat) =>
                        !latest || (stat.last_gift_date && stat.last_gift_date > latest)
                          ? stat.last_gift_date
                          : latest
                      , null as string | null)
                    )}
              </p>
            </CardContent>
          </Card>
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

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Total Gifts</TableHead>
                    <TableHead className="text-right">Last Gift</TableHead>
                    <TableHead className="text-right">Monthly Gifts</TableHead>
                    <TableHead className="text-right">Yearly Gifts</TableHead>
                    <TableHead className="text-right">Test Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredStats?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No gift statistics found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStats?.map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell className="font-medium">
                          {stat.username}
                        </TableCell>
                        <TableCell className="text-right">
                          {stat.total_gifts}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDate(stat.last_gift_date)}
                        </TableCell>
                        <TableCell className="text-right">
                          {Object.values(stat.monthly_gifts as Record<string, number>).reduce(
                            (acc, count) => acc + count,
                            0
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {Object.values(stat.yearly_gifts as Record<string, number>).reduce(
                            (acc, count) => acc + count,
                            0
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {stat.is_test_data ? "Yes" : "No"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GiftStatsAdmin;