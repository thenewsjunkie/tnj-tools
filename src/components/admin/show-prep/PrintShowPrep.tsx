import { format, isFriday as checkIsFriday, isMonday as checkIsMonday } from "date-fns";
import { Topic } from "./types";
import { ScheduledSegment } from "./scheduledSegments";

interface HopperItem {
  id: string;
  url: string;
  title: string | null;
  group_id: string | null;
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
  const isFriday = checkIsFriday(selectedDate);
  const isMonday = checkIsMonday(selectedDate);

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
      font-size: 12px;
      line-height: 1.4;
      color: #1a1a1a;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      font-size: 18px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #333;
    }
    h2 {
      font-size: 14px;
      margin: 16px 0 8px 0;
      padding-bottom: 4px;
      border-bottom: 1px solid #ccc;
      color: #333;
    }
    h3 {
      font-size: 12px;
      margin: 12px 0 6px 0;
      color: #555;
    }
    .opening-script {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    .special-segment {
      background: #e8f4e8;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 6px 0;
    }
    .scheduled-segment {
      display: flex;
      gap: 8px;
      padding: 4px 0;
      border-bottom: 1px dashed #ddd;
    }
    .scheduled-segment .time {
      font-weight: 600;
      color: #666;
      min-width: 60px;
    }
    .topic {
      margin: 8px 0;
      padding: 8px;
      background: #fafafa;
      border-left: 3px solid #333;
    }
    .topic-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    .topic-bullets {
      margin-left: 16px;
    }
    .topic-bullets li {
      margin: 2px 0;
    }
    .topic-links {
      margin-top: 4px;
      margin-left: 16px;
      font-size: 11px;
      color: #666;
    }
    .topic-tags {
      margin-top: 4px;
      font-size: 10px;
      color: #888;
    }
    .hopper-section {
      margin-top: 16px;
    }
    .hopper-group {
      margin: 8px 0;
      padding: 8px;
      background: #f0f8ff;
      border-radius: 4px;
    }
    .hopper-group-name {
      font-weight: 600;
      margin-bottom: 4px;
      color: #336;
    }
    .hopper-item {
      padding: 2px 0;
      font-size: 11px;
    }
    .hopper-item-title {
      font-weight: 500;
    }
    .hopper-item-url {
      color: #666;
      font-size: 10px;
      word-break: break-all;
    }
    .notes-section {
      margin-top: 24px;
      page-break-inside: avoid;
    }
    .notes-section h2 {
      margin-bottom: 12px;
    }
    .notes-lines {
      border: 1px solid #ccc;
      min-height: 200px;
      padding: 8px;
    }
    .notes-line {
      border-bottom: 1px solid #e0e0e0;
      height: 24px;
    }
    .empty-state {
      color: #999;
      font-style: italic;
      padding: 8px 0;
    }
    @media print {
      body {
        padding: 0;
      }
      .notes-section {
        page-break-before: auto;
      }
    }
  </style>
</head>
<body>
  <h1>Show Prep for ${dateFormatted}</h1>
  
  <div class="opening-script">
    <strong>Opening:</strong> Lots to get to today from <em>${topics.fromTopic || "___"}</em> to <em>${topics.toTopic || "___"}</em> and <em>${topics.andTopic || "___"}</em> plus your calls, Dispatches, emails, texts & more.
  </div>
  
  ${isMonday && rateMyBlank ? `<div class="special-segment"><strong>Rate My Blank:</strong> ${rateMyBlank}</div>` : ""}
  ${isFriday && lastMinuteFrom ? `<div class="special-segment"><strong>Last Minute Message From:</strong> ${lastMinuteFrom}</div>` : ""}
  
  ${scheduledSegments.length > 0 ? `
  <h2>Scheduled Segments</h2>
  <div>
    ${scheduledSegments.map((seg) => `
      <div class="scheduled-segment">
        <span class="time">${seg.time}</span>
        <span>${seg.name}</span>
      </div>
    `).join("")}
  </div>
  ` : ""}
  
  <h2>Topics</h2>
  ${localTopics.length > 0 ? localTopics.map((topic) => `
    <div class="topic">
      <div class="topic-title">${topic.type === "link" ? "🔗 " : ""}${topic.title || "Untitled"}</div>
      ${topic.type === "link" && topic.url ? `<div class="topic-links">URL: ${topic.url}</div>` : ""}
      ${topic.bullets && topic.bullets.length > 0 ? `
        <ul class="topic-bullets">
          ${topic.bullets.map((b) => `<li>${"&nbsp;".repeat(b.indent * 4)}${b.checked ? "✓ " : ""}${b.text}</li>`).join("")}
        </ul>
      ` : ""}
      ${topic.links && topic.links.length > 0 ? `
        <div class="topic-links">
          Links: ${topic.links.map((l) => l.title || l.url).join(", ")}
        </div>
      ` : ""}
      ${topic.tags && topic.tags.length > 0 ? `
        <div class="topic-tags">Tags: ${topic.tags.join(", ")}</div>
      ` : ""}
    </div>
  `).join("") : '<div class="empty-state">No topics added yet</div>'}
  
  <div class="hopper-section">
    <h2>Hopper</h2>
    ${groupedHopperItems.length === 0 && ungroupedHopperItems.length === 0 
      ? '<div class="empty-state">No items in hopper</div>' 
      : ""}
    ${groupedHopperItems.map(({ group, items }) => items.length > 0 ? `
      <div class="hopper-group">
        <div class="hopper-group-name">${group.name || "Unnamed Group"}</div>
        ${items.map((item) => `
          <div class="hopper-item">
            <div class="hopper-item-title">${item.title || "Untitled"}</div>
            <div class="hopper-item-url">${item.url}</div>
          </div>
        `).join("")}
      </div>
    ` : "").join("")}
    ${ungroupedHopperItems.length > 0 ? `
      <h3>Ungrouped Items</h3>
      ${ungroupedHopperItems.map((item) => `
        <div class="hopper-item">
          <div class="hopper-item-title">${item.title || "Untitled"}</div>
          <div class="hopper-item-url">${item.url}</div>
        </div>
      `).join("")}
    ` : ""}
  </div>
  
  <div class="notes-section">
    <h2>Notes</h2>
    <div class="notes-lines">
      ${Array(12).fill('<div class="notes-line"></div>').join("")}
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
