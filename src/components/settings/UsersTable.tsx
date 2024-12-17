import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserActionButtons } from "./UserActionButtons";
import type { Profile } from "./types";

interface UsersTableProps {
  profiles: Profile[];
  onApprove: (userId: string) => Promise<void>;
  onDeny: (userId: string) => Promise<void>;
}

export const UsersTable = ({ profiles, onApprove, onDeny }: UsersTableProps) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>{profile.email}</TableCell>
            <TableCell>
              <UserStatusBadge status={profile.status} />
            </TableCell>
            <TableCell>{profile.role}</TableCell>
            <TableCell>
              {format(new Date(profile.created_at), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
              <UserActionButtons
                userId={profile.id}
                status={profile.status}
                onApprove={onApprove}
                onDeny={onDeny}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);