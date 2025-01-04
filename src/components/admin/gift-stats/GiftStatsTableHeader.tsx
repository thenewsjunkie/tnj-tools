import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const GiftStatsTableHeader = () => {
  return (
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
  );
};