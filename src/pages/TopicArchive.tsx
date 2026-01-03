import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, isAfter, isBefore, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Calendar, Link2, Image, List, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import type { Topic, HourBlock } from "@/components/admin/show-prep/types";

interface FlattenedTopic {
  id: string;
  date: string;
  title: string;
  linksCount: number;
  imagesCount: number;
  bulletsCount: number;
  bullets: { id: string; text: string }[];
  searchText: string;
  hourLabel: string;
  tags: string[];
}

type DateFilter = "7days" | "30days" | "all" | "custom";

const TopicArchive = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customDateStart, setCustomDateStart] = useState<Date | undefined>();
  const [customDateEnd, setCustomDateEnd] = useState<Date | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: showPrepNotes, isLoading } = useQuery({
    queryKey: ["all-show-prep-notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("show_prep_notes")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const flattenedTopics = useMemo(() => {
    if (!showPrepNotes) return [];

    const topics: FlattenedTopic[] = [];

    showPrepNotes.forEach((note) => {
      const noteTopics = note.topics as unknown as { hours?: HourBlock[] } | HourBlock[] | null;
      
      // Get hours array - handle both { hours: [...] } format and direct array format
      let hours: HourBlock[] = [];
      if (noteTopics && typeof noteTopics === 'object' && 'hours' in noteTopics && Array.isArray(noteTopics.hours)) {
        hours = noteTopics.hours;
      } else if (Array.isArray(noteTopics)) {
        hours = noteTopics as HourBlock[];
      }

      hours.forEach((hour) => {
        if (hour.topics && Array.isArray(hour.topics)) {
          hour.topics.forEach((topic: Topic) => {
            const bulletTexts = topic.bullets?.map((b) => b.text) || [];
            const linkTitles = topic.links?.map((l) => l.title || l.url) || [];
            const tagTexts = topic.tags || [];

            topics.push({
              id: topic.id,
              date: note.date,
              title: topic.title,
              linksCount: topic.links?.length || 0,
              imagesCount: topic.images?.length || 0,
              bulletsCount: topic.bullets?.length || 0,
              bullets: topic.bullets?.slice(0, 3) || [],
              tags: tagTexts,
              searchText: [
                topic.title,
                ...bulletTexts,
                ...linkTitles,
                ...tagTexts,
              ].join(" ").toLowerCase(),
              hourLabel: hour.label,
            });
          });
        }
      });
    });

    return topics;
  }, [showPrepNotes]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    flattenedTopics.forEach((topic) => {
      topic.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [flattenedTopics]);

  const filteredTopics = useMemo(() => {
    let filtered = flattenedTopics;

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((topic) =>
        topic.searchText.includes(lowerSearch)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((topic) =>
        selectedTags.some((tag) => topic.tags.includes(tag))
      );
    }

    // Apply date filter
    const now = new Date();
    if (dateFilter === "7days") {
      const cutoff = subDays(now, 7);
      filtered = filtered.filter((topic) =>
        isAfter(parseISO(topic.date), cutoff)
      );
    } else if (dateFilter === "30days") {
      const cutoff = subDays(now, 30);
      filtered = filtered.filter((topic) =>
        isAfter(parseISO(topic.date), cutoff)
      );
    } else if (dateFilter === "custom" && customDateStart) {
      filtered = filtered.filter((topic) => {
        const topicDate = parseISO(topic.date);
        const afterStart = isAfter(topicDate, subDays(customDateStart, 1));
        const beforeEnd = customDateEnd
          ? isBefore(topicDate, subDays(customDateEnd, -1))
          : true;
        return afterStart && beforeEnd;
      });
    }

    return filtered;
  }, [flattenedTopics, searchTerm, dateFilter, customDateStart, customDateEnd, selectedTags]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Group by date for display
  const groupedByDate = useMemo(() => {
    const groups: Record<string, FlattenedTopic[]> = {};
    filteredTopics.forEach((topic) => {
      if (!groups[topic.date]) {
        groups[topic.date] = [];
      }
      groups[topic.date].push(topic);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredTopics]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Topic Archive</h1>
            <p className="text-muted-foreground text-sm">
              Search all topics and resources across all show prep dates
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics, links, or bullet points..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={dateFilter === "7days" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("7days")}
          >
            Last 7 days
          </Button>
          <Button
            variant={dateFilter === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("30days")}
          >
            Last 30 days
          </Button>
          <Button
            variant={dateFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("all")}
          >
            All time
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={dateFilter === "custom" ? "default" : "outline"}
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Custom
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Start Date</p>
                  <CalendarComponent
                    mode="single"
                    selected={customDateStart}
                    onSelect={(date) => {
                      setCustomDateStart(date);
                      setDateFilter("custom");
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">End Date</p>
                  <CalendarComponent
                    mode="single"
                    selected={customDateEnd}
                    onSelect={(date) => {
                      setCustomDateEnd(date);
                      setDateFilter("custom");
                    }}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Tag Cloud */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Tags:</span>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setSelectedTags([])}
                >
                  Clear all
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredTopics.length} topic{filteredTopics.length !== 1 ? "s" : ""} found
        </p>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            Loading topics...
          </div>
        )}

        {/* Topics list grouped by date */}
        {!isLoading && groupedByDate.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No topics found matching your criteria
          </div>
        )}

        {groupedByDate.map(([date, topics]) => (
          <div key={date} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-2 border-b">
              📅 {format(parseISO(date), "EEEE, MMMM d, yyyy")}
            </h2>
            <div className="grid gap-3">
              {topics.map((topic) => (
                <Link
                  key={`${date}-${topic.id}`}
                  to={`/admin/topic-resources/${date}/${topic.id}`}
                >
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5">
                          <CardTitle className="text-base font-medium">
                            {topic.title || "Untitled Topic"}
                          </CardTitle>
                          {topic.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {topic.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {topic.hourLabel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Resource counts */}
                      <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Link2 className="h-3.5 w-3.5" />
                          {topic.linksCount} link{topic.linksCount !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Image className="h-3.5 w-3.5" />
                          {topic.imagesCount} image{topic.imagesCount !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <List className="h-3.5 w-3.5" />
                          {topic.bulletsCount} bullet{topic.bulletsCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Bullet preview */}
                      {topic.bullets.length > 0 && (
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {topic.bullets.map((bullet) => (
                            <li key={bullet.id} className="truncate">
                              • {bullet.text}
                            </li>
                          ))}
                          {topic.bulletsCount > 3 && (
                            <li className="text-xs italic">
                              +{topic.bulletsCount - 3} more...
                            </li>
                          )}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicArchive;
