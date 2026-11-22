import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'custom';

export interface MotionButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  children?: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverBrightness?: number;
  tapScale?: number;
}

export const MotionButton: React.FC<MotionButtonProps> = ({
  variant = 'custom',
  children,
  className = '',
  hoverScale = 1.02,
  hoverBrightness = 1.08,
  tapScale = 0.98,
  ...props
}) => {
  // Built-in styling per variant if specified
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#1E1B4B] text-white shadow-xs font-semibold';
      case 'secondary':
        return 'bg-slate-100 text-slate-800 border border-slate-200/90 font-medium';
      case 'outline':
        return 'bg-white text-slate-700 border border-slate-300 font-medium';
      case 'danger':
        return 'bg-rose-600 text-white shadow-xs font-semibold';
      case 'ghost':
        return 'text-slate-600 hover:text-slate-900 font-medium';
      default:
        return '';
    }
  };

  return (
    <motion.button
      whileHover={{ 
        scale: hoverScale, 
        filter: `brightness(${hoverBrightness})`,
        transition: { duration: 0.15, ease: 'easeOut' }
      }}
      whileTap={{ 
        scale: tapScale,
        transition: { duration: 0.1, ease: 'easeInOut' }
      }}
      className={`cursor-pointer select-none inline-flex items-center justify-center ${getVariantClasses()} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
