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
      font-size: 14px;
      line-height: 1.4;
      color: #1a1a1a;
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #333;
    }
    h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 6px 0;
      padding-bottom: 3px;
      border-bottom: 1px solid #ccc;
      color: #333;
    }
    .opening-script {
      background: #f5f5f5;
      padding: 8px 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .special-segment {
      background: #e8f4e8;
      padding: 6px 10px;
      border-radius: 4px;
      margin: 6px 0;
      font-size: 13px;
    }
    .two-column {
      display: flex;
      gap: 16px;
      margin-bottom: 10px;
    }
    .topics-column {
      flex: 3;
    }
    .segments-column {
      flex: 2;
    }
    .scheduled-segment {
      display: flex;
      gap: 8px;
      padding: 4px 0;
      border-bottom: 1px dashed #ddd;
      font-size: 13px;
    }
    .scheduled-segment .time {
      font-weight: 600;
      color: #666;
      min-width: 55px;
    }
    .topic {
      margin: 4px 0;
      padding: 5px 8px;
      background: #fafafa;
      border-left: 3px solid #333;
      font-size: 13px;
    }
    .topic-title {
      font-weight: 500;
    }
    .topic-take {
      font-style: italic;
      font-size: 12px;
      margin-top: 3px;
      padding-left: 10px;
      border-left: 2px solid #666;
      color: #444;
    }
    .hopper-section {
      margin-top: 10px;
    }
    .hopper-content {
      columns: 2;
      column-gap: 16px;
    }
    .hopper-group {
      margin: 5px 0;
      padding: 6px 8px;
      background: #f0f8ff;
      border-radius: 4px;
      break-inside: avoid;
    }
    .hopper-group-name {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 3px;
      color: #336;
    }
    .hopper-item {
      padding: 4px 0 4px 12px;
      font-size: 13px;
      break-inside: avoid;
      border-bottom: 1px solid #e0e0e0;
      position: relative;
    }
    .hopper-item::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #666;
    }
    .hopper-item.starred {
      font-weight: 700;
      border-left: 3px solid #000;
      padding-left: 6px;
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
      padding: 6px 0;
      font-size: 13px;
    }
    @media print {
      body {
        padding: 12px;
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
          ${topic.take ? `<div class="topic-take">🔥 ${topic.take}</div>` : ""}
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
