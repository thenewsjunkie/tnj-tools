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
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^(\d+)\.\s+(.*)$/gm, '<li class="numbered">$2</li>')
      .replace(/^[-•]\s+(.*)$/gm, '<li class="bullet">$1</li>')
      .replace(/^#+\s*(.*)$/gm, '<h3>$1</h3>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

  const sectionsLabel = topic.datasheet.selectedSections.join(", ");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Datasheet: ${topic.title}</title>
      <style>
        @page { size: letter; margin: 0.5in; }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 10pt; line-height: 1.3; color: #1a1a1a; margin: 0; padding: 0;
        }
        .header { border-bottom: 2px solid #16a34a; padding-bottom: 8px; margin-bottom: 12px; }
        .header h1 { font-size: 14pt; font-weight: 700; margin: 0 0 2px 0; color: #15803d; }
        .header .subtitle { font-size: 9pt; color: #6b7280; }
        .content { font-size: 10pt; }
        .content h3 {
          font-size: 11pt; font-weight: 600; color: #15803d;
          margin: 10px 0 4px 0; border-left: 2px solid #16a34a; padding-left: 6px;
        }
        .content p { margin: 4px 0; }
        .content strong { font-weight: 600; color: #14532d; }
        .content li { margin: 3px 0; padding-left: 2px; }
        .content li.numbered { list-style-type: decimal; margin-left: 16px; }
        .content li.bullet { list-style-type: disc; margin-left: 16px; }
        .footer {
          margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;
          font-size: 8pt; color: #9ca3af; display: flex; justify-content: space-between;
        }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 ${topic.title}</h1>
        <div class="subtitle">
          <span>Data Briefing Sheet</span>
          <span> • Sections: ${sectionsLabel}</span>
        </div>
      </div>
      <div class="content">
        <p>${formatContent(topic.datasheet.content)}</p>
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
