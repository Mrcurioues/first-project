import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/staff/doctors")({
  component: DoctorsPage,
});

type Doctor = {
  id: string;
  name: string;
  role: string | null;
  specialty: string | null;
  qualifications: string | null;
  experience: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  color_code: string;
  consultation_fee: number;
  specialties: string[];
  active: boolean;
};

type Shift = {
  id: string;
  doctor_id: string;
  shift_date?: string;
  day_of_week?: number;
  shift_start: string;
  shift_end: string;
  is_active: boolean;
};

type Blocking = {
  id: string;
  doctor_id: string | null;
  start_at: string;
  end_at: string;
  block_type: string;
  reason: string | null;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [blockings, setBlockings] = useState<Blocking[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState<Record<string, { count: number; revenue: number }>>({});

  // Doctor Form State
  const [form, setForm] = useState<Partial<Doctor>>({
    name: "",
    role: "",
    specialty: "",
    qualifications: "",
    experience: "",
    bio: "",
    email: "",
    phone: "",
    color_code: "#3b82f6",
    consultation_fee: 500,
    specialties: [],
    active: true,
  });

  // Shift & Blocking Modal States
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    shift_date: new Date().toISOString().split("T")[0],
    shift_start: "09:00",
    shift_end: "17:00",
  });

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    start_at: "",
    end_at: "",
    block_type: "lunch_break",
    reason: "",
  });

  async function loadData() {
    setLoading(true);
    try {
      const [docRes, shiftRes, blockRes, apptRes, billRes] = await Promise.all([
        supabase.from("doctors").select("*").order("name"),
        supabase.from("doctor_shifts").select("*"),
        supabase.from("calendar_blockings").select("*").order("start_at", { ascending: false }),
        supabase.from("appointments").select("doctor_id, status"),
        supabase.from("billing_invoices").select("appointment_id, final_amount, paid_amount, appointments(doctor_id)"),
      ]);

      if (docRes.error) throw docRes.error;
      setDoctors((docRes.data as Doctor[]) ?? []);
      setShifts((shiftRes.data as Shift[]) ?? []);
      setBlockings((blockRes.data as Blocking[]) ?? []);

      // Calculate simple mock/real stats
      const tempStats: Record<string, { count: number; revenue: number }> = {};
      
      // Default empty stats for all
      (docRes.data ?? []).forEach((d) => {
        tempStats[d.id] = { count: 0, revenue: 0 };
      });

      // Count appointments
      (apptRes.data ?? []).forEach((a) => {
        if (a.doctor_id && tempStats[a.doctor_id]) {
          tempStats[a.doctor_id].count += 1;
        }
      });

      // Sum revenue
      (billRes.data ?? []).forEach((b: any) => {
        const doctorId = b.appointments?.doctor_id;
        if (doctorId && tempStats[doctorId]) {
          tempStats[doctorId].revenue += Number(b.paid_amount || 0);
        }
      });

      setStats(tempStats);

      if (docRes.data && docRes.data.length > 0 && !selectedDoctor) {
        setSelectedDoctor(docRes.data[0] as Doctor);
      }
    } catch (err: any) {
      toast.error("Failed to load doctors: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      setForm(selectedDoctor);
    } else {
      setForm({
        name: "",
        role: "",
        specialty: "",
        qualifications: "",
        experience: "",
        bio: "",
        email: "",
        phone: "",
        color_code: "#3b82f6",
        consultation_fee: 500,
        specialties: [],
        active: true,
      });
    }
  }, [selectedDoctor, editMode]);

  async function saveDoctor(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required");

    const payload = {
      name: form.name,
      role: form.role || null,
      specialty: form.specialty || null,
      qualifications: form.qualifications || null,
      experience: form.experience || null,
      bio: form.bio || null,
      email: form.email || null,
      phone: form.phone || null,
      color_code: form.color_code || "#3b82f6",
      consultation_fee: Number(form.consultation_fee || 500),
      specialties: form.specialties || [],
      active: form.active ?? true,
    };

    try {
      if (selectedDoctor && !editMode) {
        // Just detail view, ignore
        return;
      }

      if (selectedDoctor && editMode) {
        // Update
        const { error } = await supabase.from("doctors").update(payload).eq("id", selectedDoctor.id);
        if (error) throw error;
        toast.success("Doctor profile updated successfully!");
        setEditMode(false);
      } else {
        // Create new
        const { data, error } = await supabase.from("doctors").insert([payload]).select();
        if (error) throw error;
        toast.success("New doctor profile created!");
        if (data && data[0]) {
          setSelectedDoctor(data[0] as Doctor);
        }
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function deleteDoctor(id: string) {
    if (!confirm("Are you sure you want to delete this doctor profile? This will not delete historical appointments but will remove availability.")) return;
    try {
      const { error } = await supabase.from("doctors").delete().eq("id", id);
      if (error) throw error;
      toast.success("Doctor profile deleted.");
      setSelectedDoctor(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function addShift(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDoctor) return;
    if (!shiftForm.shift_date) return toast.error("Date is required");
    try {
      const { error } = await supabase.from("doctor_shifts").insert([
        {
          doctor_id: selectedDoctor.id,
          shift_date: shiftForm.shift_date,
          shift_start: shiftForm.shift_start,
          shift_end: shiftForm.shift_end,
          is_active: true,
        },
      ]);
      if (error) throw error;
      toast.success("Shift timing added!");
      setShowShiftModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function removeShift(id: string) {
    try {
      const { error } = await supabase.from("doctor_shifts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Shift removed");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function addBlocking(e: React.FormEvent) {
    e.preventDefault();
    if (!blockForm.start_at || !blockForm.end_at) return toast.error("Dates are required");
    try {
      const { error } = await supabase.from("calendar_blockings").insert([
        {
          doctor_id: selectedDoctor?.id || null, // Null means clinic-wide off-day
          start_at: new Date(blockForm.start_at).toISOString(),
          end_at: new Date(blockForm.end_at).toISOString(),
          block_type: blockForm.block_type,
          reason: blockForm.reason || null,
        },
      ]);
      if (error) throw error;
      toast.success("Calendar blocking scheduled!");
      setShowBlockModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function removeBlocking(id: string) {
    try {
      const { error } = await supabase.from("calendar_blockings").delete().eq("id", id);
      if (error) throw error;
      toast.success("Schedule blocking removed");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-accent">Doctor & Shift Management</h1>
          <p className="text-sm text-muted-foreground">Manage doctor profiles, standard shifts, and vacation blocks.</p>
        </div>
        <Button
          onClick={() => {
            setSelectedDoctor(null);
            setEditMode(true);
          }}
          className="bg-gradient-warm hover:opacity-90 text-primary-foreground font-semibold flex gap-2 items-center rounded-full px-5"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Left Side: Doctor List */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft space-y-3">
          <h3 className="font-semibold text-accent text-sm px-2 uppercase tracking-wider">Clinicians</h3>
          {loading && doctors.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Loading doctors...</div>
          ) : (
            <div className="space-y-1">
              {doctors.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDoctor(d);
                    setEditMode(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition ${
                    selectedDoctor?.id === d.id
                      ? "bg-accent/5 border-l-4 border-primary text-accent font-semibold"
                      : "text-foreground hover:bg-muted/50 border-l-4 border-transparent"
                  } ${!d.active ? "opacity-75" : ""}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: d.active ? d.color_code : "#9ca3af" }}
                    />
                    <div>
                      <div className="text-sm leading-snug flex items-center gap-1.5">
                        {d.name}
                        {!d.active && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-red-500/10 text-red-600 border border-red-500/20 rounded-full font-bold">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{d.specialty || d.role}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Doctor Profile Details, Shift Settings & Blocks */}
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-soft space-y-6 relative overflow-hidden">
            {/* Visual background element */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border pb-5 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-accent">
                    {selectedDoctor ? selectedDoctor.name : "Add New Doctor Profile"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedDoctor ? `${selectedDoctor.role || "Clinician"} · ${selectedDoctor.experience || "Fresh practice"}` : "Fill out doctor details below"}
                  </p>
                </div>
              </div>
              {selectedDoctor && (
                <div className="flex items-center gap-2">
                  {/* Status Toggle Button */}
                  <Button
                    variant={selectedDoctor.active ? "default" : "secondary"}
                    size="sm"
                    onClick={async () => {
                      try {
                        const newStatus = !selectedDoctor.active;
                        const { error } = await supabase
                          .from("doctors")
                          .update({ active: newStatus })
                          .eq("id", selectedDoctor.id);
                        if (error) throw error;
                        toast.success(`Dr. ${selectedDoctor.name} is now ${newStatus ? "Active & Available" : "Inactive & Unavailable"}`);
                        loadData();
                        setSelectedDoctor({ ...selectedDoctor, active: newStatus });
                      } catch (err: any) {
                        toast.error("Failed to toggle status: " + err.message);
                      }
                    }}
                    className={`rounded-xl flex gap-1 items-center font-bold text-xs h-9 px-3 transition-all ${
                      selectedDoctor.active
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 border border-emerald-500/25"
                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 border border-red-500/25"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedDoctor.active ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                    {selectedDoctor.active ? "Active" : "Inactive"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className="flex gap-1.5 items-center rounded-xl h-9"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> {editMode ? "Cancel" : "Edit Details"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDoctor(selectedDoctor.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl h-9 w-9 p-0 flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={saveDoctor} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Full Name</label>
                  <Input
                    disabled={selectedDoctor !== null && !editMode}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Rajesh Kumar"
                    className="rounded-xl border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-accent">Color Code</label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        disabled={selectedDoctor !== null && !editMode}
                        value={form.color_code}
                        onChange={(e) => setForm({ ...form, color_code: e.target.value })}
                        className="w-10 h-10 p-0.5 rounded-lg border border-border cursor-pointer flex-shrink-0"
                      />
                      <Input
                        disabled={selectedDoctor !== null && !editMode}
                        value={form.color_code}
                        onChange={(e) => setForm({ ...form, color_code: e.target.value })}
                        className="rounded-xl border-border font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-accent">Consultation Fee (₹)</label>
                    <Input
                      type="number"
                      disabled={selectedDoctor !== null && !editMode}
                      value={form.consultation_fee}
                      onChange={(e) => setForm({ ...form, consultation_fee: Number(e.target.value) })}
                      placeholder="500"
                      className="rounded-xl border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Role / Title</label>
                  <Input
                    disabled={selectedDoctor !== null && !editMode}
                    value={form.role || ""}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Chief Orthodontist"
                    className="rounded-xl border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Primary Specialty</label>
                  <Input
                    disabled={selectedDoctor !== null && !editMode}
                    value={form.specialty || ""}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    placeholder="Orthodontics"
                    className="rounded-xl border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Qualifications</label>
                  <Input
                    disabled={selectedDoctor !== null && !editMode}
                    value={form.qualifications || ""}
                    onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                    placeholder="BDS, MDS (Mumbai University)"
                    className="rounded-xl border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Experience</label>
                  <Input
                    disabled={selectedDoctor !== null && !editMode}
                    value={form.experience || ""}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="12+ years"
                    className="rounded-xl border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Contact Email</label>
                  <Input
                    type="email"
                    disabled={selectedDoctor !== null && !editMode}
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="rajesh@smiledental.com"
                    className="rounded-xl border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Contact Phone</label>
                  <Input
                    disabled={selectedDoctor !== null && !editMode}
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="rounded-xl border-border"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Professional Biography</label>
                <Textarea
                  disabled={selectedDoctor !== null && !editMode}
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell patients about their expertise, values and background..."
                  className="rounded-xl border-border min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active_checkbox"
                  disabled={selectedDoctor !== null && !editMode}
                  checked={form.active ?? true}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded text-primary border-border focus:ring-primary w-4 h-4"
                />
                <label htmlFor="active_checkbox" className="text-xs font-medium text-accent">
                  Active & Available for appointments
                </label>
              </div>

              {(!selectedDoctor || editMode) && (
                <div className="pt-2">
                  <Button type="submit" className="bg-primary text-primary-foreground font-semibold rounded-xl">
                    Save Profile Changes
                  </Button>
                </div>
              )}
            </form>
          </div>


          {/* Standard Availability Shift Timings */}
          {selectedDoctor && (
            <div className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-accent flex gap-2 items-center">
                    <Clock className="w-5 h-5 text-primary" /> Day Shift
                  </h3>
                  <p className="text-xs text-muted-foreground">Standard daily working hours</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowShiftModal(true)}
                  className="rounded-xl border border-border flex gap-1.5 items-center bg-muted/40 hover:bg-muted text-foreground"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Shift
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-xs uppercase text-accent font-semibold">
                    <tr>
                      <th className="px-4 py-2 rounded-l-lg">Day/Date</th>
                      <th className="px-4 py-2">Start Time</th>
                      <th className="px-4 py-2">End Time</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts
                      .filter((s) => s.doctor_id === selectedDoctor.id)
                      .map((s) => (
                        <tr key={s.id} className="border-b border-border/50">
                          <td className="px-4 py-3 font-medium text-accent">
                            {s.shift_date ? (() => {
                              try {
                                const parsedDate = new Date(s.shift_date);
                                if (!isNaN(parsedDate.getTime())) {
                                  return format(parsedDate, "dd MMM yyyy");
                                }
                              } catch (e) {
                                // fallback
                              }
                              return "Invalid Date";
                            })() : (s.day_of_week !== undefined && s.day_of_week !== null && s.day_of_week >= 0 && s.day_of_week < 7 ? DAYS[s.day_of_week] : "No Date/Day")}
                          </td>
                          <td className="px-4 py-3">{s.shift_start.slice(0, 5)}</td>
                          <td className="px-4 py-3">{s.shift_end.slice(0, 5)}</td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const newStatus = !s.is_active;
                                  const { error } = await supabase
                                    .from("doctor_shifts")
                                    .update({ is_active: newStatus })
                                    .eq("id", s.id);
                                  if (error) throw error;
                                  toast.success(`Shift is now ${newStatus ? "Active" : "Inactive"}`);
                                  loadData();
                                } catch (err: any) {
                                  toast.error("Failed to toggle shift status: " + err.message);
                                }
                              }}
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold h-6 transition-all ${
                                s.is_active
                                  ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${s.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                              {s.is_active ? "Active" : "Inactive"}
                            </Button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeShift(s.id)}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    {shifts.filter((s) => s.doctor_id === selectedDoctor.id).length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-muted-foreground text-xs">
                           No shifts defined. Doctor defaults to unavailable.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Block Calendar Settings (Vacations, Holidays) */}
          {selectedDoctor && (
            <div className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-accent flex gap-2 items-center">
                    <ShieldAlert className="w-5 h-5 text-red-500" /> Holiday & Off Blocks
                  </h3>
                  <p className="text-xs text-muted-foreground">Block scheduling for lunch, vacation, or emergency off</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowBlockModal(true)}
                  className="rounded-xl border border-border flex gap-1.5 items-center bg-muted/40 hover:bg-muted text-foreground"
                >
                  <Plus className="w-3.5 h-3.5" /> Block Schedule
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-xs uppercase text-accent font-semibold">
                    <tr>
                      <th className="px-4 py-2 rounded-l-lg">Type</th>
                      <th className="px-4 py-2">Start Time</th>
                      <th className="px-4 py-2">End Time</th>
                      <th className="px-4 py-2">Reason</th>
                      <th className="px-4 py-2 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockings
                      .filter((b) => b.doctor_id === null || b.doctor_id === selectedDoctor.id)
                      .map((b) => (
                        <tr key={b.id} className="border-b border-border/50">
                          <td className="px-4 py-3">
                            <Badge variant={b.doctor_id === null ? "destructive" : "secondary"}>
                              {b.doctor_id === null ? "Clinic Wide" : ""} {b.block_type.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {new Date(b.start_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {new Date(b.end_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground italic max-w-[150px] truncate">
                            {b.reason || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeBlocking(b.id)}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    {blockings.filter((b) => b.doctor_id === null || b.doctor_id === selectedDoctor.id).length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-muted-foreground text-xs">
                          No schedule blockings or holidays scheduled.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SHIFT MODAL */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-warm space-y-4">
            <h3 className="text-lg font-bold text-accent flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Define Shift Hours
            </h3>
            <form onSubmit={addShift} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Date</label>
                <Input
                  type="date"
                  value={shiftForm.shift_date}
                  onChange={(e) => setShiftForm({ ...shiftForm, shift_date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Shift Start</label>
                  <Input
                    type="time"
                    value={shiftForm.shift_start}
                    onChange={(e) => setShiftForm({ ...shiftForm, shift_start: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Shift End</label>
                  <Input
                    type="time"
                    value={shiftForm.shift_end}
                    onChange={(e) => setShiftForm({ ...shiftForm, shift_end: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowShiftModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Add Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOCK SCHEDULE MODAL */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-warm space-y-4">
            <h3 className="text-lg font-bold text-accent flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Block Calendar
            </h3>
            <form onSubmit={addBlocking} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Block Type</label>
                <select
                  value={blockForm.block_type}
                  onChange={(e) => setBlockForm({ ...blockForm, block_type: e.target.value })}
                  className="w-full rounded-xl border border-border p-2 bg-card text-foreground text-sm"
                >
                  <option value="lunch_break">Lunch Break</option>
                  <option value="weekly_off">Weekly Off</option>
                  <option value="holiday">Holiday (Clinic Wide)</option>
                  <option value="vacation">Doctor Vacation</option>
                  <option value="emergency_closure">Emergency Closure</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Start At</label>
                <Input
                  type="datetime-local"
                  value={blockForm.start_at}
                  onChange={(e) => setBlockForm({ ...blockForm, start_at: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">End At</label>
                <Input
                  type="datetime-local"
                  value={blockForm.end_at}
                  onChange={(e) => setBlockForm({ ...blockForm, end_at: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Reason / Note</label>
                <Input
                  value={blockForm.reason}
                  placeholder="Clinic renovation, personal emergency..."
                  onChange={(e) => setForm({ ...form })}
                  onChangeCapture={(e: any) => setBlockForm({ ...blockForm, reason: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowBlockModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                  Block Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
