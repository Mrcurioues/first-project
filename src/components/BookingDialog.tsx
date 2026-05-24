import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/AppointmentForm";
import { Heart } from "lucide-react";

type OpenArgs = { service?: string; doctor?: string };
type Ctx = { open: (args?: OpenArgs) => void };

const BookingCtx = createContext<Ctx | null>(null);

export function useBooking() {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [args, setArgs] = useState<OpenArgs>({});

  const open = useCallback((a?: OpenArgs) => {
    setArgs(a ?? {});
    setOpen(true);
  }, []);

  return (
    <BookingCtx.Provider value={{ open }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:opacity-100">
          <div className="bg-card rounded-3xl border border-border shadow-warm overflow-hidden">
            <div className="bg-gradient-warm text-white px-6 py-6 pattern-mandala relative">
              <DialogHeader className="space-y-2.5">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                    <Heart className="w-3.5 h-3.5 fill-white/10" /> Namaste · Welcome
                  </span>
                </div>
                <DialogTitle className="font-display text-3xl font-bold text-white tracking-tight">
                  Book an Appointment
                </DialogTitle>
                <DialogDescription className="text-white/90 text-sm font-medium leading-relaxed max-w-md">
                  Pick your specialist & slot — we'll send a unique reference ID instantly.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6">
              <AppointmentForm
                key={`${args.service ?? ""}-${args.doctor ?? ""}-${isOpen}`}
                defaultService={args.service}
                defaultDoctor={args.doctor}
                compact
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </BookingCtx.Provider>
  );
}