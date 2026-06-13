import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './Card';

const buttonVariants = {
  default: "bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/20 border border-primary-500/50",
  outline: "border border-glass-border bg-transparent hover:bg-white/5 text-slate-200",
  ghost: "bg-transparent hover:bg-white/10 text-slate-200",
  danger: "bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-500/20 border border-rose-500/50",
};

const sizeVariants = {
  sm: "h-9 px-4 text-xs",
  default: "h-11 px-6 py-2 text-sm",
  lg: "h-14 px-8 text-base",
  icon: "h-11 w-11 flex items-center justify-center",
};

export const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  disabled,
  isLoading,
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";
