import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/staff/messages")({ component: Page });

type Msg = { id: string; name: string; email: string; phone: string|null; subject: string|null; message: string; status: string; created_at: string };

function Page() {
  const [list, setList] = useState<Msg[]>([]);
  async function load() {
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at",{ascending:false});
    if (error) toast.error(error.message); else setList((data ?? []) as Msg[]);
  }
  useEffect(()=>{ load(); },[]);
  async function mark(id:string,status:string){ await supabase.from("contact_messages").update({status:status as any}).eq("id",id); load(); }
  async function del(id:string){ if(!confirm("Delete?")) return; await supabase.from("contact_messages").delete().eq("id",id); toast.success("Deleted"); load(); }
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Contact Messages</h1><p className="text-sm text-muted-foreground">Enquiries from the website</p></div>
      <div className="space-y-3">
        {list.map(m => (
          <div key={m.id} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{m.name} <span className="text-sm font-normal text-muted-foreground">· {m.email}</span></div>
                {m.phone && <div className="text-xs text-muted-foreground">{m.phone}</div>}
                <div className="text-xs text-muted-foreground mt-1">{format(new Date(m.created_at),"dd MMM yyyy · hh:mm a")}</div>
              </div>
              <Badge variant={m.status==="new"?"default":"secondary"}>{m.status}</Badge>
            </div>
            <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
            <div className="mt-3 flex gap-2">
              {m.status==="new" && <Button size="sm" variant="outline" onClick={()=>mark(m.id,"read")}>Mark Read</Button>}
              <Button size="sm" variant="ghost" onClick={()=>del(m.id)}>Delete</Button>
            </div>
          </div>
        ))}
        {list.length===0 && <div className="text-center text-muted-foreground py-12 bg-card border border-border rounded-2xl">No messages yet.</div>}
      </div>
    </div>
  );
}