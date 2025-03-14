
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code, BookOpen, Hammer, Menu, X } from 'lucide-react';
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Animated nav links
  const NavLink = ({ to, children, icon, delay }: { to: string; children: React.ReactNode; icon: React.ReactNode; delay: string }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link 
        to={to} 
        className={cn(
          `group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 
           hover:bg-white/5 hover:text-cyber-blue animate-fade-down`,
          isActive ? "text-cyber-blue" : "text-white/80",
          delay
        )}
      >
        <span className="text-cyber-blue">{icon}</span>
        <span>{children}</span>
        <span className={cn(
          "block h-0.5 bg-cyber-blue scale-x-0 transition-transform duration-300 group-hover:scale-x-100",
          isActive && "scale-x-100"
        )}></span>
      </Link>
    );
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
      isScrolled ? "bg-cyber-darker/80 backdrop-blur-md shadow-md" : "bg-transparent"
    )}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-cyber-blue/20 border border-cyber-blue/50 flex items-center justify-center overflow-hidden relative">
              <Code className="text-cyber-blue z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-cyber-blue/20 to-cyber-purple/20 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              <span className="text-glow">CTF</span>Toolkit
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" icon={<Code size={18} />} delay="animate-delay-100">
              Home
            </NavLink>
            <NavLink to="/tools" icon={<Hammer size={18} />} delay="animate-delay-200">
              Tools
            </NavLink>
            <NavLink to="/learn" icon={<BookOpen size={18} />} delay="animate-delay-300">
              Learn
            </NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="block md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {mobileMenuOpen ? (
              <X className="text-white hover:text-cyber-blue transition-colors" />
            ) : (
              <Menu className="text-white hover:text-cyber-blue transition-colors" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-60 mt-4" : "max-h-0"
        )}>
          <div className="flex flex-col gap-2 py-2 glass-panel">
            <Link 
              to="/" 
              className={cn(
                "flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-md",
                location.pathname === "/" && "text-cyber-blue"
              )}
            >
              <Code size={18} className="text-cyber-blue" />
              <span>Home</span>
            </Link>
            <Link 
              to="/tools" 
              className={cn(
                "flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-md",
                location.pathname === "/tools" && "text-cyber-blue"
              )}
            >
              <Hammer size={18} className="text-cyber-blue" />
              <span>Tools</span>
            </Link>
            <Link 
              to="/learn" 
              className={cn(
                "flex items-center gap-2 px-4 py-3 hover:bg-white/5 rounded-md",
                location.pathname === "/learn" && "text-cyber-blue"
              )}
            >
              <BookOpen size={18} className="text-cyber-blue" />
              <span>Learn</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
