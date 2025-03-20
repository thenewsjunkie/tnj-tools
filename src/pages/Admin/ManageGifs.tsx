
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GifManagementTable from "@/components/gifs/admin/GifManagementTable";

export default function ManageGifs() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <nav className="flex justify-between items-center mb-8">
        <Link
          to="/admin"
          className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Admin
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Manage GIFs</h2>
            <p className="text-sm text-muted-foreground">
              Review, approve, edit, or delete user-submitted GIFs
            </p>
          </div>
        </div>

        <GifManagementTable />
      </div>
    </div>
  );
}
