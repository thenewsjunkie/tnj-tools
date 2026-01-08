import { format } from "date-fns";

interface TILEntry {
  story1_url: string | null;
  story1_title: string | null;
  story1_description: string | null;
  story2_url: string | null;
  story2_title: string | null;
  story2_description: string | null;
  story3_url: string | null;
  story3_title: string | null;
  story3_description: string | null;
  story4_url: string | null;
  story4_title: string | null;
  story4_description: string | null;
  story5_url: string | null;
  story5_title: string | null;
  story5_description: string | null;
  story6_url: string | null;
  story6_title: string | null;
  story6_description: string | null;
  story7_url: string | null;
  story7_title: string | null;
  story7_description: string | null;
}

const AUDIO_STORIES = [1, 3, 5, 7];

export const generateTILPrintDocument = (data: TILEntry, date: Date) => {
  const dayName = format(date, "EEEE");
  const formattedDate = format(date, "MMMM d, yyyy");

  const stories: { num: number; title: string; description: string; hasAudio: boolean }[] = [];
  
  for (let i = 1; i <= 7; i++) {
    const title = data[`story${i}_title` as keyof TILEntry] as string;
    const description = data[`story${i}_description` as keyof TILEntry] as string;
    
    if (title) {
      stories.push({
        num: i,
        title,
        description: description || "",
        hasAudio: AUDIO_STORIES.includes(i),
      });
    }
  }

  const storiesHtml = stories.map((story) => `
    <div class="story">
      <div class="story-title">
        ${story.title}${story.hasAudio ? ' <span class="audio-tag">(Audio)</span>' : ''}
      </div>
      <div class="story-description">${story.description}</div>
    </div>
  `).join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>TIL - ${formattedDate}</title>
  <style>
    @page {
      margin: 0.5in;
      size: letter;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 10pt;
      line-height: 1.4;
      margin: 0;
      padding: 0.4in;
      color: #000;
    }
    .header {
      text-align: center;
      margin-bottom: 12px;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
    }
    .header-title {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 2px;
    }
    .story {
      margin-bottom: 14px;
    }
    .story-title {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 4px;
      line-height: 1.3;
    }
    .audio-tag {
      font-weight: normal;
      font-style: italic;
      color: #666;
    }
    .story-description {
      font-size: 10pt;
      line-height: 1.4;
      text-align: justify;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">${dayName} ${formattedDate} | Today I Learned</div>
  </div>
  
  ${storiesHtml}
</body>
</html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
