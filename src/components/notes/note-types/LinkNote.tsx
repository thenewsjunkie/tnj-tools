import React from "react";
import { Link } from "lucide-react";

interface LinkNoteProps {
  url: string;
  title: string;
}

const LinkNote = ({ url, title }: LinkNoteProps) => {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-3 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
    >
      <img 
        src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d"
        alt="Link thumbnail"
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex items-center gap-2 min-w-0">
        <Link className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{title || url}</span>
      </div>
    </a>
  );
};

export default LinkNote;