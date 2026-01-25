import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TapestryCard } from "@/components/full-truth/gallery/TapestryCard";
import { useTapestries, useMyTapestries } from "@/hooks/useTapestry";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const FullTruth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  const { data: publishedTapestries, isLoading: loadingPublished } = useTapestries();
  const { data: myTapestries, isLoading: loadingMy } = useMyTapestries();

  const isLoading = loadingPublished || loadingMy;

  // Combine published and user's drafts, removing duplicates
  const allTapestries = [
    ...(myTapestries || []),
    ...(publishedTapestries || []).filter(
      (pub) => !myTapestries?.some((my) => my.id === pub.id)
    ),
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">The Full Truth</h1>
            <p className="text-muted-foreground mt-1">
              Interactive explainers that break down complex stories
            </p>
          </div>

          {user && (
            <Button asChild>
              <Link to="/full-truth/new">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Link>
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && allTapestries.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium mb-2">No tapestries yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first interactive explainer
            </p>
            {user && (
              <Button asChild>
                <Link to="/full-truth/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Gallery grid */}
        {!isLoading && allTapestries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTapestries.map((tapestry) => (
              <TapestryCard
                key={tapestry.id}
                tapestry={tapestry}
                isOwner={tapestry.created_by === user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullTruth;
