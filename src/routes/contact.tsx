import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, MessageCircle, MapPin, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppointmentForm } from "@/components/AppointmentForm";
import { submitEnquiryRpc } from "@/lib/booking.server";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Book Dental Appointment & Contact — True Dental Care by Awasthi Dental Clinic" },
      { name: "description", content: "Book a dental appointment online or get in touch with True Dental Care by Awasthi Dental Clinic. Located at MG Road, Connaught Place, New Delhi. Call us or chat on WhatsApp for free consultation." },
      { property: "og:title", content: "Book Dental Appointment & Contact — True Dental Care by Awasthi Dental Clinic" },
      { property: "og:description", content: "Book a dental appointment online or get in touch with True Dental Care by Awasthi Dental Clinic. Located at MG Road, Connaught Place, New Delhi. Call us or chat on WhatsApp for free consultation." },
    ],
  }),
  component: ContactPage,
});

const PHONE = "+919999999999";
const PHONE_DISPLAY = "+91 99999 99999";
const WHATSAPP = "919999999999";
const ADDRESS = "12, MG Road, Connaught Place, New Delhi - 110001";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name required").max(80),
  email: z.string().trim().email("Enter a valid email").max(200),
  message: z.string().trim().min(5, "Please write your enquiry").max(1000),
});

function ContactPage() {
  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-14">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold">Get in Touch</h1>
          <p className="mt-3 opacity-90 max-w-2xl mx-auto">
            Book an appointment, ask a question, or just say namaste — we're always happy to help.
          </p>
        </div>
      </section>

      {/* Quick contact strip */}
      <section className="-mt-10">
        <div className="mx-auto max-w-6xl px-6 grid sm:grid-cols-3 gap-4">
          <a
            href={`tel:${PHONE}`}
            className="bg-card rounded-2xl shadow-warm border border-border p-5 flex items-center gap-3 hover:shadow-soft transition"
          >
            <span className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </span>
            <div>
              <div className="text-xs text-muted-foreground">Call us</div>
              <div className="font-semibold">{PHONE_DISPLAY}</div>
            </div>
          </a>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Namaste! I'd like to book a dental appointment.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card rounded-2xl shadow-warm border border-border p-5 flex items-center gap-3 hover:shadow-soft transition"
          >
            <span className="w-11 h-11 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </span>
            <div>
              <div className="text-xs text-muted-foreground">WhatsApp</div>
              <div className="font-semibold">Chat with us instantly</div>
            </div>
          </a>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Connaught+Place+New+Delhi"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card rounded-2xl shadow-warm border border-border p-5 flex items-center gap-3 hover:shadow-soft transition"
          >
            <span className="w-11 h-11 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <div className="text-xs text-muted-foreground">Visit clinic</div>
              <div className="font-semibold">Get directions</div>
            </div>
          </a>
        </div>
      </section>

      {/* Appointment booking */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold">Book an Appointment</h2>
            <p className="mt-2 text-muted-foreground">
              Pick a convenient slot — we'll confirm via WhatsApp within 15 minutes and share your unique reference ID.
            </p>
            <AppointmentForm />
          </div>

          <aside className="lg:col-span-2 space-y-5">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <div className="flex items-center gap-2 font-semibold"><MapPin className="w-4 h-4 text-primary" /> Clinic Address</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{ADDRESS}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <div className="flex items-center gap-2 font-semibold"><Clock className="w-4 h-4 text-primary" /> Working Hours</div>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li className="flex justify-between"><span>Mon – Sat</span><span>9:00 AM – 9:00 PM</span></li>
                <li className="flex justify-between"><span>Sunday</span><span>10:00 AM – 2:00 PM</span></li>
              </ul>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft space-y-2 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> {PHONE_DISPLAY}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> care@awasthidentalclinic.com</div>
            </div>

            {/* Injected Enquiry form here in the empty space below contact info */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <h2 className="text-2xl font-bold">Send us an Enquiry</h2>
              <p className="mt-1 text-muted-foreground text-xs">
                Have a question about a treatment, cost or insurance? Drop us a message.
              </p>
              <EnquiryForm />
            </div>
          </aside>
        </div>
      </section>

      {/* Map (placed at the very bottom) */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-6">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Find Us</span>
            <h2 className="mt-2 text-3xl font-bold">Visit our clinic</h2>
            <p className="mt-2 text-sm text-muted-foreground">{ADDRESS}</p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-warm border border-border">
            <iframe
              title="Awasthi Dental Clinic location"
              src="https://www.google.com/maps?q=Connaught+Place+New+Delhi&output=embed"
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0 }}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function EnquiryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    const result = enquirySchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((iss) => {
        const k = iss.path[0]?.toString() ?? "";
        if (k && !fieldErrors[k]) fieldErrors[k] = iss.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSent(false);
    try {
      await submitEnquiryRpc({
        data: {
          name: result.data.name,
          email: result.data.email,
          message: result.data.message,
          subject: "Website Enquiry",
        }
      });

      setSent(true);
      toast.success("Enquiry sent! We'll reply within 24 hours.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <Field label="Your Name" error={errors.name}>
        <Input name="name" maxLength={80} placeholder="Full name" disabled={submitting} />
      </Field>
      <Field label="Email" error={errors.email}>
        <Input name="email" type="email" maxLength={200} placeholder="you@example.com" disabled={submitting} />
      </Field>
      <Field label="Message" error={errors.message}>
        <Textarea name="message" rows={4} maxLength={1000} placeholder="Type your question here…" disabled={submitting} />
      </Field>
      <Button type="submit" className="w-full rounded-full" disabled={submitting}>
        {submitting ? "Sending..." : "Send Enquiry"}
      </Button>
      {sent && <p className="text-sm text-primary font-medium mt-2">Thank you! Your message has been received.</p>}
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
