import { useBooking } from "@/components/BookingDialog";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  service?: string;
  doctor?: string;
  children: ReactNode;
};

export function BookButton({ service, doctor, className, children, ...rest }: Props) {
  const { open } = useBooking();
  return (
    <button
      type="button"
      onClick={() => open({ service, doctor })}
      className={cn(className)}
      {...rest}
    >
      {children}
    </button>
  );
}