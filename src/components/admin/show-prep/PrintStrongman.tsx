import { Topic } from "./types";

export const printStrongman = (topic: Topic) => {
  if (!topic.strongman?.content) return;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const generatedDate = new Date(topic.strongman.generatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Convert markdown-style formatting to HTML
  const formatContent = (content: string) => {
    return content
      // Bold text with hot takes styling
      .replace(/\*\*(🔥 HOT TAKES)\*\*/g, '<h3 class="hot-takes">$1</h3>')
      // Regular bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Numbered lists
      .replace(/^(\d+)\.\s+(.*)$/gm, '<li class="numbered">$2</li>')
      // Bullet points
      .replace(/^[-•]\s+(.*)$/gm, '<li class="bullet">$1</li>')
      // Headers (lines ending with colon or starting with #)
      .replace(/^#+\s*(.*)$/gm, '<h3>$1</h3>')
      // Paragraphs (double newlines)
      .replace(/\n\n/g, '</p><p>')
      // Single newlines within content
      .replace(/\n/g, '<br>');
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Strongman: ${topic.title}</title>
      <style>
        @page {
          size: letter;
          margin: 0.5in;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.3;
          color: #1a1a1a;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }
        
        .header {
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        
        .header h1 {
          font-size: 14pt;
          font-weight: 700;
          margin: 0 0 2px 0;
          color: #1e40af;
        }
        
        .header .subtitle {
          font-size: 9pt;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .header .subtitle .icon {
          font-size: 12pt;
        }
        
        .content {
          font-size: 10pt;
        }
        
        .content h3 {
          font-size: 11pt;
          font-weight: 600;
          color: #1e40af;
          margin: 10px 0 4px 0;
          border-left: 2px solid #3b82f6;
          padding-left: 6px;
        }
        
        .content h3.hot-takes {
          color: #ea580c;
          border-left-color: #f97316;
          margin-top: 12px;
          border-left: 2px solid #3b82f6;
          padding-left: 6px;
        }
        
        .content p {
          margin: 4px 0;
        }
        
        .content strong {
          font-weight: 600;
          color: #1e3a5f;
        }
        
        .content li {
          margin: 3px 0;
          padding-left: 2px;
        }
        
        .content li.numbered {
          list-style-type: decimal;
          margin-left: 16px;
        }
        
        .content li.bullet {
          list-style-type: disc;
          margin-left: 16px;
        }
        
        .footer {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          font-size: 8pt;
          color: #9ca3af;
          display: flex;
          justify-content: space-between;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💪 ${topic.title}</h1>
        <div class="subtitle">
          <span>Strongman Argument Analysis</span>
          ${topic.take ? `<span>• Take: "${topic.take}"</span>` : ''}
        </div>
      </div>
      
      <div class="content">
        <p>${formatContent(topic.strongman.content)}</p>
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
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
