import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, isAfter, isBefore, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Calendar, Link2, X, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import type { Topic, HourBlock, Bullet, Link as TopicLink } from "@/components/admin/show-prep/types";

interface FlattenedTopic {
  id: string;
  date: string;
  title: string;
  bullets: Bullet[];
  links: TopicLink[];
  images: string[];
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
              bullets: topic.bullets || [],
              links: topic.links || [],
              images: topic.images || [],
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

  const isFilteringByTag = selectedTags.length > 0;

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
          <div key={date} className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground sticky top-0 bg-background py-2 border-b z-10">
              📅 {format(parseISO(date), "EEEE, MMMM d, yyyy")}
            </h2>
            <div className="space-y-0">
              {topics.map((topic) => (
                <div
                  key={`${date}-${topic.id}`}
                  className="border-l-2 border-primary/30 pl-3 py-2 hover:bg-accent/30 transition-colors"
                >
                  {/* Topic header with title and tags */}
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/admin/topic-resources/${date}/${topic.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm hover:text-primary transition-colors">
                          {topic.title || "Untitled Topic"}
                        </span>
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
                    </Link>
                    {!isFilteringByTag && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {topic.hourLabel}
                      </Badge>
                    )}
                  </div>

                  {/* Links */}
                  {topic.links.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {topic.links.map((link) => {
                        let displayText = link.title;
                        if (!displayText) {
                          try {
                            displayText = new URL(link.url).hostname;
                          } catch {
                            displayText = link.url;
                          }
                        }
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{displayText}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Images */}
                  {topic.images.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {topic.images.map((img, idx) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-10 h-10 object-cover rounded border hover:border-primary transition-colors"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Bullets */}
                  {topic.bullets.length > 0 && (
                    <ul className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
                      {topic.bullets.map((bullet) => (
                        <li
                          key={bullet.id}
                          className="leading-tight"
                          style={{ paddingLeft: `${(bullet.indent || 0) * 12}px` }}
                        >
                          <span className="text-muted-foreground/60">•</span> {bullet.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicArchive;
