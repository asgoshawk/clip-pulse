import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variants = cva('inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-45', {
  variants: {
    variant: {
      default: 'bg-amber-400 text-zinc-950 hover:bg-amber-300',
      secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
      ghost: 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
      danger: 'bg-red-950 text-red-200 hover:bg-red-900',
    },
    size: { default: 'h-10 px-4', sm: 'h-8 px-3', icon: 'size-9' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

export function Button({ className, variant, size, asChild, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(variants({ variant, size }), className)} {...props} />;
}
