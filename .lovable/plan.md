# Dental Clinic Staff Backend

Build a complete staff-only admin dashboard powered by Lovable Cloud (Supabase under the hood) with authentication, database, storage, and role-based access.

## 1. Enable Lovable Cloud
Provision backend (DB, auth, storage) for the project.

## 2. Database schema (migrations)

**Roles & access**
- `app_role` enum: `admin`, `doctor`, `staff`
- `user_roles` table (separate from profiles — security best practice) + `has_role()` security-definer function
- `profiles` table (id → auth.users, full_name, email, avatar_url)
- Trigger: auto-create profile on signup

**Clinic data**
- `doctors` — name, specialty, color_code, photo_url, bio, email, phone, active
- `patients` — full_name, email, phone, dob, gender, address, insurance_provider, insurance_number, medical_notes, created_by
- `appointments` — patient_id, doctor_id, service, scheduled_at, duration_min, status (pending/approved/completed/cancelled), notes, reference_id, created_by
- `treatment_plans` — patient_id, doctor_id, appointment_id (nullable), title, description, status, notes
- `treatment_documents` — plan_id, file_path, file_name, uploaded_by (links to storage)
- `contact_messages` — name, email, phone, subject, message, status (new/read/archived), created_at

**RLS policies**
- Only authenticated users with role `admin`/`staff`/`doctor` can read/write clinic data
- Public can INSERT into `appointments` (booking) and `contact_messages` (enquiry)
- Doctors can only edit their own treatment plans; admins/staff full access

**Storage buckets**
- `treatment-docs` (private) — X-rays, documents
- `doctor-photos` (public) — doctor avatars

## 3. Authentication
- Staff-only login at `/staff/login` (email + password, no public signup UI)
- `_staff` layout route guard — redirect to login if not authenticated OR not in `user_roles`
- Auth state listener with cache invalidation
- Logout button in dashboard header

## 4. Staff Dashboard pages (`/staff/*`)

| Route | Purpose |
|---|---|
| `/staff` | **Dashboard** — stat cards: active doctors, active patients, today's appointments, new messages |
| `/staff/appointments` | List + filter by status/date, approve/edit/delete, "Add appointment" dialog, daily & monthly calendar views |
| `/staff/calendar` | Full calendar view (month/week/day) with color-coded doctor slots |
| `/staff/messages` | Contact form submissions — view, mark read, delete |
| `/staff/doctors` | Add/edit doctors with specialty + color picker + photo upload |
| `/staff/patients` | List + search patients, add/edit, click → patient detail |
| `/staff/patients/$id` | Patient record: profile, appointments history, treatment plans, documents, insurance |
| `/staff/treatments` | Create/edit treatment plans, link to appointment, upload docs, add notes |

## 5. Confirmation emails
- Server function: when staff approves an appointment → send confirmation email to patient via Lovable Emails
- Includes appointment reference ID, date/time, doctor name, clinic address

## 6. Wire existing public forms to DB
- Existing `BookingDialog` / `AppointmentForm` → INSERT into `appointments` (status='pending')
- Contact page enquiry form → INSERT into `contact_messages`
- Existing doctor list on home page → read from `doctors` table (fallback to seed data)

## 7. Initial seed
- Seed current static doctors from `src/data/doctors.ts` into DB
- Note for user to create first admin account, then I'll grant the role

---

## Technical notes
- All staff routes under `_staff` pathless layout with `beforeLoad` auth+role check
- Server functions (`createServerFn` + `requireSupabaseAuth`) for any privileged ops + email sending
- Public booking/enquiry inserts allowed via RLS policy (no auth)
- Email sending requires Lovable Emails domain setup — I'll prompt for that when wiring confirmations
- Calendar: use existing `react-day-picker` for month view, custom timeline for daily
- All UI uses existing design tokens / shadcn components — matches current site theme

## Out of scope (ask if you want)
- Billing/invoicing
- SMS/WhatsApp notifications
- Multi-clinic support
- Patient self-service portal
