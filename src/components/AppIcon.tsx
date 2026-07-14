import { motion } from 'motion/react';

interface AppIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export default function AppIcon({ className = '', size = 'md', animated = true }: AppIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08
      }
    }
  };

  const sparkVariants = {
    initial: { scale: 0.6, opacity: 0.5 },
    animate: {
      scale: [0.95, 1.05, 0.95],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const lineVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 0.8,
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const,
        repeatDelay: 1
      }
    }
  };

  return (
    <motion.div
      variants={animated ? containerVariants : undefined}
      initial="initial"
      animate="animate"
      className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-md" />
      
      {/* Icon Frame */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
        {/* Abstract cybernetic/grid background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
        
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 relative z-10"
        >
          {/* Animated Connecting Neural Lines (Analytics Grid) */}
          <motion.path
            d="M25 45 L50 25 L75 45 M50 25 L50 75 M25 45 L50 75 L75 45"
            stroke="url(#iconGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            variants={animated ? lineVariants : undefined}
          />
          
          {/* Main Brain-Analytics Network */}
          <path
            d="M30 50 C30 35, 40 30, 50 30 C60 30, 70 35, 70 50 C70 65, 60 70, 50 70 C40 70, 30 65, 30 50 Z"
            stroke="url(#iconGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-40"
          />

          {/* Left Hemisphere stylized loop */}
          <path
            d="M50 30 C38 30, 34 38, 34 50 C34 62, 38 70, 50 70"
            stroke="url(#iconGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Right Hemisphere stylized loop */}
          <path
            d="M50 30 C62 30, 66 38, 66 50 C66 62, 62 70, 50 70"
            stroke="url(#iconGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Center Analytic Core - Glowing Spark (C CBT Node) */}
          <motion.circle
            cx="50"
            cy="50"
            r="8"
            fill="url(#emeraldCore)"
            variants={animated ? sparkVariants : undefined}
          />

          {/* Outer Analytics Node Pins */}
          <circle cx="25" cy="45" r="3" fill="#34d399" />
          <circle cx="75" cy="45" r="3" fill="#6366f1" />
          <circle cx="50" cy="25" r="3.5" fill="#34d399" />
          <circle cx="50" cy="75" r="3.5" fill="#6366f1" />
          
          {/* Definitions */}
          <defs>
            <linearGradient id="iconGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <radialGradient id="emeraldCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
}
