import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface GiftStatsTableProps {
  stats: GiftStats[];
  isLoading: boolean;
  formatDate: (date: string | null) => string;
}

export const GiftStatsTable = ({
  stats,
  isLoading,
  formatDate,
}: GiftStatsTableProps) => {
  const queryClient = useQueryClient();

  const handleTestDataToggle = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('gift_stats')
        .update({ is_test_data: !currentValue })
        .eq('id', id);

      if (error) throw error;

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['gift-stats'] });
      toast.success('Test data status updated successfully');
    } catch (error) {
      console.error('Error updating test data status:', error);
      toast.error('Failed to update test data status');
    }
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center">
          Loading...
        </TableCell>
      </TableRow>
    );
  }

  if (!stats?.length) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center">
          No gift statistics found
        </TableCell>
      </TableRow>
    );
  }

  return (
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
            {stats.map((stat) => (
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
                  <Switch
                    checked={stat.is_test_data}
                    onCheckedChange={() => handleTestDataToggle(stat.id, stat.is_test_data)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};