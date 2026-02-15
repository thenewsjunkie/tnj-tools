import React from "react";

const formatInlineHTML = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-purple-400 underline hover:text-purple-300 break-all">$1</a>'
    );
};

export const formatRundownContent = (content: string) => {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={key++} className="h-3" />);
      continue;
    }

    // Section headers (## or lines like "1. Overview")
    const headerMatch = trimmed.match(/^#{1,3}\s+(.*)$/) || trimmed.match(/^(\d+)\.\s+\*\*(.+)\*\*$/);
    if (headerMatch) {
      const text = headerMatch[2] || headerMatch[1];
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-purple-400 border-l-2 border-purple-500 pl-3 mt-6 mb-2">
          {text.replace(/\*\*/g, "")}
        </h3>
      );
      continue;
    }

    // "3 Big Takeaways" special header
    if (trimmed.includes("Big Takeaway") || trimmed.includes("big takeaway")) {
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-amber-400 border-l-2 border-amber-500 pl-3 mt-6 mb-2">
          {trimmed.replace(/[*#]/g, "").trim()}
        </h3>
      );
      continue;
    }

    // Bold section headers (standalone **text**)
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-purple-400 border-l-2 border-purple-500 pl-3 mt-6 mb-2">
          {trimmed.replace(/\*\*/g, "")}
        </h3>
      );
      continue;
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const bulletText = trimmed.replace(/^[-•]\s+/, "");
      elements.push(
        <div key={key++} className="flex items-start gap-2 pl-4 py-0.5">
          <span className="text-purple-400 mt-1 shrink-0">•</span>
          <span className="text-foreground/90" dangerouslySetInnerHTML={{
            __html: formatInlineHTML(bulletText)
          }} />
        </div>
      );
      continue;
    }

    // Numbered items
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      elements.push(
        <div key={key++} className="flex items-start gap-2 pl-4 py-0.5">
          <span className="text-purple-400 font-semibold shrink-0">{numberedMatch[1]}.</span>
          <span className="text-foreground/90" dangerouslySetInnerHTML={{
            __html: formatInlineHTML(numberedMatch[2])
          }} />
        </div>
      );
      continue;
    }

    // Regular text
    elements.push(
      <p key={key++} className="text-foreground/85 pl-4" dangerouslySetInnerHTML={{
        __html: formatInlineHTML(trimmed)
      }} />
    );
  }

  return elements;
};
