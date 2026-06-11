import { createFileRoute } from "@tanstack/react-router";
import { doctors } from "@/data/doctors";
import { GraduationCap, Award } from "lucide-react";
import { BookButton } from "@/components/BookButton";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Best Dentists & Dental Specialists — True Dental Care by Awasthi Dental Clinic" },
      { name: "description", content: "Meet our panel of highly qualified and experienced dentists at True Dental Care by Awasthi Dental Clinic. Specialists in dental implants, orthodontics, cosmetic dentistry, and root canal therapy." },
      { property: "og:title", content: "Best Dentists & Dental Specialists — True Dental Care by Awasthi Dental Clinic" },
      { property: "og:description", content: "Meet our panel of highly qualified and experienced dentists at True Dental Care by Awasthi Dental Clinic. Specialists in dental implants, orthodontics, cosmetic dentistry, and root canal therapy." },
    ],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold">Meet Our Doctors</h1>
          <p className="mt-3 opacity-90 max-w-2xl mx-auto">A team of award-winning dental specialists trusted by thousands of Indian families.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-16">
          {doctors.map((d, idx) => (
            <div key={d.name} className={`grid md:grid-cols-2 gap-10 items-center ${idx % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-warm rounded-3xl blur-xl opacity-30" />
                <img src={d.image} alt={d.name} loading="lazy" width={768} height={768} className="relative w-full aspect-square object-cover rounded-3xl shadow-warm" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{d.name}</h2>
                <p className="text-primary font-semibold mt-1">{d.role}</p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-secondary" /> {d.qualifications}</div>
                  <div className="flex items-center gap-2"><Award className="w-4 h-4 text-secondary" /> {d.experience} of experience</div>
                </div>
                <p className="mt-4 text-base">{d.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {d.specialties.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{s}</span>
                  ))}
                </div>
                <BookButton doctor={d.name} className="inline-block mt-6 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-semibold text-sm">
                  Book Appointment
                </BookButton>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}