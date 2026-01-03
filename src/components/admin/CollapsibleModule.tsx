import { useState, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleModuleProps {
  id: string;
  title: string;
  defaultOpen?: boolean;
  statusBadge?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

const CollapsibleModule = ({
  id,
  title,
  defaultOpen = true,
  statusBadge,
  headerAction,
  children,
  className,
}: CollapsibleModuleProps) => {
  const storageKey = `module-${id}-open`;
  
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === "true" : defaultOpen;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, String(isOpen));
  }, [isOpen, storageKey]);

  return (
    <div className={cn("bg-black rounded-lg border border-white/10", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {!isOpen && statusBadge}
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen ? "" : "-rotate-90"
            )}
          />
        </div>
      </button>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-3 pt-0">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleModule;
