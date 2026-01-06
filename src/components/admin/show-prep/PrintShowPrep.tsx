import { format, isFriday as checkIsFriday, isMonday as checkIsMonday, isTuesday as checkIsTuesday } from "date-fns";
import { Topic } from "./types";
import { ScheduledSegment } from "./scheduledSegments";

interface HopperItem {
  id: string;
  url: string;
  title: string | null;
  group_id: string | null;
  is_starred: boolean;
}

interface HopperGroup {
  id: string;
  name: string | null;
}

interface PrintData {
  selectedDate: Date;
  topics: { fromTopic: string; toTopic: string; andTopic: string };
  lastMinuteFrom: string;
  rateMyBlank: string;
  localTopics: Topic[];
  scheduledSegments: ScheduledSegment[];
  hopperItems: HopperItem[];
  hopperGroups: HopperGroup[];
}

export const generatePrintDocument = (data: PrintData) => {
  const {
    selectedDate,
    topics,
    lastMinuteFrom,
    rateMyBlank,
    localTopics,
    scheduledSegments,
    hopperItems,
    hopperGroups,
  } = data;

  const dateFormatted = format(selectedDate, "EEEE, MMMM do yyyy");
  const dateConversational = format(selectedDate, "EEEE MMMM do yyyy");
  const isFriday = checkIsFriday(selectedDate);
  const isMonday = checkIsMonday(selectedDate);
  const isTuesday = checkIsTuesday(selectedDate);

  // Group hopper items by group
  const groupedHopperItems = hopperGroups.map((group) => ({
    group,
    items: hopperItems.filter((item) => item.group_id === group.id),
  }));
  const ungroupedHopperItems = hopperItems.filter((item) => !item.group_id);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Show Prep - ${dateFormatted}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      line-height: 1.3;
      color: #1a1a1a;
      padding: 12px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      font-size: 16px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #333;
    }
    h2 {
      font-size: 11px;
      font-weight: 600;
      margin: 0 0 4px 0;
      padding-bottom: 2px;
      border-bottom: 1px solid #ccc;
      color: #333;
    }
    .opening-script {
      background: #f5f5f5;
      padding: 6px 8px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 10px;
    }
    .special-segment {
      background: #e8f4e8;
      padding: 4px 8px;
      border-radius: 4px;
      margin: 4px 0;
      font-size: 10px;
    }
    .two-column {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    }
    .topics-column {
      flex: 3;
    }
    .segments-column {
      flex: 2;
    }
    .scheduled-segment {
      display: flex;
      gap: 6px;
      padding: 2px 0;
      border-bottom: 1px dashed #ddd;
      font-size: 10px;
    }
    .scheduled-segment .time {
      font-weight: 600;
      color: #666;
      min-width: 50px;
    }
    .topic {
      margin: 3px 0;
      padding: 3px 6px;
      background: #fafafa;
      border-left: 2px solid #333;
      font-size: 10px;
    }
    .topic-title {
      font-weight: 500;
    }
    .hopper-section {
      margin-top: 8px;
    }
    .hopper-content {
      columns: 2;
      column-gap: 12px;
    }
    .hopper-group {
      margin: 4px 0;
      padding: 4px 6px;
      background: #f0f8ff;
      border-radius: 3px;
      break-inside: avoid;
    }
    .hopper-group-name {
      font-weight: 600;
      font-size: 10px;
      margin-bottom: 2px;
      color: #336;
    }
    .hopper-item {
      padding: 1px 0;
      font-size: 10px;
    }
    .hopper-item.starred {
      font-weight: 700;
      border-left: 3px solid #000;
      padding-left: 4px;
      background: #e0e0e0;
    }
    .hopper-item.starred::before {
      content: "★ ";
    }
    .hopper-item-title {
      font-weight: 500;
    }
    .empty-state {
      color: #999;
      font-style: italic;
      padding: 4px 0;
      font-size: 10px;
    }
    @media print {
      body {
        padding: 8px;
      }
    }
  </style>
</head>
<body>
  <h1>Show Prep - ${dateFormatted}</h1>
  
  <div class="opening-script">
    <strong>Opening:</strong> It's ${dateConversational}! Lots to get to today from <em>${topics.fromTopic || "___"}</em> to <em>${topics.toTopic || "___"}</em> and <em>${topics.andTopic || "___"}</em> plus your calls, Dispatches, emails, texts & more.
  </div>
  
  ${isMonday && rateMyBlank ? `<div class="special-segment"><strong>Rate My Blank:</strong> ${rateMyBlank}</div>` : ""}
  ${isTuesday ? `<div class="special-segment"><strong>Share the Show Tuesday</strong></div>` : ""}
  ${isFriday && lastMinuteFrom ? `<div class="special-segment"><strong>Last Minute From:</strong> ${lastMinuteFrom}</div>` : ""}
  
  <div class="two-column">
    <div class="topics-column">
      <h2>Topics</h2>
      ${localTopics.length > 0 ? localTopics.map((topic) => `
        <div class="topic">
          <span class="topic-title">${topic.type === "link" ? "🔗 " : ""}${topic.title || "Untitled"}</span>
        </div>
      `).join("") : '<div class="empty-state">No topics</div>'}
    </div>
    
    <div class="segments-column">
      <h2>Scheduled</h2>
      ${scheduledSegments.length > 0 ? scheduledSegments.map((seg) => `
        <div class="scheduled-segment">
          <span class="time">${seg.time}</span>
          <span>${seg.name}</span>
        </div>
      `).join("") : '<div class="empty-state">None</div>'}
    </div>
  </div>
  
  <div class="hopper-section">
    <h2>Hopper</h2>
    <div class="hopper-content">
      ${groupedHopperItems.length === 0 && ungroupedHopperItems.length === 0 
        ? '<div class="empty-state">No items in hopper</div>' 
        : ""}
      ${groupedHopperItems.map(({ group, items }) => items.length > 0 ? `
        <div class="hopper-group">
          <div class="hopper-group-name">${group.name || "Unnamed Group"}</div>
          ${items.map((item) => `
            <div class="hopper-item${item.is_starred ? ' starred' : ''}">
              <span class="hopper-item-title">${item.title || "Untitled"}</span>
            </div>
          `).join("")}
        </div>
      ` : "").join("")}
      ${ungroupedHopperItems.map((item) => `
        <div class="hopper-item${item.is_starred ? ' starred' : ''}">
          <span class="hopper-item-title">${item.title || "Untitled"}</span>
        </div>
      `).join("")}
    </div>
  </div>
  
</body>
</html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
