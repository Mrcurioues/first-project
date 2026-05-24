import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { syncUnlinkedAppointments } from "@/lib/booking-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Users,
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Tag,
  History,
  FileText,
  DollarSign,
  PlusCircle,
  Stethoscope,
  Trash2,
  Share2,
  FileImage,
  Clock,
  Printer,
  ChevronRight,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/staff/patients")({
  component: PatientsCRMPage,
});

type Patient = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  dob: string | null;
  gender: string | null;
  address: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  medical_notes: string | null;
  notes: string | null;
  primary_doctor_id: string | null;
  primary_service: string | null;
  tags: string[];
  created_at?: string;
};

type Doctor = { id: string; name: string };



type Invoice = {
  id: string;
  invoice_number: string;
  total_amount: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  final_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string;
  due_date: string | null;
  created_at: string;
  payments?: Payment[];
};

type Payment = {
  id: string;
  amount: number;
  payment_method: string;
  transaction_ref: string | null;
  created_at: string;
};

type FamilyLink = {
  relative_id: string;
  relative_name: string;
  relative_phone: string;
  relationship: string;
};

type Appointment = {
  id: string;
  reference_id: string;
  patient_id: string | null;
  doctor_id: string | null;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  doctor_name: string | null;
  service: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
  booking_channel: string;
  room_chair: string | null;
  notes: string | null;
  created_at: string;
};



function PatientsCRMPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "billing" | "appointments">("profile");
  const [loading, setLoading] = useState(true);

  // Lists for detail view
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [family, setFamily] = useState<FamilyLink[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Patient Creation Form Modal
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patForm, setPatForm] = useState<Partial<Patient>>({
    full_name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "Male",
    address: "",
    insurance_provider: "",
    insurance_number: "",
    medical_notes: "",
    notes: "",
    primary_doctor_id: null,
    primary_service: "General & Preventive Care",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");

  // Invoice creation dialog state
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [invForm, setInvForm] = useState({
    treatment: "Scaling & Polishing",
    total_amount: 1500,
    discount_amount: 0,
    tax_rate: 18, // GST
  });

  // Pay invoice state
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_method: "upi",
    transaction_ref: "",
  });

  // Print Invoice Modal State
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  // Edit payment state
  const [editingPayment, setEditingPayment] = useState<{
    id: string;
    invoice_id: string;
    invoice_number: string;
    amount: number;
    payment_method: string;
    transaction_ref: string;
  } | null>(null);

  // Family linking state
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familyForm, setFamilyForm] = useState({
    relative_id: "",
    relationship: "Spouse",
  });

  // Load patient list and doctors
  async function loadInitial() {
    setLoading(true);
    try {
      // Sync any unlinked appointments to automatically register patient CRM profiles
      await syncUnlinkedAppointments();

      const [patRes, docRes] = await Promise.all([
        supabase.from("patients").select("*").order("full_name"),
        supabase.from("doctors").select("id, name").order("name"),
      ]);
      if (patRes.error) throw patRes.error;
      const formatted = (patRes.data ?? []).map((p) => ({
        ...p,
        tags: p.tags ?? [],
      }));
      setPatients(formatted);
      setDoctors(docRes.data ?? []);

      if (patRes.data && patRes.data.length > 0 && !selectedPatient) {
        setSelectedPatient({
          ...patRes.data[0],
          tags: patRes.data[0].tags ?? [],
        });
      }
    } catch (err: any) {
      toast.error("Error loading CRM data: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitial();
  }, []);

  // Fetch sub-data whenever selected patient changes
  async function loadPatientDetails(patientId: string) {
    try {
      // 1. Billing Invoices
      const { data: invs } = await supabase
        .from("billing_invoices")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      const invoiceIds = (invs ?? []).map((i) => i.id);
      let paymentsMap: Record<string, Payment[]> = {};

      if (invoiceIds.length > 0) {
        const { data: txs } = await supabase
          .from("payment_transactions")
          .select("*")
          .in("invoice_id", invoiceIds)
          .order("created_at", { ascending: true });
        
        (txs ?? []).forEach((t) => {
          if (!paymentsMap[t.invoice_id]) paymentsMap[t.invoice_id] = [];
          paymentsMap[t.invoice_id].push(t as Payment);
        });
      }

      setInvoices(
        (invs ?? []).map((i) => ({
          ...i,
          payments: paymentsMap[i.id] ?? [],
        })) as Invoice[]
      );

      // 4. Family Links
      const { data: fam1 } = await supabase
        .from("patient_family_links")
        .select("relationship, relative:relative_id(id, full_name, phone)")
        .eq("patient_id", patientId);

      const links: FamilyLink[] = (fam1 ?? []).map((f: any) => ({
        relative_id: f.relative.id,
        relative_name: f.relative.full_name,
        relative_phone: f.relative.phone,
        relationship: f.relationship,
      }));
      setFamily(links);

      // 5. Patient Appointments
      const { data: appts, error: apptsErr } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patientId)
        .order("scheduled_at", { ascending: false });
      
      if (!apptsErr && appts) {
        setAppointments(appts as Appointment[]);
      } else {
        setAppointments([]);
      }
    } catch (err: any) {
      toast.error("Failed to load patient sub-records: " + err.message);
    }
  }

  useEffect(() => {
    if (selectedPatient) {
      loadPatientDetails(selectedPatient.id);

      // Subscribe to realtime updates on billing and declined payments
      const channelBilling = supabase
        .channel(`crm-billing-${selectedPatient.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "billing_invoices" },
          () => {
            console.log("Realtime billing update in CRM");
            loadPatientDetails(selectedPatient.id);
          }
        )
        .subscribe();

      const channelDeclined = supabase
        .channel(`crm-declined-${selectedPatient.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "declined_payments" },
          () => {
            console.log("Realtime declined update in CRM");
            loadPatientDetails(selectedPatient.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channelBilling);
        supabase.removeChannel(channelDeclined);
      };
    }
  }, [selectedPatient]);

  // Create Patient
  async function createPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!patForm.full_name || !patForm.phone) {
      return toast.error("Full Name and Phone are required!");
    }

    try {
      const { data, error } = await supabase
        .from("patients")
        .insert([
          {
            full_name: patForm.full_name,
            phone: patForm.phone,
            email: patForm.email || null,
            dob: patForm.dob || null,
            gender: patForm.gender || "Male",
            address: patForm.address || null,
            insurance_provider: patForm.insurance_provider || null,
            insurance_number: patForm.insurance_number || null,
            medical_notes: patForm.medical_notes || null,
            notes: patForm.notes || null,
            primary_doctor_id: patForm.primary_doctor_id || null,
            primary_service: patForm.primary_service || null,
            tags: patForm.tags || [],
          },
        ])
        .select();

      if (error) throw error;
      toast.success("New Patient added to CRM!");
      setShowAddPatient(false);
      
      // Reset form
      setPatForm({
        full_name: "",
        phone: "",
        email: "",
        dob: "",
        gender: "Male",
        address: "",
        insurance_provider: "",
        insurance_number: "",
        medical_notes: "",
        notes: "",
        primary_doctor_id: null,
        primary_service: "General & Preventive Care",
        tags: [],
      });

      // Reload and auto-select
      const reloaded = await supabase.from("patients").select("*").order("full_name");
      const formattedReloaded = (reloaded.data ?? []).map((p) => ({
        ...p,
        tags: p.tags ?? [],
      }));
      setPatients(formattedReloaded);
      if (data && data[0]) {
        setSelectedPatient({
          ...data[0],
          tags: data[0].tags ?? [],
        });
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  }



  // Create Invoice
  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatient) return;

    const total = Number(invForm.total_amount);
    const discount = Number(invForm.discount_amount);
    const taxRate = Number(invForm.tax_rate);
    const taxable = total - discount;
    const tax = Number(((taxable * taxRate) / 100).toFixed(2));
    const finalAmount = taxable + tax;

    const invNum = `INV-${Date.now().toString().slice(-6)}`;

    try {
      const { error } = await supabase.from("billing_invoices").insert([
        {
          patient_id: selectedPatient.id,
          invoice_number: invNum,
          total_amount: total,
          discount_amount: discount,
          tax_rate: taxRate,
          tax_amount: tax,
          final_amount: finalAmount,
          paid_amount: 0,
          status: "unpaid",
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], // 7 days due
        },
      ]);

      if (error) throw error;
      toast.success(`Generated Invoice ${invNum}`);
      setShowAddInvoice(false);
      loadPatientDetails(selectedPatient.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Record Payment
  async function savePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!activeInvoice) return;
    const amt = Number(paymentForm.amount);
    if (amt <= 0) return toast.error("Enter a valid payment amount");

    try {
      // 1. Log Payment Transaction
      const { error: txErr } = await supabase.from("payment_transactions").insert([
        {
          invoice_id: activeInvoice.id,
          amount: amt,
          payment_method: paymentForm.payment_method,
          transaction_ref: paymentForm.transaction_ref || null,
        },
      ]);
      if (txErr) throw txErr;

      // 2. Calculate updated paid amount
      const newPaid = Number(activeInvoice.paid_amount) + amt;
      const status = newPaid >= Number(activeInvoice.final_amount) ? "paid" : "partial";

      const { error: invErr } = await supabase
        .from("billing_invoices")
        .update({ paid_amount: newPaid, status })
        .eq("id", activeInvoice.id);

      if (invErr) throw invErr;

      toast.success("Payment registered successfully!");
      setActiveInvoice(null);
      setPaymentForm({ amount: 0, payment_method: "upi", transaction_ref: "" });
      if (selectedPatient) loadPatientDetails(selectedPatient.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Link Family Member
  async function linkFamilyMember(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatient || !familyForm.relative_id) return;

    try {
      const { error } = await supabase.from("patient_family_links").insert([
        {
          patient_id: selectedPatient.id,
          relative_id: familyForm.relative_id,
          relationship: familyForm.relationship,
        },
      ]);
      if (error) throw error;
      toast.success("Family connection established!");
      setShowFamilyModal(false);
      loadPatientDetails(selectedPatient.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Unlink Family Member
  async function unlinkFamilyMember(relativeId: string) {
    if (!selectedPatient) return;

    try {
      const { error } = await supabase
        .from("patient_family_links")
        .delete()
        .eq("patient_id", selectedPatient.id)
        .eq("relative_id", relativeId);

      if (error) throw error;
      toast.success("Family connection removed!");
      loadPatientDetails(selectedPatient.id);
    } catch (err: any) {
      toast.error("Failed to remove connection: " + err.message);
    }
  }

  // Cancel/Delete Payment Transaction
  async function cancelPayment(invoice: Invoice, paymentId: string) {
    const confirmation = window.confirm("Are you sure you want to cancel and delete this payment transaction? This will increase the outstanding due amount on the invoice.");
    if (!confirmation) return;

    try {
      // 1. Delete Transaction from payment_transactions
      const { error: delErr } = await supabase
        .from("payment_transactions")
        .delete()
        .eq("id", paymentId);

      if (delErr) throw delErr;

      // 2. Fetch all remaining transactions for this invoice to recalculate paid_amount
      const { data: txs, error: txsErr } = await supabase
        .from("payment_transactions")
        .select("amount")
        .eq("invoice_id", invoice.id);

      if (txsErr) throw txsErr;

      const newPaid = (txs ?? []).reduce((sum, tx) => sum + Number(tx.amount), 0);
      const status = newPaid >= Number(invoice.final_amount) 
        ? "paid" 
        : newPaid > 0 
          ? "partial" 
          : "unpaid";

      // 3. Update the invoice status and paid amount
      const { error: invErr } = await supabase
        .from("billing_invoices")
        .update({ paid_amount: newPaid, status })
        .eq("id", invoice.id);

      if (invErr) throw invErr;

      toast.success("Payment transaction cancelled successfully!");
      if (selectedPatient) loadPatientDetails(selectedPatient.id);
    } catch (err: any) {
      toast.error("Failed to cancel payment: " + err.message);
    }
  }

  // Decline Outstanding Dues
  async function declineInvoiceDues(invoice: Invoice) {
    if (!selectedPatient) return;
    const confirmation = window.confirm(
      `Are you sure you want to decline / cancel outstanding dues (₹${invoice.due_amount}) for invoice ${invoice.invoice_number}?`
    );

    if (!confirmation) return;

    try {
      // 1. Update the billing invoice status to 'declined'
      const { error: invErr } = await supabase
        .from("billing_invoices")
        .update({ status: "declined" })
        .eq("id", invoice.id);

      if (invErr) throw invErr;

      // 2. Insert log into declined_payments table
      const { error: logErr } = await supabase
        .from("declined_payments")
        .insert([
          {
            invoice_id: invoice.id,
            patient_id: selectedPatient.id,
            patient_name: selectedPatient.full_name,
            invoice_number: invoice.invoice_number,
            declined_amount: Number(invoice.due_amount),
            reason: "Declined directly by staff",
          }
        ]);

      if (logErr) throw logErr;

      toast.success(`Outstanding dues declined for invoice ${invoice.invoice_number}`);
      loadPatientDetails(selectedPatient.id);
    } catch (err: any) {
      toast.error("Failed to decline dues: " + err.message);
    }
  }

  // Start Editing Payment
  function handleStartEditPayment(invoice: Invoice, payment: Payment) {
    setEditingPayment({
      id: payment.id,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: payment.amount,
      payment_method: payment.payment_method,
      transaction_ref: payment.transaction_ref || "",
    });
  }

  // Handle Edit Payment Submission
  async function saveEditedPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPayment) return;
    const amt = Number(editingPayment.amount);
    if (amt <= 0) return toast.error("Enter a valid payment amount");

    try {
      // 1. Update the payment transaction in the DB
      const { error: txErr } = await supabase
        .from("payment_transactions")
        .update({
          amount: amt,
          payment_method: editingPayment.payment_method,
          transaction_ref: editingPayment.transaction_ref || null,
        })
        .eq("id", editingPayment.id);

      if (txErr) throw txErr;

      // 2. Fetch all transactions for this invoice to recalculate paid_amount
      const { data: txs, error: txsErr } = await supabase
        .from("payment_transactions")
        .select("amount")
        .eq("invoice_id", editingPayment.invoice_id);

      if (txsErr) throw txsErr;

      // Fetch invoice final_amount for status check
      const { data: invData, error: invDataErr } = await supabase
        .from("billing_invoices")
        .select("final_amount")
        .eq("id", editingPayment.invoice_id)
        .single();

      if (invDataErr) throw invDataErr;

      const newPaid = (txs ?? []).reduce((sum, tx) => sum + Number(tx.amount), 0);
      const status = newPaid >= Number(invData.final_amount)
        ? "paid"
        : newPaid > 0
          ? "partial"
          : "unpaid";

      // 3. Update the invoice paid_amount and status
      const { error: invErr } = await supabase
        .from("billing_invoices")
        .update({ paid_amount: newPaid, status })
        .eq("id", editingPayment.invoice_id);

      if (invErr) throw invErr;

      toast.success("Payment details updated successfully!");
      setEditingPayment(null);
      if (selectedPatient) loadPatientDetails(selectedPatient.id);
    } catch (err: any) {
      toast.error("Failed to update payment: " + err.message);
    }
  }



  const filteredPatients = patients.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(s) ||
      p.phone.includes(s) ||
      (p.email || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-accent">Patient CRM</h1>
          <p className="text-sm text-muted-foreground">Manage dental records, tooth charts, clinical notes & billing.</p>
        </div>
        <Button
          onClick={() => setShowAddPatient(true)}
          className="bg-gradient-warm hover:opacity-90 text-primary-foreground font-semibold flex gap-2 items-center rounded-full px-5"
        >
          <Plus className="w-4.5 h-4.5" /> Add Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Left Side: Search & Patient List */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute top-3 left-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone..."
              className="pl-9 rounded-xl border-border bg-muted/30"
            />
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredPatients.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPatient(p);
                  setActiveTab("profile");
                }}
                className={`w-full text-left p-3.5 rounded-xl transition border flex flex-col gap-1.5 ${
                  selectedPatient?.id === p.id
                    ? "bg-accent/5 border-primary shadow-xs"
                    : "hover:bg-muted/50 border-transparent"
                }`}
              >
                <div className="flex justify-between items-start gap-1 flex-wrap w-full">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-accent text-sm leading-snug">{p.full_name}</span>
                    {(() => {
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      const isNew = p.created_at ? new Date(p.created_at) >= thirtyDaysAgo : false;
                      return isNew ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full leading-none">
                          New
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full leading-none">
                          Repeat
                        </Badge>
                      );
                    })()}
                  </div>
                  {p.tags?.slice(0, 1).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" /> {p.phone}
                </div>
              </button>
            ))}
            {filteredPatients.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">No patients found.</div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Dashboard Card */}
        {selectedPatient ? (
          <div className="space-y-6">
            {/* Header snapshot */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-soft flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-warm rounded-2xl flex items-center justify-center text-primary-foreground font-black text-xl">
                  {selectedPatient.full_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-accent flex items-center gap-2 flex-wrap">
                    {selectedPatient.full_name}
                    {selectedPatient.gender && (
                      <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {selectedPatient.gender}
                      </span>
                    )}
                    {(() => {
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      const isNew = selectedPatient.created_at ? new Date(selectedPatient.created_at) >= thirtyDaysAgo : false;
                      return isNew ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          New Patient
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          Repeat Patient
                        </Badge>
                      );
                    })()}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedPatient.phone}</span>
                    {selectedPatient.email && (
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedPatient.email}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedPatient.tags.map((t) => (
                  <Badge key={t} className="bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-0.5 rounded-full">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border gap-2 flex-wrap">
              {(["profile", "billing", "appointments"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 px-4 font-bold text-sm border-b-2 transition uppercase tracking-wider ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-accent"
                  }`}
                >
                  {tab === "profile" && "Profile & Family"}
                  {tab === "billing" && "Billing & Invoices"}
                  {tab === "appointments" && "Appointments"}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-soft">
              {/* TAB 1: PROFILE & FAMILY */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                    <div className="space-y-3.5">
                      <h3 className="font-bold text-accent text-sm flex gap-2 items-center">
                        <User className="w-4 h-4 text-primary" /> General Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-border/50 py-1">
                          <span className="text-muted-foreground">Scheduled Time:</span>
                          <span className="font-medium text-accent">
                            {(() => {
                              const upcoming = appointments.find(a => a.status === "scheduled" || a.status === "confirmed");
                              const latest = upcoming || appointments[0];
                              return latest
                                ? format(new Date(latest.scheduled_at), "dd MMM yyyy · hh:mm a")
                                : "—";
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 py-1">
                          <span className="text-muted-foreground">Address:</span>
                          <span className="font-medium text-accent text-right max-w-[200px]">
                            {(() => {
                              if (selectedPatient.address) return selectedPatient.address;
                              const apptWithAddr = appointments.find(a => a.notes?.startsWith("Address: "));
                              if (apptWithAddr) {
                                const firstLine = (apptWithAddr.notes || "").split("\n")[0];
                                return firstLine.replace(/^Address:\s*/, "").trim() || "—";
                              }
                              return "—";
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 py-1">
                          <span className="text-muted-foreground">Insurance:</span>
                          <span className="font-medium text-accent">
                            {selectedPatient.insurance_provider
                              ? `${selectedPatient.insurance_provider} (${selectedPatient.insurance_number || "No Ref"})`
                              : "No Cover"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3.5">
                      <h3 className="font-bold text-accent text-sm flex gap-2 items-center">
                        <HeartPulse className="w-4 h-4 text-red-500" /> Medical & Dental Background
                      </h3>
                      <div className="space-y-2">
                        <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl text-xs text-red-700">
                          <strong className="font-bold block mb-1">Medical Conditions / Allergies:</strong>
                          {selectedPatient.medical_notes || "No reported systemic medical conditions."}
                        </div>
                        <div className="bg-muted/30 p-3 rounded-xl text-xs text-muted-foreground">
                          <strong className="font-bold block text-accent mb-1">General Notes:</strong>
                          {(() => {
                            // Try to get notes from the latest appointment's notes field
                            const latestAppt = appointments[0];
                            let apptNotes = "";
                            if (latestAppt?.notes) {
                              const lines = latestAppt.notes.split("\n");
                              // Strip "Address: ..." prefix line if present
                              if (lines[0]?.startsWith("Address: ")) {
                                apptNotes = lines.slice(1).join("\n").trim();
                              } else {
                                apptNotes = latestAppt.notes.trim();
                              }
                            }
                            return apptNotes || selectedPatient.notes || "No general receptionist notes logged.";
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Family Link Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-accent text-sm flex gap-2 items-center">
                        <Share2 className="w-4 h-4 text-blue-500" /> Linked Family Members
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowFamilyModal(true)}
                        className="rounded-xl flex gap-1 items-center"
                      >
                        <Plus className="w-3.5 h-3.5" /> Link Relative
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {family.map((f) => (
                        <div key={f.relative_id} className="border border-border p-3 rounded-2xl flex justify-between items-center bg-muted/20">
                          <div>
                            <div className="font-bold text-sm text-accent">{f.relative_name}</div>
                            <div className="text-xs text-muted-foreground">{f.relative_phone}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">{f.relationship}</Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => unlinkFamilyMember(f.relative_id)}
                              className="w-7 h-7 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg"
                              title="Unlink Relative"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {family.length === 0 && (
                        <div className="text-xs text-muted-foreground italic col-span-2">No linked family members.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}



              {/* TAB 4: BILLING & INVOICES */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-accent text-sm flex gap-2 items-center">
                        <DollarSign className="w-4 h-4 text-emerald-600" /> Account Invoices & Payments
                      </h3>
                      <p className="text-xs text-muted-foreground">Due amounts, invoices, GST billing calculations</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowAddInvoice(true)}
                      className="rounded-xl flex gap-1 items-center bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Plus className="w-3.5 h-3.5" /> Generate Invoice
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="border border-border p-5 rounded-3xl bg-card space-y-4 hover:shadow-soft transition">
                        <div className="flex justify-between items-start border-b border-border/50 pb-3 flex-wrap gap-2">
                          <div>
                            <div className="font-bold text-accent text-sm flex gap-2 items-center">
                              {inv.invoice_number}
                              <Badge
                                variant={
                                  inv.status === "paid"
                                    ? "default"
                                    : inv.status === "partial"
                                    ? "secondary"
                                    : inv.status === "declined"
                                    ? "outline"
                                    : "destructive"
                                }
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                  inv.status === "declined"
                                    ? "bg-muted text-muted-foreground border-muted-foreground/30"
                                    : ""
                                }`}
                              >
                                {inv.status}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              Issued: {new Date(inv.created_at).toLocaleDateString()} · Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "Immediate"}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-black text-accent">₹{inv.final_amount}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Paid: ₹{inv.paid_amount} · Due: ₹{inv.due_amount}
                            </div>
                          </div>
                        </div>

                        {/* Invoice transaction details */}
                        {inv.payments && inv.payments.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Receipts</span>
                            {inv.payments.map((p) => (
                              <div key={p.id} className="flex justify-between items-center text-xs py-1 border-b border-border/50 text-muted-foreground flex-wrap gap-2">
                                <span>
                                  ₹{p.amount} via <strong className="uppercase text-accent">{p.payment_method}</strong> ({p.transaction_ref || "Direct"})
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                                  <span className="text-border/60">|</span>
                                  <button
                                    onClick={() => handleStartEditPayment(inv, p)}
                                    className="text-blue-500 hover:text-blue-600 hover:underline font-bold cursor-pointer text-[10px] uppercase"
                                    title="Edit Payment"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-border/60">|</span>
                                  <button
                                    onClick={() => cancelPayment(inv, p.id)}
                                    className="text-red-500 hover:text-red-600 hover:underline font-bold cursor-pointer text-[10px] uppercase"
                                    title="Cancel Payment"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 justify-end pt-1">
                          {inv.status !== "paid" && inv.status !== "declined" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setActiveInvoice(inv);
                                  setPaymentForm({ amount: inv.due_amount, payment_method: "upi", transaction_ref: "" });
                                }}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 h-8"
                              >
                                Register Payment
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => declineInvoiceDues(inv)}
                                className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs py-1 h-8"
                              >
                                Decline Dues
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPrintInvoice(inv)}
                            className="rounded-xl text-xs py-1 h-8 flex gap-1 items-center"
                          >
                            <Printer className="w-3.5 h-3.5" /> View/Print Receipt
                          </Button>
                        </div>
                      </div>
                    ))}
                    {invoices.length === 0 && (
                      <div className="text-sm text-muted-foreground text-center py-6">No invoices created for patient yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: APPOINTMENTS */}
              {activeTab === "appointments" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-accent text-sm flex gap-2 items-center">
                        <Clock className="w-4 h-4 text-primary" /> Booked Appointments
                      </h3>
                      <p className="text-xs text-muted-foreground">List of all scheduled, completed, or cancelled appointments for this patient</p>
                    </div>
                  </div>

                  <div className="border border-border rounded-3xl overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-xs uppercase text-accent font-semibold">
                          <tr>
                            <th className="px-4 py-3 rounded-l-xl">Ref ID</th>
                            <th className="px-4 py-3">Doctor</th>
                            <th className="px-4 py-3">Service</th>
                            <th className="px-4 py-3">Scheduled At</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((appt) => (
                            <tr key={appt.id} className="border-b border-border/50 hover:bg-muted/10 transition">
                              <td className="px-4 py-3.5 font-mono text-xs font-semibold text-accent">
                                {appt.reference_id}
                              </td>
                              <td className="px-4 py-3.5 text-accent font-medium">
                                {appt.doctor_name || "—"}
                              </td>
                              <td className="px-4 py-3.5">
                                {appt.service}
                              </td>
                              <td className="px-4 py-3.5 text-muted-foreground text-xs">
                                {format(new Date(appt.scheduled_at), "dd MMM yyyy · hh:mm a")}
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge
                                  variant={
                                    appt.status === "approved"
                                      ? "default"
                                      : appt.status === "completed"
                                      ? "secondary"
                                      : appt.status === "pending"
                                      ? "outline"
                                      : "destructive"
                                  }
                                  className="text-[10px] uppercase font-semibold tracking-wider"
                                >
                                  {appt.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedAppointment(appt)}
                                  className="rounded-xl flex gap-1 items-center ml-auto hover:bg-muted"
                                >
                                  Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {appointments.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-10 text-muted-foreground text-xs">
                                No appointments found for this patient.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl p-16 text-center shadow-soft">
            <Users className="w-12 h-12 text-muted-foreground/60 mx-auto" />
            <h3 className="text-lg font-bold text-accent mt-4">No Patient Selected</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
              Please select a patient from the sidebar directory, or click "Add Patient" to register a new file.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: ADD PATIENT */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 lg:p-8 shadow-warm space-y-5 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-accent flex items-center gap-2 border-b border-border pb-3">
              <Users className="w-5 h-5 text-primary" /> Register New Patient
            </h3>
            <form onSubmit={createPatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Full Name *</label>
                  <Input
                    required
                    value={patForm.full_name}
                    onChange={(e) => setPatForm({ ...patForm, full_name: e.target.value })}
                    placeholder="Sanjay Verma"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Mobile Number *</label>
                  <Input
                    required
                    value={patForm.phone}
                    onChange={(e) => setPatForm({ ...patForm, phone: e.target.value })}
                    placeholder="+91 99988 77766"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Gender</label>
                  <select
                    value={patForm.gender || "Male"}
                    onChange={(e) => setPatForm({ ...patForm, gender: e.target.value })}
                    className="w-full rounded-xl border border-border p-2 bg-card text-foreground text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Date of Birth</label>
                  <Input
                    type="date"
                    value={patForm.dob || ""}
                    onChange={(e) => setPatForm({ ...patForm, dob: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Primary Doctor</label>
                  <select
                    value={patForm.primary_doctor_id || ""}
                    onChange={(e) => setPatForm({ ...patForm, primary_doctor_id: e.target.value || null })}
                    className="w-full rounded-xl border border-border p-2 bg-card text-foreground text-sm"
                  >
                    <option value="">No Preference</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Email Address</label>
                <Input
                  type="email"
                  value={patForm.email || ""}
                  onChange={(e) => setPatForm({ ...patForm, email: e.target.value })}
                  placeholder="sanjay@gmail.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Residential Address</label>
                <Input
                  value={patForm.address || ""}
                  onChange={(e) => setPatForm({ ...patForm, address: e.target.value })}
                  placeholder="Sector-4, Dwarka, Delhi"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Insurance Provider</label>
                  <Input
                    value={patForm.insurance_provider || ""}
                    onChange={(e) => setPatForm({ ...patForm, insurance_provider: e.target.value })}
                    placeholder="Star Health"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Insurance Policy No.</label>
                  <Input
                    value={patForm.insurance_number || ""}
                    onChange={(e) => setPatForm({ ...patForm, insurance_number: e.target.value })}
                    placeholder="SH-102938"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Medical History & Allergies</label>
                <Textarea
                  value={patForm.medical_notes || ""}
                  onChange={(e) => setPatForm({ ...patForm, medical_notes: e.target.value })}
                  placeholder="Diabetic, Penicillin Allergy, High BP..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-accent block">Patient Tags</label>
                <div className="flex gap-2 flex-wrap mb-1">
                  {patForm.tags?.map((t) => (
                    <Badge key={t} className="flex gap-1 items-center text-xs">
                      {t}
                      <button
                        type="button"
                        onClick={() => setPatForm({ ...patForm, tags: patForm.tags?.filter((tag) => tag !== t) })}
                        className="text-[9px] hover:text-red-500 font-bold ml-1"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    placeholder="VIP, Anxious, Diabetic..."
                    onChange={(e) => setNewTag(e.target.value)}
                    className="h-9 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newTag.trim() && !patForm.tags?.includes(newTag.trim())) {
                        setPatForm({ ...patForm, tags: [...(patForm.tags || []), newTag.trim()] });
                        setNewTag("");
                      }
                    }}
                    className="h-9 rounded-xl"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddPatient(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Register Patient
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* MODAL: ADD INVOICE */}
      {showAddInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-warm space-y-4">
            <h3 className="text-lg font-bold text-accent flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Create Bill Invoice
            </h3>
            <form onSubmit={createInvoice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Treatment Service</label>
                <Input
                  value={invForm.treatment}
                  onChange={(e) => setInvForm({ ...invForm, treatment: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Base Fee (₹)</label>
                  <Input
                    type="number"
                    value={invForm.total_amount}
                    onChange={(e) => setInvForm({ ...invForm, total_amount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Discount (₹)</label>
                  <Input
                    type="number"
                    value={invForm.discount_amount}
                    onChange={(e) => setInvForm({ ...invForm, discount_amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">GST / Tax rate (%)</label>
                <select
                  value={invForm.tax_rate}
                  onChange={(e) => setInvForm({ ...invForm, tax_rate: Number(e.target.value) })}
                  className="w-full rounded-xl border border-border p-2 bg-card text-foreground text-sm"
                >
                  <option value="0">0% Excluded</option>
                  <option value="5">5% SGST/CGST</option>
                  <option value="12">12% Health Services</option>
                  <option value="18">18% Standard Dental Care</option>
                </select>
              </div>

              <div className="bg-muted/40 p-3 rounded-2xl text-xs space-y-1 border border-border">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invForm.total_amount - invForm.discount_amount}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>GST:</span>
                  <span>₹{(((invForm.total_amount - invForm.discount_amount) * invForm.tax_rate) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-accent text-sm pt-1 border-t border-border/50">
                  <span>Final Bill:</span>
                  <span>₹{(invForm.total_amount - invForm.discount_amount + ((invForm.total_amount - invForm.discount_amount) * invForm.tax_rate) / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddInvoice(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Generate Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER PAYMENT */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-warm space-y-4">
            <h3 className="text-lg font-bold text-accent flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Pay Invoice {activeInvoice.invoice_number}
            </h3>
            <form onSubmit={savePayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Payment Amount (₹) *</label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full rounded-xl border border-border p-2 bg-card text-foreground text-sm"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="cash">Cash In Hand</option>
                  <option value="credit_card">Credit Card Swipe</option>
                  <option value="debit_card">Debit Card Swipe</option>
                  <option value="bank_transfer">Direct IMPS/NEFT</option>
                  <option value="wallet">Other Wallet</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Reference ID / UTR (Optional)</label>
                <Input
                  value={paymentForm.transaction_ref}
                  placeholder="UPI transaction reference no."
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_ref: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveInvoice(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Record Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PAYMENT */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-warm space-y-4">
            <h3 className="text-lg font-bold text-accent flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" /> Edit Payment ({editingPayment.invoice_number})
            </h3>
            <form onSubmit={saveEditedPayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Payment Amount (₹) *</label>
                <Input
                  type="number"
                  value={editingPayment.amount}
                  onChange={(e) => setEditingPayment({ ...editingPayment, amount: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Payment Method</label>
                <select
                  value={editingPayment.payment_method}
                  onChange={(e) => setEditingPayment({ ...editingPayment, payment_method: e.target.value })}
                  className="w-full rounded-xl border border-border p-2 bg-card text-foreground text-sm"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="cash">Cash In Hand</option>
                  <option value="credit_card">Credit Card Swipe</option>
                  <option value="debit_card">Debit Card Swipe</option>
                  <option value="bank_transfer">Direct IMPS/NEFT</option>
                  <option value="wallet">Other Wallet</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Reference ID / UTR (Optional)</label>
                <Input
                  value={editingPayment.transaction_ref}
                  placeholder="UPI transaction reference no."
                  onChange={(e) => setEditingPayment({ ...editingPayment, transaction_ref: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingPayment(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Update Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {printInvoice && selectedPatient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-warm space-y-6 flex flex-col justify-between max-h-[90vh]">
            <div id="printable-receipt" className="space-y-5 flex-1 overflow-y-auto pr-1">
              {/* Receipt Header */}
              <div className="text-center border-b border-border/60 pb-4">
                <div className="font-display font-black text-accent text-lg">SMILE DENTAL CLINIC</div>
                <div className="text-[10px] text-muted-foreground tracking-wide mt-0.5">
                  Multi-specialty Dental Care · New Delhi
                </div>
                <div className="text-[10px] text-muted-foreground">GSTIN: 07AAAAA1111A1Z1</div>
              </div>

              {/* Receipt Body metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-border/40 pb-3">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Receipt For</span>
                  <strong className="text-accent">{selectedPatient.full_name}</strong>
                  <span className="block text-muted-foreground mt-0.5">{selectedPatient.phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[10px] uppercase">Invoice Info</span>
                  <strong className="text-accent">{printInvoice.invoice_number}</strong>
                  <span className="block text-muted-foreground mt-0.5">
                    {new Date(printInvoice.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2 text-xs border-b border-border/40 pb-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Cost:</span>
                  <span>₹{printInvoice.total_amount}</span>
                </div>
                {Number(printInvoice.discount_amount) > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Discount:</span>
                    <span>-₹{printInvoice.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>GST/VAT ({printInvoice.tax_rate}%):</span>
                  <span>₹{printInvoice.tax_amount}</span>
                </div>
                <div className="flex justify-between font-black text-accent border-t border-border/30 pt-1.5">
                  <span>Total Amount Due:</span>
                  <span>₹{printInvoice.final_amount}</span>
                </div>
              </div>

              {/* Payments registered */}
              <div className="space-y-1.5 text-xs">
                <strong className="text-accent font-bold block text-[10px] uppercase tracking-wide">Payments Received</strong>
                {printInvoice.payments && printInvoice.payments.length > 0 ? (
                  printInvoice.payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs py-1 border-b border-border/30">
                      <span>
                        ₹{p.amount} via <strong className="uppercase">{p.payment_method}</strong>
                      </span>
                      <span className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-red-500 italic">No payments received for this invoice yet.</div>
                )}
              </div>

              {/* Balance due */}
              <div className="bg-muted/40 border border-border p-3.5 rounded-2xl flex justify-between items-center mt-4">
                <span className="text-xs font-bold text-accent uppercase">Balance Due:</span>
                <span className={`text-sm font-black ${printInvoice.due_amount <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  ₹{printInvoice.due_amount}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-border pt-4">
              <Button variant="outline" onClick={() => setPrintInvoice(null)} className="rounded-xl text-xs">
                Close
              </Button>
              <Button
                onClick={() => {
                  window.print();
                }}
                className="bg-primary text-primary-foreground font-semibold rounded-xl text-xs flex gap-1.5 items-center"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FAMILY LINKING MODAL */}
      {showFamilyModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-warm space-y-4">
            <h3 className="text-lg font-bold text-accent flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" /> Link Family Member
            </h3>
            <form onSubmit={linkFamilyMember} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Select Relative *</label>
                <select
                  required
                  value={familyForm.relative_id}
                  onChange={(e) => setFamilyForm({ ...familyForm, relative_id: e.target.value })}
                  className="w-full rounded-xl border border-border p-2 bg-card text-foreground text-sm"
                >
                  <option value="">Select Patient</option>
                  {patients
                    .filter((p) => p.id !== selectedPatient.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.phone})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Relationship</label>
                <select
                  value={familyForm.relationship}
                  onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value })}
                  className="w-full rounded-xl border border-border p-2 bg-card text-foreground text-sm"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowFamilyModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Link Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPOINTMENT DETAIL DIALOG */}
      {selectedAppointment && (() => {
        let displayAddress = selectedPatient?.address || "—";
        let displayNotes = selectedAppointment.notes || "";

        if (displayNotes.startsWith("Address: ")) {
          const lines = displayNotes.split("\n");
          const addressLine = lines[0];
          const extractedAddr = addressLine.replace(/^Address:\s*/, "").trim();
          if (displayAddress === "—" || !displayAddress) {
            displayAddress = extractedAddr;
          }
          displayNotes = lines.slice(1).join("\n").trim();
        }

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-warm space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="text-lg font-bold text-accent flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Appointment Details
                </h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-muted-foreground hover:text-accent font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Reference ID:</span>
                  <span className="font-mono font-bold text-accent">{selectedAppointment.reference_id}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Patient Name:</span>
                  <span className="font-medium text-accent">{selectedAppointment.patient_name}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Patient Phone:</span>
                  <span className="font-medium text-accent">{selectedAppointment.patient_phone}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Patient Email:</span>
                  <span className="font-medium text-accent">{selectedAppointment.patient_email || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Patient Address:</span>
                  <span className="font-medium text-accent text-right max-w-[200px]">{displayAddress || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Assigned Doctor:</span>
                  <span className="font-medium text-accent">{selectedAppointment.doctor_name || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium text-accent">{selectedAppointment.service}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Scheduled Time:</span>
                  <span className="font-medium text-accent">
                    {format(new Date(selectedAppointment.scheduled_at), "dd MMM yyyy · hh:mm a")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      selectedAppointment.status === "approved"
                        ? "default"
                        : selectedAppointment.status === "completed"
                        ? "secondary"
                        : selectedAppointment.status === "pending"
                        ? "outline"
                        : "destructive"
                    }
                    className="uppercase font-semibold tracking-wider text-[10px]"
                  >
                    {selectedAppointment.status}
                  </Badge>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Booking Channel:</span>
                  <span className="font-medium text-accent capitalize">{selectedAppointment.booking_channel}</span>
                </div>
                {selectedAppointment.room_chair && (
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Room/Chair:</span>
                    <span className="font-medium text-accent">{selectedAppointment.room_chair}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-semibold">Notes:</span>
                  <div className="bg-muted/40 border border-border p-3 rounded-2xl text-xs text-accent min-h-[60px] whitespace-pre-wrap">
                    {displayNotes || "No special notes recorded."}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <Button onClick={() => setSelectedAppointment(null)} className="rounded-xl">
                  Close
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
