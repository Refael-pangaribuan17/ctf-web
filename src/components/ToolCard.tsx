
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type ToolCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  delayIndex: number;
};

const ToolCard: React.FC<ToolCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  delayIndex = 0 
}) => {
  const delay = `animate-delay-${delayIndex * 100}`;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full cyber-panel p-6 text-left transition-all duration-300 animate-fade-up",
        "hover:bg-cyber-dark hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:-translate-y-1",
        delay
      )}
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 to-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2 rounded-md bg-cyber-blue/10 text-cyber-blue group-hover:bg-cyber-blue/20 transition-colors duration-300">
          <Icon size={22} className="transition-transform duration-300 group-hover:scale-110" />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-white group-hover:text-cyber-blue transition-colors duration-300">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-300">
            {description}
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyber-blue transition-all duration-500 group-hover:w-full"></div>
    </button>
  );
};

export default ToolCard;
