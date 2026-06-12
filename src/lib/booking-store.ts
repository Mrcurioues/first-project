import { format } from "date-fns";
import { services } from "@/data/services";
import { supabase } from "@/integrations/supabase/client";
import { saveBookingRpc } from "./booking.server";

export type Booking = {
  ref: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  service: string;
  doctor?: string;
  doctor_id?: string;
  date: string; // yyyy-MM-dd
  time: string;
  notes?: string;
  createdAt: string;
};

export const TIME_SLOTS = [
  "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
  "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
];

function parseSlotToDate(dateStr: string, time: string): Date {
  // time format "hh:mm AM/PM"
  const [t, mer] = time.split(" ");
  const [hhStr, mmStr] = t.split(":");
  let hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  if (mer === "PM" && hh < 12) hh += 12;
  if (mer === "AM" && hh === 12) hh = 0;
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(hh, mm, 0, 0);
  return d;
}

function formatTimeFromDate(d: Date): string {
  let hh = d.getHours();
  const mm = d.getMinutes();
  const mer = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  if (hh === 0) hh = 12;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${mer}`;
}

// In-memory cache of booked slots by date key for sync checks
const bookedCache = new Map<string, Set<string>>();

export async function refreshBookedForDate(date: Date): Promise<string[]> {
  const key = format(date, "yyyy-MM-dd");
  const from = new Date(`${key}T00:00:00`);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  const { data, error } = await supabase.rpc("get_booked_slots", {
    _from: from.toISOString(),
    _to: to.toISOString(),
  });
  if (error) {
    bookedCache.set(key, new Set());
    return [];
  }
  const times = ((data ?? []) as Array<{ scheduled_at: string }>).map((r) =>
    formatTimeFromDate(new Date(r.scheduled_at))
  );
  bookedCache.set(key, new Set(times));
  return times;
}

export function getBookedTimesForDate(date: Date): string[] {
  const key = format(date, "yyyy-MM-dd");
  return Array.from(bookedCache.get(key) ?? []);
}

export function isDateFullyBooked(date: Date): boolean {
  return getBookedTimesForDate(date).length >= TIME_SLOTS.length;
}

export function isSlotTaken(date: Date, time: string): { taken: boolean; duplicate: boolean } {
  const key = format(date, "yyyy-MM-dd");
  const taken = (bookedCache.get(key) ?? new Set()).has(time);
  return { taken, duplicate: false };
}

export function generateRef(date: Date): string {
  const ymd = format(date, "yyyyMMdd");
  const bytes = new Uint8Array(3);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const rand = Array.from(bytes).map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 6).toUpperCase();
  return `SDC-${ymd}-${rand}`;
}

export async function saveBooking(
  b: Omit<Booking, "ref" | "createdAt" | "date"> & { date: Date | string }
): Promise<Booking> {
  const dateStr = typeof b.date === "string" ? b.date : format(b.date, "yyyy-MM-dd");
  
  // Call the server RPC function to perform the insert and rate checks
  const booking = await saveBookingRpc({
    data: {
      name: b.name,
      phone: b.phone,
      email: b.email,
      address: b.address,
      service: b.service,
      doctor: b.doctor,
      doctor_id: b.doctor_id,
      date: dateStr,
      time: b.time,
      notes: b.notes,
    }
  });

  // Update cache
  const cacheKey = dateStr;
  const set = bookedCache.get(cacheKey) ?? new Set<string>();
  set.add(b.time);
  bookedCache.set(cacheKey, set);

  return booking;
}

export function getDoctorForService(serviceName: string): string | undefined {
  if (!serviceName) return undefined;
  if (/general consultation/i.test(serviceName)) return "Dr. Arjun Sharma";
  for (const cat of services) {
    if (cat.category === serviceName) return cat.doctorName;
    if (cat.items.some((i) => i.name === serviceName)) return cat.doctorName;
  }
  return undefined;
}

export async function syncUnlinkedAppointments(): Promise<boolean> {
  try {
    const { data: unlinked, error: fetchErr } = await supabase
      .from("appointments")
      .select("id, patient_name, patient_phone, patient_email, service")
      .is("patient_id", null);

    if (fetchErr || !unlinked || unlinked.length === 0) return false;

    // Group by phone
    const groups: Record<string, typeof unlinked> = {};
    for (const appt of unlinked) {
      const phone = appt.patient_phone?.trim();
      if (!phone) continue;
      if (!groups[phone]) groups[phone] = [];
      groups[phone].push(appt);
    }

    let updated = false;

    for (const [phone, appts] of Object.entries(groups)) {
      // Search if patient exists
      const { data: existing, error: searchErr } = await supabase
        .from("patients")
        .select("id")
        .eq("phone", phone)
        .limit(1);

      if (searchErr) continue;

      let patientId = null;
      if (existing && existing.length > 0) {
        patientId = existing[0].id;
      } else {
        // Create new patient profile
        const first = appts[0];
        const name = (first.patient_name || "Unknown Patient").trim();
        const { data: newPatient, error: createErr } = await supabase
          .from("patients")
          .insert({
            full_name: name,
            phone: phone,
            email: first.patient_email?.trim() || null,
            primary_service: first.service,
            tags: ["Auto Sync"],
          })
          .select("id");

        if (!createErr && newPatient && newPatient.length > 0) {
          patientId = newPatient[0].id;
        }
      }

      if (patientId) {
        const apptIds = appts.map((a) => a.id);
        const { error: updateErr } = await supabase
          .from("appointments")
          .update({ patient_id: patientId })
          .in("id", apptIds);

        if (!updateErr) {
          updated = true;
        }
      }
    }

    return updated;
  } catch (err) {
    console.error("Error in syncUnlinkedAppointments:", err);
    return false;
  }
}

