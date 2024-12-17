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
        <TableRow className="dark:bg-gray-900">
          <TableHead className="dark:text-gray-200">Email</TableHead>
          <TableHead className="dark:text-gray-200">Status</TableHead>
          <TableHead className="dark:text-gray-200">Role</TableHead>
          <TableHead className="dark:text-gray-200">Joined</TableHead>
          <TableHead className="dark:text-gray-200">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id} className="dark:bg-gray-800/50">
            <TableCell className="dark:text-gray-200">{profile.email}</TableCell>
            <TableCell className="dark:text-gray-200">
              <UserStatusBadge status={profile.status} />
            </TableCell>
            <TableCell className="dark:text-gray-200">{profile.role}</TableCell>
            <TableCell className="dark:text-gray-200">
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