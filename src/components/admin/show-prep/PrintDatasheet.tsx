import { Topic } from "./types";

export const printDatasheet = (topic: Topic) => {
  if (!topic.datasheet?.content) return;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const generatedDate = new Date(topic.datasheet.generatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const formatContent = (content: string) => {
    // Split into lines for processing
    const lines = content.split('\n');
    let html = '';
    let inList = false;
    let listType = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Check for headers (markdown # or ALL CAPS lines)
      const headerMatch = line.match(/^#+\s*(.*)$/);
      const capsMatch = line.match(/^([A-Z][A-Z\s/&]{3,})$/);
      if (headerMatch || capsMatch) {
        if (inList) { html += `</${listType}>`; inList = false; }
        const text = headerMatch ? headerMatch[1] : capsMatch![1];
        html += `<div class="section-header">${text.trim()}</div>`;
        continue;
      }

      // Check for numbered list items
      const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) html += `</${listType}>`;
          html += '<ol>';
          inList = true;
          listType = 'ol';
        }
        html += `<li>${formatInline(numberedMatch[2])}</li>`;
        continue;
      }

      // Check for bullet list items
      const bulletMatch = line.match(/^[-•]\s+(.*)$/);
      if (bulletMatch) {
        if (!inList || listType !== 'ul') {
          if (inList) html += `</${listType}>`;
          html += '<ul>';
          inList = true;
          listType = 'ul';
        }
        html += `<li>${formatInline(bulletMatch[1])}</li>`;
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        if (inList) { html += `</${listType}>`; inList = false; }
        continue;
      }

      // Regular paragraph
      if (inList) { html += `</${listType}>`; inList = false; }
      html += `<p>${formatInline(line)}</p>`;
    }

    if (inList) html += `</${listType}>`;
    return html;
  };

  const formatInline = (text: string) => {
    return text
      // Bold markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Auto-highlight dates (e.g., "January 2024", "Apr 2022", "2023")
      .replace(/\b((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s*\d{4}|\b\d{4}\b)/g, '<span class="date-highlight">$1</span>')
      // Auto-highlight percentages
      .replace(/(\d+(?:\.\d+)?%)/g, '<span class="num-highlight">$1</span>')
      // Auto-highlight dollar amounts
      .replace(/(\$[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|trillion|M|B|K))?)/gi, '<span class="num-highlight">$1</span>');
  };

  const sectionsLabel = topic.datasheet.selectedSections.join(", ");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Datasheet: ${topic.title}</title>
      <style>
        @page { size: letter; margin: 0.5in; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 10pt; line-height: 1.25; color: #1a1a1a;
        }
        .header { border-bottom: 2px solid #16a34a; padding-bottom: 6px; margin-bottom: 8px; }
        .header h1 { font-size: 14pt; font-weight: 700; margin: 0 0 2px 0; color: #15803d; }
        .header .subtitle { font-size: 8pt; color: #6b7280; }

        .section-header {
          background: #16a34a; color: #fff; font-size: 9pt; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
          padding: 2px 8px; margin: 8px 0 4px 0; border-radius: 2px;
        }

        .content p { margin: 2px 0; font-size: 10pt; }
        .content strong { font-weight: 700; color: #14532d; }
        .content ul, .content ol { margin: 1px 0 1px 18px; padding: 0; }
        .content li { margin: 1px 0; padding: 0; font-size: 10pt; }
        .content ul li { list-style-type: disc; }
        .content ol li { list-style-type: decimal; }

        .date-highlight { font-weight: 600; color: #0f766e; }
        .num-highlight { font-weight: 700; color: #b91c1c; }

        .footer {
          margin-top: 10px; padding-top: 6px; border-top: 1px solid #d1d5db;
          font-size: 7pt; color: #9ca3af; display: flex; justify-content: space-between;
        }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 ${topic.title}</h1>
        <div class="subtitle">Data Briefing Sheet • Sections: ${sectionsLabel}</div>
      </div>
      <div class="content">
        ${formatContent(topic.datasheet.content)}
      </div>
      <div class="footer">
        <span>Generated: ${generatedDate}</span>
        <span>Printed: ${formattedDate}</span>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  }
};
