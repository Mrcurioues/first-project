import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, GraduationCap, Stethoscope } from "lucide-react";
import { BookButton } from "@/components/BookButton";
import type { ReactNode } from "react";

type Doctor = {
  name: string;
  role: string;
  qualifications: string;
  experience: string;
  image: string;
  bio: string;
  specialties: string[];
};

export function DoctorProfileDialog({ doctor, open, onOpenChange }: { doctor: Doctor | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-none">
        {doctor && (
          <div className="bg-card rounded-3xl border border-border shadow-warm overflow-hidden">
            <div className="relative h-44 bg-gradient-hero pattern-mandala">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="absolute -bottom-12 left-6 w-24 h-24 rounded-2xl object-cover border-4 border-card shadow-warm"
              />
            </div>
            <div className="px-6 pt-16 pb-6">
              <DialogHeader className="text-left">
                <DialogTitle className="font-display text-2xl">{doctor.name}</DialogTitle>
                <DialogDescription className="text-primary font-semibold">{doctor.role}</DialogDescription>
              </DialogHeader>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <Row icon={<GraduationCap className="w-4 h-4 text-secondary" />}>{doctor.qualifications}</Row>
                <Row icon={<Award className="w-4 h-4 text-secondary" />}>{doctor.experience} of experience</Row>
                <Row icon={<Stethoscope className="w-4 h-4 text-secondary" />}>{doctor.specialties.join(" · ")}</Row>
              </div>
              <p className="mt-4 text-sm">{doctor.bio}</p>
              <BookButton
                doctor={doctor.name}
                className="mt-5 w-full px-5 py-3 rounded-full bg-gradient-warm text-primary-foreground font-semibold shadow-soft"
              >
                Book with {doctor.name.split(" ")[1] ?? doctor.name}
              </BookButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <div className="flex items-center gap-2">{icon}{children}</div>;
}