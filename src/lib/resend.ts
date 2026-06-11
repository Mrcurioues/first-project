import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export type AppointmentEmailType = "pending" | "approved";

const sendEmailRpc = createServerFn({ method: "POST" })
  .inputValidator((data: {
    appt: {
      id?: string;
      reference_id: string;
      patient_name: string;
      patient_phone?: string;
      patient_email: string | null;
      service: string;
      doctor_name: string | null;
      scheduled_at: string;
      notes?: string | null;
    };
    type: AppointmentEmailType;
  }) => data)
  .handler(async ({ data: { appt, type } }): Promise<boolean> => {
    if (!appt.patient_email) {
      console.log("No email provided for patient, skipping email notification.");
      return false;
    }

    const resendApiKey = (typeof process !== "undefined" ? process.env.VITE_RESEND_API_KEY : null) || import.meta.env.VITE_RESEND_API_KEY;
    
    // Set up local file logging to debug inside the workspace
    let fs: any;
    let path: any;
    let logFile: string | null = null;
    try {
      fs = await import("fs");
      path = await import("path");
      logFile = path.join(process.cwd(), "email_debug.log");
      fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] --- EMAIL TRIGGER START ---\n`);
      fs.appendFileSync(logFile, `Recipient: ${appt.patient_email}\n`);
      fs.appendFileSync(logFile, `Type: ${type}\n`);
      fs.appendFileSync(logFile, `API Key present: ${!!resendApiKey}\n`);
    } catch (e) {
      console.log("Local file logging not available:", e);
    }

    if (!resendApiKey) {
      console.warn("Resend API key is not set in environment variables on the server.");
      if (logFile && fs) {
        fs.appendFileSync(logFile, `ERROR: Resend API key is missing!\n`);
      }
      return false;
    }

    // Format date and time
    const scheduledDate = new Date(appt.scheduled_at);
    const dateStr = scheduledDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeStr = scheduledDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const isPending = type === "pending";
    const subject = isPending
      ? `Appointment Requested · ${appt.reference_id}`
      : `Appointment Confirmed · ${appt.reference_id}`;

    const themeColor = isPending ? "#f59e0b" : "#10b981"; // yellow-500 vs emerald-500
    const iconMarkup = isPending ? "⏳" : "✓";
    const statusLabel = isPending ? "Booking Requested" : "Appointment Confirmed!";
    const statusSubText = isPending
      ? "We have successfully received your appointment request and are currently reviewing it."
      : "Your booking has been officially confirmed by our medical team. We look forward to seeing you!";

    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${subject}</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
              <td align="center" style="background: linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%); padding: 40px 40px 30px 40px;">
                <div style="background-color: rgba(255, 255, 255, 0.2); width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; line-height: 60px; text-align: center; color: #ffffff; font-size: 30px;">
                  ${iconMarkup}
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${statusLabel}</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 15px;">${statusSubText}</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <p style="color: #1f2937; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">Dear <strong style="color: #111827;">${appt.patient_name}</strong>,</p>
                <p style="color: #4b5563; margin: 0 0 28px 0; font-size: 15px; line-height: 1.6;">
                  ${
                    isPending
                      ? "Thank you for scheduling with <strong>Awasthi Dental Clinic</strong>! We are currently checking the availability of your selected doctor and slot. Here is a summary of your requested details:"
                      : "We are pleased to inform you that your appointment is confirmed. Here are the details of your scheduled visit:"
                  }
                </p>
                
                <!-- Details Card -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 28px; padding: 20px;">
                  <tr>
                    <td style="padding-bottom: 14px;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Reference ID</div>
                      <div style="font-size: 15px; color: ${themeColor}; font-weight: 700; font-family: monospace;">${appt.reference_id}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 14px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Patient Name</div>
                      <div style="font-size: 15px; color: #111827; font-weight: 600;">${appt.patient_name}</div>
                    </td>
                  </tr>
                  ${
                    appt.patient_phone
                      ? `<tr>
                          <td style="padding-bottom: 14px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
                            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Mobile Number</div>
                            <div style="font-size: 15px; color: #111827; font-weight: 600;">${appt.patient_phone}</div>
                          </td>
                        </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding-bottom: 14px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Email Address</div>
                      <div style="font-size: 15px; color: #111827; font-weight: 600;">${appt.patient_email}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 14px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Service / Treatment</div>
                      <div style="font-size: 15px; color: #111827; font-weight: 600;">${appt.service}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 14px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Specialist Doctor</div>
                      <div style="font-size: 15px; color: #111827; font-weight: 600;">${appt.doctor_name || "Assigned Specialist"}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 14px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Scheduled Date & Time</div>
                      <div style="font-size: 15px; color: #111827; font-weight: 600;">${dateStr} at ${timeStr}</div>
                    </td>
                  </tr>
                  ${
                    appt.notes
                      ? `<tr>
                          <td style="border-top: 1px solid #e5e7eb; padding-top: 14px;">
                            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Patient Notes</div>
                            <div style="font-size: 14px; color: #4b5563; font-style: italic; line-height: 1.5;">"${appt.notes}"</div>
                          </td>
                        </tr>`
                      : ""
                  }
                </table>

                <!-- Clinic Location Card (Same Format) -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 28px; padding: 20px;">
                  <tr>
                    <td style="padding-bottom: 14px;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: bold;">📍 Clinic Location & Directions</div>
                      <div style="font-size: 15px; color: #111827; font-weight: 600;">Awasthi Dental Clinic</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 14px; border-top: 1px solid #e5e7eb; padding-top: 14px;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Address</div>
                      <div style="font-size: 14px; color: #4b5563; line-height: 1.5; font-weight: 500;">
                        123, Ring Road, near Indian Market Area,<br>
                        New Delhi, Delhi 110001
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top: 1px solid #e5e7eb; padding-top: 14px;">
                      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Directions</div>
                      <a href="https://maps.google.com/?q=Awasthi+Dental+Clinic+Jankipuram+Extension+Lucknow" target="_blank" style="display: inline-block; background-color: ${themeColor}; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold; text-align: center; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
                        🗺️ Open Google Maps Directions
                      </a>
                    </td>
                  </tr>
                </table>
                
                ${
                  isPending
                    ? `<p style="color: #4b5563; margin: 0 0 24px 0; font-size: 14px; line-height: 1.6;">Our staff will coordinate details and send another confirmation email once approved. Please keep the Reference ID safe.</p>`
                    : `<p style="color: #4b5563; margin: 0 0 24px 0; font-size: 14px; line-height: 1.6;">If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance with your Reference ID.</p>`
                }
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">This is an automated message from Awasthi Dental Clinic. Please do not reply directly to this email.</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Awasthi Dental Clinic <onboarding@resend.dev>",
          to: [appt.patient_email],
          subject: subject,
          html: htmlContent,
        }),
      });

      if (logFile && fs) {
        fs.appendFileSync(logFile, `Resend API Status: ${response.status}\n`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown Resend error" }));
        console.error("Resend API Error:", errorData);
        if (logFile && fs) {
          fs.appendFileSync(logFile, `Resend API Error Data: ${JSON.stringify(errorData)}\n`);
        }

        // Log failed email attempt to sent_emails table
        try {
          await supabase.from("sent_emails").insert({
            appointment_id: appt.id || null,
            recipient: appt.patient_email,
            subject: subject,
            body: htmlContent,
            status: "failed",
            error_message: JSON.stringify(errorData),
          });
        } catch (logErr) {
          console.error("Failed to write failed log to sent_emails:", logErr);
        }

        return false;
      }

      const data = await response.json();
      console.log("Resend Email Sent Successfully:", data);
      if (logFile && fs) {
        fs.appendFileSync(logFile, `SUCCESS: Email sent successfully!\nResponse data: ${JSON.stringify(data)}\n`);
      }

      // Log successful email transmission to sent_emails table
      try {
        await supabase.from("sent_emails").insert({
          appointment_id: appt.id || null,
          recipient: appt.patient_email,
          subject: subject,
          body: htmlContent,
          status: "sent",
        });
      } catch (logErr) {
        console.error("Failed to write success log to sent_emails:", logErr);
      }
      
      // Log the notification in Supabase database
      try {
        // Find patient_id if not supplied
        let resolvedPatientId: string | null = null;
        if (appt.id) {
          const { data: dbAppt } = await supabase
            .from("appointments")
            .select("patient_id")
            .eq("id", appt.id)
            .single();
          if (dbAppt) {
            resolvedPatientId = dbAppt.patient_id;
          }
        }

        // Insert database notification log with allowed template type
        await supabase.from("notification_logs").insert({
          appointment_id: appt.id || null,
          patient_id: resolvedPatientId,
          channel: "email",
          template_type: "booking_confirmation",
          recipient: appt.patient_email,
          sent_status: "sent",
          sent_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.error("Failed to write to notification_logs:", dbErr);
      }

      return true;
    } catch (err: any) {
      console.error("Failed to send email through Resend:", err);
      if (logFile && fs) {
        fs.appendFileSync(logFile, `EXCEPTION CAUGHT: ${err?.message || String(err)}\n`);
      }
      // Log failed email attempt due to exception to sent_emails table
      try {
        await supabase.from("sent_emails").insert({
          appointment_id: appt.id || null,
          recipient: appt.patient_email,
          subject: subject,
          body: htmlContent,
          status: "failed",
          error_message: err?.message || String(err),
        });
      } catch (logErr) {
        console.error("Failed to write exception log to sent_emails:", logErr);
      }
      return false;
    }
  });

export async function sendAppointmentEmail(
  appt: {
    id?: string;
    reference_id: string;
    patient_name: string;
    patient_phone?: string;
    patient_email: string | null;
    service: string;
    doctor_name: string | null;
    scheduled_at: string;
    notes?: string | null;
  },
  type: AppointmentEmailType
): Promise<boolean> {
  return sendEmailRpc({ appt, type });
}

