import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GiftStatsCardProps {
  title: string;
  description: string;
  value: string | number;
  isLoading?: boolean;
}

export const GiftStatsCard = ({
  title,
  description,
  value,
  isLoading = false,
}: GiftStatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          {isLoading ? "..." : value}
        </p>
      </CardContent>
    </Card>
  );
};