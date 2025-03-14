
import React from 'react';
import { cn } from '@/lib/utils';

type BackgroundAnimationProps = {
  className?: string;
};

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ className }) => {
  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-darker via-cyber-dark to-cyber-darker opacity-80"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTIxMjEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMThoLTJ2LTRoMnY0em0wIDZoLTJ2LTRoMnY0em0wIDZoLTJ2LTRoMnY0em0wIDZoLTJ2LTRoMnY0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      {/* Animated digital streams */}
      <div className="absolute inset-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i}
            className="absolute h-[50vh] w-px bg-gradient-to-b from-transparent via-cyber-blue/20 to-transparent"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.1 + Math.random() * 0.5
            }}
          />
        ))}
      </div>
      
      {/* Data matrices */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[200px] h-[200px] rounded-md border border-cyber-blue/10 overflow-hidden"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `translate(-50%, -50%) rotate(${Math.random() * 45}deg)`,
              opacity: 0.05 + Math.random() * 0.1
            }}
          >
            <div className="w-full h-full bg-cyber-blue/5 backdrop-blur-sm">
              <div className="font-mono text-[8px] text-cyber-blue/30 whitespace-nowrap animate-data-flow overflow-hidden">
                {Array.from({ length: 40 }).map((_, j) => (
                  <div key={j} className="leading-tight">
                    {Array.from({ length: 30 }).map(() => 
                      Math.random() > 0.5 ? "1" : "0"
                    ).join(" ")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse-slow"
            style={{
              width: `${20 + Math.random() * 100}px`,
              height: `${20 + Math.random() * 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(14,165,233,0) 70%)`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundAnimation;
