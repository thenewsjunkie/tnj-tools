import React from "react";

interface TextNoteProps {
  content: string;
}

const TextNote = ({ content }: TextNoteProps) => {
  const renderTextWithLinks = (text: string) => {
    const urlPattern = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    
    let lastIndex = 0;
    const elements: (string | JSX.Element)[] = [];
    let match;

    while ((match = urlPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }

      const url = match[0];
      elements.push(
        <a
          key={`link-${match.index}`}
          href={url.startsWith('http') ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-block break-all"
        >
          {url}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  return (
    <div className="whitespace-pre-wrap break-words">
      {renderTextWithLinks(content || '')}
    </div>
  );
};

export default TextNote;