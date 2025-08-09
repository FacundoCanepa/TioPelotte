import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition-transform transform duration-300 hover:scale-105",
  {
    variants: {
      variant: {
        primary: "bg-[#6B8E23] text-white",
        secondary: "bg-[#FECB89] text-stone-900 border border-amber-300",
        outline: "border border-stone-400 text-stone-900 bg-transparent",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <button
      type="button"
      className={cn("cursor-pointer", buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
};

export default Button;