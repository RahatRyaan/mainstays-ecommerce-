import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps & HTMLMotionProps<'button'>>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-sora font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';
    
    const variants = {
      primary: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md shadow-emerald-600/25',
      secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300/80 dark:border-gray-700',
      outline: 'border-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
      ghost: 'text-gray-700 dark:text-gray-200 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300',
      danger: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-md shadow-red-600/25',
    };
    
    const sizes = {
      sm: 'h-9 px-3.5 text-xs gap-1.5',
      md: 'h-11 px-5 text-sm gap-2',
      lg: 'h-13 px-7 text-base gap-2.5',
    };
    
    const widthStyles = fullWidth ? 'w-full' : '';
    
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.025, y: -1 }}
        whileTap={{ scale: 0.95, y: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
