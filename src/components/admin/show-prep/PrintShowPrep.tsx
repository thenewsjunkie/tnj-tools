import { format, isFriday as checkIsFriday, isMonday as checkIsMonday, isTuesday as checkIsTuesday } from "date-fns";
import { Topic } from "./types";
import { ScheduledSegment } from "./scheduledSegments";

interface PrintData {
  selectedDate: Date;
  topics: { fromTopic: string; toTopic: string; andTopic: string };
  lastMinuteFrom: string;
  rateMyBlank: string;
  localTopics: Topic[];
  scheduledSegments: ScheduledSegment[];
  googleTrends: string[];
  yahooTrends: string[];
}

export const generatePrintDocument = (data: PrintData) => {
  const {
    selectedDate,
    topics,
    lastMinuteFrom,
    rateMyBlank,
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
    .empty-state {
      color: #999;
      font-style: italic;
      padding: 6px 0;
      font-size: 13px;
    }
    .google-trends, .yahoo-trends {
      border-radius: 4px;
      padding: 6px 8px;
      font-size: 11px;
    }
    .google-trends {
      background: #e8f0fe;
      border: 1px solid #a8c7fa;
    }
    .yahoo-trends {
      background: #f3e8ff;
      border: 1px solid #c4b5fd;
    }
    .google-trends h3, .yahoo-trends h3 {
      font-size: 12px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }
    .google-trends h3 { color: #1a73e8; }
    .yahoo-trends h3 { color: #7c3aed; }
    .google-trends ol, .yahoo-trends ol {
      margin: 0;
      padding-left: 16px;
    }
    .google-trends li, .yahoo-trends li {
      margin: 1px 0;
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
      
      ${data.googleTrends.length > 0 ? `
      <div class="google-trends" style="margin-top: 12px;">
        <h3>🔍 Google</h3>
        <ol>
          ${data.googleTrends.map(t => `<li>${t}</li>`).join('')}
        </ol>
      </div>
      ` : ''}
      ${data.yahooTrends.length > 0 ? `
      <div class="yahoo-trends" style="margin-top: 8px;">
        <h3>🟣 Yahoo</h3>
        <ol>
          ${data.yahooTrends.map(t => `<li>${t}</li>`).join('')}
        </ol>
      </div>
      ` : ''}
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
