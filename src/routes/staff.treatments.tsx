import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Package,
} from "lucide-react";

export const Route = createFileRoute("/staff/treatments")({
  component: TreatmentsPage,
});

type Service = {
  id: string;
  category: string;
  tagline: string | null;
  summary: string | null;
  icon: string | null;
  image_key: string | null;
  doctor_name: string | null;
  sort_order: number;
  active: boolean;
};

// Seed-ready standard categories just in case
const STANDARD_CATEGORIES = [
  "Scaling & Polishing",
  "Fillings",
  "Root Canal",
  "Crowns",
  "Braces",
  "Invisalign",
  "Teeth Whitening",
  "Dental Implants",
  "Extraction",
  "Oral Surgery",
  "Pediatric Dentistry",
  "Cosmetic Dentistry",
];

function TreatmentsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Service form state
  const [form, setForm] = useState<Partial<Service>>({
    category: "",
    tagline: "",
    summary: "",
    icon: "Stethoscope",
    image_key: "",
    doctor_name: "",
    sort_order: 0,
    active: true,
  });

  // Mock Package Deal state
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: "Complete Smile Makeover Package",
    cost: 15000,
    services_included: "Scaling, Whitening, 2 Veneers",
  });

  async function loadData() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setServices((data as Service[]) ?? []);

      if (data && data.length > 0 && !selectedService) {
        setSelectedService(data[0] as Service);
      }
    } catch (err: any) {
      toast.error("Failed to load services: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedService) {
      setForm(selectedService);
    } else {
      setForm({
        category: "",
        tagline: "",
        summary: "",
        icon: "Stethoscope",
        image_key: "",
        doctor_name: "",
        sort_order: services.length,
        active: true,
      });
    }
  }, [selectedService, editMode]);

  async function toggleStatus(service: Service) {
    try {
      const { error } = await supabase
        .from("services")
        .update({ active: !service.active })
        .eq("id", service.id);

      if (error) throw error;
      toast.success(`${service.category} status toggled!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) return toast.error("Category Title is required");

    const payload = {
      category: form.category,
      tagline: form.tagline || null,
      summary: form.summary || null,
      icon: form.icon || "Stethoscope",
      image_key: form.image_key || form.category,
      doctor_name: form.doctor_name || null,
      sort_order: Number(form.sort_order || 0),
      active: form.active ?? true,
    };

    try {
      if (selectedService && !editMode) return;

      if (selectedService && editMode) {
        // Update
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", selectedService.id);

        if (error) throw error;
        toast.success("Service category updated!");
        setEditMode(false);
      } else {
        // Insert
        const { data, error } = await supabase
          .from("services")
          .insert([payload])
          .select();

        if (error) throw error;
        toast.success("New service category created!");
        if (data && data[0]) {
          setSelectedService(data[0] as Service);
        }
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function deleteService(id: string) {
    if (!confirm("Are you sure you want to delete this treatment category? It will remove it from the patient options.")) return;
    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      toast.success("Treatment category deleted successfully.");
      setSelectedService(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-accent">Treatment & Services</h1>
          <p className="text-sm text-muted-foreground">Manage dental categories, pricing structures, and active catalog listing.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPackageModal(true)}
            variant="outline"
            className="rounded-full border-border flex gap-1.5 items-center font-semibold"
          >
            <Package className="w-4 h-4 text-primary" /> Setup Package Deal
          </Button>
          <Button
            onClick={() => {
              setSelectedService(null);
              setEditMode(true);
            }}
            className="bg-gradient-warm hover:opacity-90 text-primary-foreground font-semibold flex gap-2 items-center rounded-full px-5"
          >
            <Plus className="w-4.5 h-4.5" /> Add Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Left Side: Services List */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft space-y-3">
          <h3 className="font-semibold text-accent text-sm px-2 uppercase tracking-wider">Treatment Catalog</h3>
          {loading && services.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Loading treatment details...</div>
          ) : (
            <div className="space-y-1">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedService(s);
                    setEditMode(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition border ${
                    selectedService?.id === s.id
                      ? "bg-accent/5 border-primary text-accent font-semibold"
                      : "text-foreground hover:bg-muted/50 border-transparent"
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-accent truncate">{s.category}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{s.tagline || "Dental Category"}</div>
                  </div>
                  <Badge variant={s.active ? "default" : "secondary"} className="text-[9px] px-1.5 py-0.5">
                    {s.active ? "Active" : "Inactive"}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Detail Form & Options */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-5 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-accent">
                    {selectedService ? selectedService.category : "New Dental Category Setup"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedService ? "Manage this service's details, text and tags" : "Fill in the category attributes"}
                  </p>
                </div>
              </div>
              {selectedService && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(selectedService)}
                    className="flex gap-1.5 items-center rounded-xl"
                  >
                    {selectedService.active ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600" /> Listing Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-muted-foreground" /> Catalog Hidden
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className="flex gap-1.5 items-center rounded-xl"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> {editMode ? "Cancel" : "Edit"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteService(selectedService.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <form onSubmit={saveService} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Treatment Category Name</label>
                  <select
                    disabled={selectedService !== null && !editMode}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-border p-2.5 bg-card text-foreground text-sm"
                  >
                    <option value="">Select or Type Category Name</option>
                    {STANDARD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {!STANDARD_CATEGORIES.includes(form.category || "") && form.category && (
                      <option value={form.category}>{form.category}</option>
                    )}
                  </select>
                  {editMode && (
                    <Input
                      value={form.category}
                      placeholder="Or enter custom category name"
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="mt-2 rounded-xl"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Summary Tagline</label>
                  <Input
                    disabled={selectedService !== null && !editMode}
                    value={form.tagline || ""}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="Healthy smiles start here"
                    className="rounded-xl border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-accent">Assigned Lead Specialist</label>
                  <Input
                    disabled={selectedService !== null && !editMode}
                    value={form.doctor_name || ""}
                    onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
                    placeholder="Dr. Arjun Sharma"
                    className="rounded-xl border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-accent">Sort Order</label>
                    <Input
                      type="number"
                      disabled={selectedService !== null && !editMode}
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                      placeholder="0"
                      className="rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-accent">Image Resolution Key</label>
                    <Input
                      disabled={selectedService !== null && !editMode}
                      value={form.image_key || ""}
                      onChange={(e) => setForm({ ...form, image_key: e.target.value })}
                      placeholder="Scaling & Polishing"
                      className="rounded-xl border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Service Description</label>
                <Textarea
                  disabled={selectedService !== null && !editMode}
                  value={form.summary || ""}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Routine checkups, professional cleanings and digital X-rays..."
                  className="rounded-xl border-border min-h-[100px]"
                />
              </div>

              {(!selectedService || editMode) && (
                <div className="pt-2">
                  <Button type="submit" className="bg-primary text-primary-foreground font-semibold rounded-xl">
                    Save Category Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* PACKAGE DEALS SETUP MODAL */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-warm space-y-4">
            <h3 className="text-lg font-bold text-accent flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Setup Promotional Package
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success(`Combo Package "${packageForm.name}" created at ₹${packageForm.cost}!`);
                setShowPackageModal(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Package/Combo Name</label>
                <Input
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Combo Offer Pricing (₹)</label>
                <Input
                  type="number"
                  value={packageForm.cost}
                  onChange={(e) => setPackageForm({ ...packageForm, cost: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-accent">Treatments Included</label>
                <Textarea
                  value={packageForm.services_included}
                  onChange={(e) => setPackageForm({ ...packageForm, services_included: e.target.value })}
                  placeholder="Listing items included in price..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowPackageModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                  Save Package Combo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
