import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GiftStatsTableHeader } from "./GiftStatsTableHeader";
import { GiftStatsTableRow } from "./GiftStatsTableRow";

interface GiftStatsTableProps {
  stats: GiftStats[];
  isLoading: boolean;
  formatDate: (date: string | null) => string;
  includeTestData: boolean;
}

export const GiftStatsTable = ({
  stats,
  isLoading,
  formatDate,
  includeTestData,
}: GiftStatsTableProps) => {
  const queryClient = useQueryClient();

  const handleTestDataToggle = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('gift_stats')
        .update({ is_test_data: !currentValue })
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ 
        queryKey: ['giftStats', includeTestData] 
      });
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
          <GiftStatsTableHeader />
          <TableBody>
            {stats.map((stat) => (
              <GiftStatsTableRow
                key={stat.id}
                stat={stat}
                formatDate={formatDate}
                onTestDataToggle={handleTestDataToggle}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};