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
  potentialVideos: string;
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
    potentialVideos,
    localTopics,
    scheduledSegments,
  } = data;

  const dateFormatted = format(selectedDate, "EEEE, MMMM do yyyy");
  const dateConversational = format(selectedDate, "EEEE MMMM do yyyy");
  const isFriday = checkIsFriday(selectedDate);
  const isMonday = checkIsMonday(selectedDate);
  const isTuesday = checkIsTuesday(selectedDate);

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
    .topic-bullets {
      margin-top: 4px;
      padding-left: 16px;
      font-size: 11px;
      list-style: disc;
    }
    .topic-bullets li {
      margin: 2px 0;
      color: #555;
    }
    .main-character-field {
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 4px;
      padding: 8px 12px;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .main-character-field strong {
      margin-right: 8px;
    }
    .main-character-line {
      display: inline-block;
      border-bottom: 1px solid #333;
      min-width: 350px;
      height: 18px;
    }
    .empty-state {
      color: #999;
      font-style: italic;
      padding: 6px 0;
      font-size: 13px;
    }
    .potential-videos {
      background: #f3e8ff;
      border: 1px solid #c4b5fd;
      border-radius: 4px;
      padding: 8px 12px;
      margin-top: 12px;
      font-size: 13px;
    }
    .potential-videos h3 {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 6px 0;
      color: #7c3aed;
    }
    .potential-videos ul {
      margin: 0;
      padding-left: 20px;
    }
    .potential-videos li {
      margin: 3px 0;
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
  
  <div class="main-character-field">
    <strong>Today's Main Character:</strong>
    <span class="main-character-line"></span>
  </div>
  
  <div class="two-column">
    <div class="topics-column">
      <h2>Topics</h2>
      ${localTopics.length > 0 ? localTopics.map((topic) => {
        const bullets = topic.bullets?.filter(b => b.text.trim()) || [];
        return `
          <div class="topic">
            <span class="topic-title">${topic.type === "link" ? "🔗 " : ""}${topic.title || "Untitled"}</span>
            ${topic.take ? `<div class="topic-take">🔥 ${topic.take}</div>` : ""}
            ${bullets.length > 0 ? `
              <ul class="topic-bullets">
                ${bullets.map(b => `<li style="margin-left: ${b.indent * 12}px">${b.text}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `;
      }).join("") : '<div class="empty-state">No topics</div>'}
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
  
  ${potentialVideos ? `
  <div class="potential-videos">
    <h3>🎬 Potential Videos</h3>
    <ul>
      ${potentialVideos.split('\n').filter(line => line.trim()).map(line => `<li>${line.trim()}</li>`).join('')}
    </ul>
  </div>
  ` : ''}
  
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
