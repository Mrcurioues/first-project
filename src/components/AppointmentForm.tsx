import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { services } from "@/data/services";
import { doctors } from "@/data/doctors";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  TIME_SLOTS,
  getBookedTimesForDate,
  isDateFullyBooked,
  isSlotTaken,
  saveBooking,
  getDoctorForService,
  refreshBookedForDate,
  type Booking,
} from "@/lib/booking-store";

type DoctorRow = Database["public"]["Tables"]["doctors"]["Row"];
type DoctorShiftRow = Database["public"]["Tables"]["doctor_shifts"]["Row"];

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  if (timeStr.includes(":") && !timeStr.toLowerCase().includes("am") && !timeStr.toLowerCase().includes("pm")) {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + (isNaN(minutes) ? 0 : minutes);
  }
  const clean = timeStr.trim();
  const parts = clean.split(/\s+/);
  if (parts.length < 2) return 0;
  const timePart = parts[0];
  const mer = parts[1].toUpperCase();
  const timeSubParts = timePart.split(":");
  let hh = parseInt(timeSubParts[0], 10);
  const mm = parseInt(timeSubParts[1], 10);
  if (mer === "PM" && hh < 12) hh += 12;
  if (mer === "AM" && hh === 12) hh = 0;
  return hh * 60 + (isNaN(mm) ? 0 : mm);
}

function formatTimeFromDate(d: Date): string {
  let hh = d.getHours();
  const mm = d.getMinutes();
  const mer = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${mer}`;
}

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Enter a valid email").max(200).optional().or(z.literal("")),
  address: z.string().trim().max(250).optional().or(z.literal("")),
  service: z.string().min(1, "Please select a service"),
  doctor: z.string().min(1, "Please select a doctor"),
  date: z.date({ required_error: "Please pick a date" }),
  time: z.string().min(1, "Please select a time"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type AppointmentFormProps = {
  defaultService?: string;
  defaultDoctor?: string;
  onSuccess?: (booking: Booking) => void;
  compact?: boolean;
};

export function AppointmentForm({ defaultService, defaultDoctor, onSuccess, compact }: AppointmentFormProps) {
  const [submitted, setSubmitted] = useState<Booking | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [service, setService] = useState<string>(defaultService ?? "");
  const [doctor, setDoctor] = useState<string>(
    defaultDoctor ?? (defaultService ? getDoctorForService(defaultService) ?? "" : "")
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [, setBookedTick] = useState(0);

  const [dbDoctors, setDbDoctors] = useState<DoctorRow[]>([]);
  const [shifts, setShifts] = useState<DoctorShiftRow[]>([]);
  const [hasShiftsConfigured, setHasShiftsConfigured] = useState(false);
  const [doctorBookedTimes, setDoctorBookedTimes] = useState<string[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Fetch active doctors from Supabase on mount
  useEffect(() => {
    supabase
      .from("doctors")
      .select("*")
      .eq("active", true)
      .order("name")
      .then(({ data, error }) => {
        if (!error && data) {
          setDbDoctors(data);
        }
      });
  }, []);

  const displayDoctors = useMemo(() => {
    if (dbDoctors && dbDoctors.length > 0) {
      return dbDoctors;
    }
    return doctors;
  }, [dbDoctors]);

  // Auto-select doctor when service changes
  useEffect(() => {
    if (!service) return;
    const auto = getDoctorForService(service);
    if (auto) setDoctor(auto);
  }, [service]);

  // Fetch shifts for the selected doctor when doctor or dbDoctors changes
  useEffect(() => {
    if (!doctor) {
      setShifts([]);
      setHasShiftsConfigured(false);
      return;
    }

    const selectedDocObj = displayDoctors.find((d) => d.name === doctor);
    if (!selectedDocObj || !selectedDocObj.id) {
      setShifts([]);
      setHasShiftsConfigured(false);
      return;
    }

    supabase
      .from("doctor_shifts")
      .select("*")
      .eq("doctor_id", selectedDocObj.id)
      .eq("is_active", true)
      .then(({ data, error }) => {
        if (!error && data) {
          setShifts(data);
          setHasShiftsConfigured(data.length > 0);
        }
      });
  }, [doctor, displayDoctors]);

  // Fetch booked slots for the selected doctor on the chosen date
  useEffect(() => {
    if (!date || !doctor) {
      setDoctorBookedTimes([]);
      return;
    }

    setLoadingBookings(true);
    const key = format(date, "yyyy-MM-dd");
    const from = new Date(`${key}T00:00:00`);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);

    supabase.rpc("get_booked_slots", {
      _from: from.toISOString(),
      _to: to.toISOString(),
    }).then(({ data, error }) => {
      setLoadingBookings(false);
      if (!error && data) {
        // Filter slots where doctor_name matches selected doctor
        const filtered = (data as Array<{ scheduled_at: string; doctor_name: string }>)
          .filter((r) => r.doctor_name === doctor)
          .map((r) => formatTimeFromDate(new Date(r.scheduled_at)));
        setDoctorBookedTimes(filtered);
      } else {
        setDoctorBookedTimes([]);
      }
    });
  }, [date, doctor, submitted]);

  // Refresh booked slots globally too
  useEffect(() => {
    if (!date) return;
    refreshBookedForDate(date).then(() => setBookedTick((n) => n + 1));
  }, [date]);

  const bookedTimes = doctorBookedTimes;

  const filteredTimeSlots = useMemo(() => {
    if (!date) return [];
    
    let slots = TIME_SLOTS;

    // Filter by shift timings
    if (hasShiftsConfigured) {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOfWeek = date.getDay();
      const shiftForDay = shifts.find((s) => s.shift_date === dateStr || (!s.shift_date && s.day_of_week === dayOfWeek));
      if (shiftForDay) {
        const startMin = parseTimeToMinutes(shiftForDay.shift_start);
        const endMin = parseTimeToMinutes(shiftForDay.shift_end);
        slots = slots.filter((t) => {
          const slotMin = parseTimeToMinutes(t);
          return slotMin >= startMin && slotMin < endMin;
        });
      }
    }

    // Filter out past slots if selected date is today
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const selectedStr = format(date, "yyyy-MM-dd");
    if (todayStr === selectedStr) {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      slots = slots.filter((t) => {
        const slotMin = parseTimeToMinutes(t);
        return slotMin > currentMin;
      });
    }

    return slots;
  }, [date, shifts, hasShiftsConfigured]);

  // Reset selected time if doctor or date changes and the currently selected time is no longer valid
  useEffect(() => {
    if (!time) return;
    if (!filteredTimeSlots.includes(time)) {
      setTime("");
    }
  }, [doctor, date, filteredTimeSlots, time]);

  if (submitted) {
    return <SuccessPanel booking={submitted} onReset={() => {
      setSubmitted(null);
      setDate(undefined);
      setTime("");
      setService(defaultService ?? "");
      setDoctor(defaultDoctor ?? "");
    }} />;
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      address: String(fd.get("address") ?? ""),
      service,
      doctor,
      date: date as Date,
      time,
      notes: String(fd.get("notes") ?? ""),
    };
    const result = schema.safeParse(raw);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((iss) => {
        const k = iss.path[0]?.toString() ?? "";
        if (k && !fe[k]) fe[k] = iss.message;
      });
      setErrors(fe);
      toast.error("Please fix the highlighted fields");
      return;
    }

    // Double check that the slot is valid for this doctor's shift
    if (hasShiftsConfigured) {
      const dateStr = format(result.data.date, "yyyy-MM-dd");
      const dayOfWeek = result.data.date.getDay();
      const shiftForDay = shifts.find((s) => s.shift_date === dateStr || (!s.shift_date && s.day_of_week === dayOfWeek));
      if (shiftForDay) {
        const slotMin = parseTimeToMinutes(result.data.time);
        const startMin = parseTimeToMinutes(shiftForDay.shift_start);
        const endMin = parseTimeToMinutes(shiftForDay.shift_end);
        if (slotMin < startMin || slotMin >= endMin) {
          setErrors({ time: "This slot is outside the doctor's working hours." });
          toast.error("Slot is outside doctor's shift hours");
          return;
        }
      }
    }

    // Double check if slot has ended for today
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const selectedStr = format(result.data.date, "yyyy-MM-dd");
    if (todayStr === selectedStr) {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const slotMin = parseTimeToMinutes(result.data.time);
      if (slotMin <= currentMin) {
        setErrors({ time: "This slot time has already passed." });
        toast.error("This slot is in the past");
        return;
      }
    }

    await refreshBookedForDate(result.data.date);
    // Double check if slot is already booked for this doctor
    const key = format(result.data.date, "yyyy-MM-dd");
    const from = new Date(`${key}T00:00:00`);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);

    const { data: bookingData, error: bookingErr } = await supabase.rpc("get_booked_slots", {
      _from: from.toISOString(),
      _to: to.toISOString(),
    });

    if (!bookingErr && bookingData) {
      const taken = (bookingData as Array<{ scheduled_at: string; doctor_name: string }>)
        .some((r) => r.doctor_name === doctor && formatTimeFromDate(new Date(r.scheduled_at)) === result.data.time);
      if (taken) {
        setErrors({ time: "This slot is already booked. Please choose another." });
        toast.error("Slot already booked");
        return;
      }
    }

    try {
      setSubmitting(true);
      const selectedDocObj = displayDoctors.find((d) => d.name === doctor);
      const booking = await saveBooking({
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email || undefined,
        address: result.data.address || undefined,
        service: result.data.service,
        doctor: result.data.doctor,
        doctor_id: selectedDocObj?.id || undefined,
        date: result.data.date,
        time: result.data.time,
        notes: result.data.notes || undefined,
      });
      setErrors({});
      toast.success(`Appointment requested · ${booking.ref}`);
      setSubmitted(booking);
      onSuccess?.(booking);
    } catch (err) {
      console.error("Failed to save appointment:", err);
      const message = err instanceof Error ? err.message : (typeof err === "object" && err && "message" in err ? String((err as any).message) : "");
      toast.error(message ? `Could not save appointment: ${message}` : "Could not save appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", !compact && "mt-6 bg-card border border-border rounded-3xl p-6 shadow-soft")}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name" error={errors.name}>
          <Input name="name" placeholder="e.g. Riya Sharma" maxLength={80} />
        </Field>
        <Field label="Mobile Number" error={errors.phone}>
          <Input name="phone" inputMode="numeric" placeholder="10-digit mobile" maxLength={10} />
        </Field>
      </div>

      <Field label="Email (optional)" error={errors.email}>
        <Input name="email" type="email" placeholder="you@example.com" maxLength={200} />
      </Field>

      <Field label="Residential Address" error={errors.address}>
        <Input name="address" placeholder="House / Street, Area, City" maxLength={250} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Treatment / Service" error={errors.service}>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="General Consultation">General Consultation</SelectItem>
              {services.flatMap((cat) => [
                <div key={cat.category} className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{cat.category}</div>,
                ...cat.items.map((it) => (
                  <SelectItem key={it.name} value={it.name}>{it.name}</SelectItem>
                )),
              ])}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Specialist Doctor" error={errors.doctor}>
          <Select value={doctor} onValueChange={setDoctor}>
            <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
            <SelectContent>
              {displayDoctors.map((d) => (
                <SelectItem key={d.name} value={d.name}>{d.name} — {d.role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Preferred Date" error={errors.date}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { setDate(d); setTime(""); }}
                disabled={(d) => {
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const max = new Date(); max.setDate(max.getDate() + 60);
                  if (d < today || d > max) return true;

                  const now = new Date();
                  const isToday = d.getFullYear() === now.getFullYear() &&
                                  d.getMonth() === now.getMonth() &&
                                  d.getDate() === now.getDate();

                  // If shifts are configured, check if doctor is working on this date
                  if (hasShiftsConfigured) {
                    const dateStr = format(d, "yyyy-MM-dd");
                    const dayOfWeek = d.getDay();
                    const shiftForDay = shifts.find((s) => s.shift_date === dateStr || (!s.shift_date && s.day_of_week === dayOfWeek));

                    if (shiftForDay) {
                      if (isToday) {
                        const startMin = parseTimeToMinutes(shiftForDay.shift_start);
                        const endMin = parseTimeToMinutes(shiftForDay.shift_end);
                        const currentMin = now.getHours() * 60 + now.getMinutes();

                        const hasFutureSlot = TIME_SLOTS.some((t) => {
                          const slotMin = parseTimeToMinutes(t);
                          return slotMin >= startMin && slotMin < endMin && slotMin > currentMin;
                        });
                        if (!hasFutureSlot) return true;
                      }
                    } else if (isToday) {
                      // If no shift is configured for today, standard time slots check
                      const currentMin = now.getHours() * 60 + now.getMinutes();
                      const hasFutureSlot = TIME_SLOTS.some((t) => {
                        const slotMin = parseTimeToMinutes(t);
                        return slotMin > currentMin;
                      });
                      if (!hasFutureSlot) return true;
                    }
                  } else {
                    if (isToday) {
                      const currentMin = now.getHours() * 60 + now.getMinutes();
                      const hasFutureSlot = TIME_SLOTS.some((t) => {
                        const slotMin = parseTimeToMinutes(t);
                        return slotMin > currentMin;
                      });
                      if (!hasFutureSlot) return true;
                    }
                  }

                  return isDateFullyBooked(d);
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </Field>

        <Field label="Preferred Time" error={errors.time}>
          <Select value={time} onValueChange={setTime} disabled={!date || loadingBookings}>
            <SelectTrigger>
              <SelectValue placeholder={loadingBookings ? "Loading slots..." : date ? "Choose a slot" : "Pick a date first"} />
            </SelectTrigger>
            <SelectContent>
              {loadingBookings ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Loading available slots...
                </div>
              ) : filteredTimeSlots.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No slots available for this day.
                </div>
              ) : (
                filteredTimeSlots.map((t) => {
                  const taken = bookedTimes.includes(t);
                  return (
                    <SelectItem key={t} value={t} disabled={taken}>
                      {t} {taken && <span className="text-xs text-muted-foreground ml-2">· booked</span>}
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Notes (optional)" error={errors.notes}>
        <Textarea name="notes" rows={3} maxLength={500} placeholder="Tell us about your concern, pain level, or any medical history…" />
      </Field>

      <Button type="submit" disabled={submitting} className="w-full bg-gradient-warm text-primary-foreground font-semibold py-6 rounded-full">
        {submitting ? "Submitting…" : "Request Appointment"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        By submitting, you agree to be contacted on the number provided.
      </p>
    </form>
  );
}

function SuccessPanel({ booking, onReset }: { booking: Booking; onReset: () => void }) {
  const copy = () => {
    navigator.clipboard?.writeText(booking.ref);
    toast.success("Reference ID copied");
  };
  return (
    <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-warm">
      <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <h3 className="mt-4 text-2xl font-bold">Dhanyavaad, {booking.name}!</h3>
      <p className="mt-2 text-muted-foreground">
        Your appointment for{" "}
        <span className="font-semibold text-foreground">{format(new Date(booking.date), "EEEE, do MMM yyyy")}</span>{" "}
        at <span className="font-semibold text-foreground">{booking.time}</span> with{" "}
        <span className="font-semibold text-foreground">{booking.doctor}</span> is confirmed.
      </p>
      <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-5 py-3">
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Reference ID</div>
          <div className="font-mono font-bold text-lg text-primary">{booking.ref}</div>
        </div>
        <button type="button" onClick={copy} className="p-2 rounded-lg hover:bg-primary/10 text-primary" aria-label="Copy reference ID">
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Save this ID — our team will reference it when confirming via WhatsApp.</p>
      <Button className="mt-5" onClick={onReset}>Book another appointment</Button>
    </div>
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