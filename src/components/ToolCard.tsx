
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  delayIndex?: number;
  className?: string;
  isActive?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  delayIndex = 0,
  className,
  isActive = false
}) => {
  return (
    <motion.div
      className={cn(
        "cyber-panel cursor-pointer transition-all duration-300 h-full",
        isActive ? "border-cyber-blue border-2" : "hover:border-cyber-blue/50",
        className
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5,
          delay: delayIndex * 0.1
        }
      }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 0 15px rgba(0, 180, 255, 0.3)",
        transition: { duration: 0.2 }
      }}
    >
      <div className="p-5 h-full flex flex-col">
        <div className="mb-3 flex items-center">
          <div className={cn(
            "p-2 rounded-md mr-3",
            isActive ? "bg-cyber-blue/40" : "bg-cyber-blue/20"
          )}>
            <Icon className={cn("h-6 w-6", isActive ? "text-white" : "text-cyber-blue")} />
          </div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 flex-grow">{description}</p>
        <div className="mt-4 text-xs text-cyber-blue flex items-center justify-end">
          <span>{isActive ? "Selected Tool" : "Open Tool"}</span>
          <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default ToolCard;
