import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { format } from "date-fns";
import { sendAppointmentEmail } from "./resend";
import type { Booking } from "./booking-store";

// Simple in-memory sliding-window IP rate limiter
const ipLimits = new Map<string, number[]>();

function isIpRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const requests = ipLimits.get(ip) || [];
  
  // Filter requests within the window
  const recent = requests.filter((time) => now - time < windowMs);
  
  if (recent.length >= limit) {
    return true;
  }
  
  recent.push(now);
  ipLimits.set(ip, recent);
  return false;
}

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

function generateRef(date: Date): string {
  const ymd = format(date, "yyyyMMdd");
  const bytes = new Uint8Array(3);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const rand = Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 6)
    .toUpperCase();
  return `SDC-${ymd}-${rand}`;
}

export const saveBookingRpc = createServerFn({ method: "POST" })
  .inputValidator((data: {
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
  }) => data)
  .handler(async ({ data }) => {
    // 1. IP rate limiting: Limit requests to 5 per IP per hour
    const headers = getRequestHeaders();
    const ip = headers.get("cf-connecting-ip") || headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const ONE_HOUR = 60 * 60 * 1000;
    
    if (isIpRateLimited(ip, 5, ONE_HOUR)) {
      throw new Error("Too many requests from this IP. Please try again later.");
    }

    // 2. Phone number rate limiting: Limit requests to 3 per phone number per 24 hours
    const phone = data.phone.trim();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentBookings, error: checkError } = await supabaseAdmin
      .from("appointments")
      .select("id")
      .eq("patient_phone", phone)
      .gte("created_at", oneDayAgo);
      
    if (checkError) {
      console.error("Error checking recent bookings:", checkError);
    } else if (recentBookings && recentBookings.length >= 3) {
      throw new Error("Limit exceeded. You cannot request more than 3 appointments per phone number in a 24-hour period.");
    }

    // 3. Save booking using supabaseAdmin
    const scheduledAt = parseSlotToDate(data.date, data.time);
    const ref = generateRef(new Date(data.date));

    // Resolve or create patient in CRM
    let resolvedPatientId: string | null = null;
    if (phone) {
      const { data: existingPatients, error: searchErr } = await supabaseAdmin
        .from("patients")
        .select("id")
        .eq("phone", phone)
        .limit(1);

      if (!searchErr && existingPatients && existingPatients.length > 0) {
        resolvedPatientId = existingPatients[0].id;
        if (data.address?.trim()) {
          await supabaseAdmin
            .from("patients")
            .update({ address: data.address.trim() })
            .eq("id", resolvedPatientId);
        }
      } else {
        const { data: newPatient, error: createErr } = await supabaseAdmin
          .from("patients")
          .insert({
            full_name: data.name.trim(),
            phone: phone,
            email: data.email?.trim() || null,
            address: data.address?.trim() || null,
            primary_service: data.service,
            tags: ["Online Booking"],
          })
          .select("id");

        if (!createErr && newPatient && newPatient.length > 0) {
          resolvedPatientId = newPatient[0].id;
        }
      }
    }

    const { data: insertedData, error } = await supabaseAdmin
      .from("appointments")
      .insert({
        reference_id: ref,
        patient_id: resolvedPatientId,
        patient_name: data.name,
        patient_phone: data.phone,
        patient_email: data.email || null,
        service: data.service,
        doctor_name: data.doctor || null,
        doctor_id: data.doctor_id || null,
        scheduled_at: scheduledAt.toISOString(),
        notes: data.notes || null,
        status: "pending",
      })
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    const apptId = insertedData && insertedData.length > 0 ? insertedData[0].id : undefined;

    // Trigger appointment email
    if (data.email) {
      sendAppointmentEmail(
        {
          id: apptId,
          reference_id: ref,
          patient_name: data.name,
          patient_phone: data.phone,
          patient_email: data.email,
          service: data.service,
          doctor_name: data.doctor || null,
          scheduled_at: scheduledAt.toISOString(),
          notes: data.notes || null,
        },
        "pending"
      ).catch((err) => console.error("Error sending booking request email:", err));
    }

    return {
      ref,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      service: data.service,
      doctor: data.doctor,
      doctor_id: data.doctor_id,
      date: data.date,
      time: data.time,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    } as Booking;
  });

export const submitEnquiryRpc = createServerFn({ method: "POST" })
  .inputValidator((data: {
    name: string;
    email: string;
    message: string;
    subject?: string;
  }) => data)
  .handler(async ({ data }) => {
    // 1. IP rate limiting: Limit requests to 5 per IP per hour
    const headers = getRequestHeaders();
    const ip = headers.get("cf-connecting-ip") || headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const ONE_HOUR = 60 * 60 * 1000;

    if (isIpRateLimited(ip, 5, ONE_HOUR)) {
      throw new Error("Too many enquiry requests from this IP. Please try again later.");
    }

    // 2. Insert message securely
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name.trim(),
      email: data.email.trim(),
      message: data.message.trim(),
      subject: data.subject || "Website Enquiry",
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  });
