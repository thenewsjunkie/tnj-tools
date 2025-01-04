import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";

interface GiftStatsTableRowProps {
  stat: GiftStats;
  formatDate: (date: string | null) => string;
  onTestDataToggle: (id: string, currentValue: boolean) => void;
}

export const GiftStatsTableRow = ({
  stat,
  formatDate,
  onTestDataToggle,
}: GiftStatsTableRowProps) => {
  return (
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
          onCheckedChange={() => onTestDataToggle(stat.id, stat.is_test_data)}
        />
      </TableCell>
    </TableRow>
  );
};