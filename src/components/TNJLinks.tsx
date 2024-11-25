import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LinkItem from "./tnj-links/LinkItem";
import AddLinkDialog from "./tnj-links/AddLinkDialog";

const TNJLinks = () => {
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['tnj-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tnj_links')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  // Check links status every 5 minutes
  useEffect(() => {
    const checkLinksStatus = async () => {
      for (const link of links) {
        try {
          // Ensure we're using HTTPS
          const secureUrl = link.url.replace('http://', 'https://');
          
          // Create an image element to test the connection
          const img = new Image();
          let isResolved = false;
          
          const checkStatus = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              if (!isResolved) {
                img.src = '';
                reject(new Error('Timeout'));
              }
            }, 10000);

            img.onload = () => {
              isResolved = true;
              clearTimeout(timeout);
              resolve('up');
            };

            img.onerror = () => {
              isResolved = true;
              clearTimeout(timeout);
              reject(new Error('Failed to load'));
            };

            // Append a cache-busting parameter
            img.src = `${secureUrl}/favicon.ico?_=${Date.now()}`;
          });

          await checkStatus;
          
          // If we get here, the site is up
          if (link.status !== 'up') {
            await supabase
              .from('tnj_links')
              .update({ 
                status: 'up',
                last_checked: new Date().toISOString()
              })
              .eq('id', link.id);
            
            queryClient.invalidateQueries({ queryKey: ['tnj-links'] });
          }
        } catch (error) {
          // Only update if status isn't already down
          if (link.status !== 'down') {
            await supabase
              .from('tnj_links')
              .update({ 
                status: 'down',
                last_checked: new Date().toISOString()
              })
              .eq('id', link.id);
            
            queryClient.invalidateQueries({ queryKey: ['tnj-links'] });
          }
        }
      }
    };

    checkLinksStatus();
    const interval = setInterval(checkLinksStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [links, queryClient]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg sm:text-xl">TNJ Links</CardTitle>
        <AddLinkDialog 
          onLinkAdded={() => queryClient.invalidateQueries({ queryKey: ['tnj-links'] })}
          lastOrder={links.length > 0 ? Math.max(...links.map(l => l.display_order)) : 0}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-4">
          {links.map((link) => (
            <LinkItem
              key={link.id}
              title={link.title}
              url={link.url}
              status={link.status}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TNJLinks;