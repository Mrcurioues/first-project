import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { listServicesWithItems } from "@/lib/content";
import { useBooking } from "@/components/BookingDialog";
import { resolveImage } from "@/lib/image-registry";

export function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { open: openBooking } = useBooking();
  const { data: services = [] } = useQuery({
    queryKey: ["services-with-items"],
    queryFn: listServicesWithItems,
  });

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground font-bold">SD</div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-accent">Smile Dental</div>
            <div className="text-[10px] tracking-widest text-muted-foreground uppercase">Care · Comfort · Confidence</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          <Link to="/" className="hover:text-primary" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>Home</Link>
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <Link to="/services" className="flex items-center gap-1 hover:text-primary" activeProps={{ className: "text-primary" }}>
              Services <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            {servicesOpen && (
              <div className="absolute left-1/2 -translate-x-[40%] top-full pt-4 w-[540px]">
                <div className="bg-card rounded-2xl shadow-warm border border-border p-6 grid grid-cols-2 gap-x-8 gap-y-5">
                  {services.map((cat) => (
                    <div key={cat.category} className="flex flex-col">
                      <div className="text-[13.5px] font-bold text-accent mb-1.5 leading-tight">{cat.category}</div>
                      <ul className="space-y-0.5">
                        {cat.items.map((it) => (
                          <li key={it.slug}>
                            <Link
                              to="/services/$slug"
                              params={{ slug: it.slug }}
                              className="text-[12.5px] font-normal text-muted-foreground hover:text-primary transition-colors block py-0.5"
                            >
                              {it.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/doctors" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Meet Our Doctors</Link>
          <Link to="/testimonials" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Testimonials</Link>
          <Link to="/contact" className="hover:text-primary" activeProps={{ className: "text-primary" }}>Contact</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href="tel:+919999999999" className="flex items-center gap-2 text-sm font-semibold text-accent">
            <Phone className="w-4 h-4" /> +91 99999 99999
          </a>
          <button
            type="button"
            onClick={() => openBooking()}
            className="px-4 py-2 rounded-full bg-gradient-warm text-primary-foreground text-sm font-semibold shadow-soft hover:opacity-90"
          >
            Book Appointment
          </button>
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="px-4 py-4 flex flex-col gap-3 text-sm font-medium">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/services" onClick={() => setOpen(false)}>Services</Link>
            <Link to="/doctors" onClick={() => setOpen(false)}>Meet Our Doctors</Link>
            <Link to="/testimonials" onClick={() => setOpen(false)}>Testimonials</Link>
            <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
            <button
              type="button"
              onClick={() => { setOpen(false); openBooking(); }}
              className="px-4 py-2 rounded-full bg-gradient-warm text-primary-foreground text-center font-semibold"
            >
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
}