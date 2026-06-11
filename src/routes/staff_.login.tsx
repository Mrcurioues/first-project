import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/staff_/login")({
  head: () => ({ meta: [{ title: "Staff Login — Awasthi Dental" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/staff" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/staff" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-warm overflow-hidden">
        <div 
          className="text-white px-6 py-6 text-center"
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)" }}
        >
          <div className="text-xs uppercase tracking-widest opacity-90">Awasthi Dental Clinic</div>
          <h1 className="font-display text-2xl mt-1 text-white">Staff Sign In</h1>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@awasthidentalclinic.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full bg-gradient-warm text-primary-foreground" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Staff accounts only. Contact admin for access.
          </p>
        </form>
      </div>
    </div>
  );
}