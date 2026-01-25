import { cn } from '@/lib/utils';
import type { ThemeConfig } from '@/types/tapestry';

interface SplitBackgroundProps {
  theme?: ThemeConfig;
  className?: string;
}

const defaultTheme: ThemeConfig = {
  leftColor: '#1e3a5f',
  rightColor: '#5f1e1e',
  dividerColor: '#ffffff',
};

const SplitBackground = ({ theme = defaultTheme, className }: SplitBackgroundProps) => {
  const { leftColor, rightColor, dividerColor, leftGradient, rightGradient, leftImageUrl, rightImageUrl } = theme;
  
  // Helper to get background style with priority: image > gradient > color
  const getBackgroundStyle = (imageUrl?: string, gradient?: string, color?: string) => {
    if (imageUrl) {
      return `url(${imageUrl}) center/cover no-repeat`;
    }
    return gradient || color;
  };
  
  return (
    <div className={cn("absolute inset-0 flex", className)}>
      {/* Left pane */}
      <div 
        className="flex-1 relative"
        style={{ 
          background: getBackgroundStyle(leftImageUrl, leftGradient, leftColor),
        }}
      >
        {/* Subtle pattern overlay - only show when no image */}
        {!leftImageUrl && (
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%)`,
              backgroundSize: '50px 50px',
            }}
          />
        )}
      </div>
      
      {/* Center divider */}
      <div 
        className="w-1 relative z-10 shadow-lg"
        style={{ 
          backgroundColor: dividerColor,
          boxShadow: `0 0 20px ${dividerColor}40, 0 0 40px ${dividerColor}20`,
        }}
      >
        {/* Divider glow effect */}
        <div 
          className="absolute inset-0 w-8 -left-3.5"
          style={{
            background: `linear-gradient(to right, transparent, ${dividerColor}20, transparent)`,
          }}
        />
      </div>
      
      {/* Right pane */}
      <div 
        className="flex-1 relative"
        style={{ 
          background: getBackgroundStyle(rightImageUrl, rightGradient, rightColor),
        }}
      >
        {/* Subtle pattern overlay - only show when no image */}
        {!rightImageUrl && (
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%)`,
              backgroundSize: '50px 50px',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SplitBackground;
