import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, Quote } from "lucide-react";
import { listTestimonials } from "@/lib/content";
import { resolveImage } from "@/lib/image-registry";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Patient Testimonials — Smile Dental Clinic" },
      { name: "description", content: "Real stories from real patients across India. See video testimonials and smile transformations." },
      { property: "og:title", content: "Patient Testimonials — Smile Dental Clinic" },
      { property: "og:description", content: "Real stories from happy patients across India." },
    ],
  }),
  component: TestimonialsPage,
});

const videos = [
  { id: "Ke90Tje7VS0", title: "Anjali's Smile Makeover Journey" },
  { id: "ScMzIvxBSi4", title: "Painless Root Canal Experience" },
];

function TestimonialsPage() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials"],
    queryFn: listTestimonials,
  });

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold">Patient Stories</h1>
          <p className="mt-3 opacity-90 max-w-2xl mx-auto">20,000+ happy smiles and counting. Hear directly from our patients.</p>
        </div>
      </section>

      <section className="py-16 pattern-mandala">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center">Video Testimonials</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {videos.map((v) => (
              <div key={v.id} className="rounded-2xl overflow-hidden shadow-warm aspect-video">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${v.id}?rel=0`} title={v.title} allow="autoplay; encrypted-media" allowFullScreen />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center">Smile Transformations</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-card rounded-2xl overflow-hidden border border-border shadow-soft">
                <img src={resolveImage(t.image_key)} alt={t.name} loading="lazy" width={768} height={768} className="w-full aspect-square object-cover" />
                <div className="p-5 relative">
                  <Quote className="absolute -top-4 right-5 w-8 h-8 text-primary/30" />
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="mt-3 text-sm italic text-muted-foreground">"{t.quote}"</p>
                  <div className="mt-4">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{[t.city, t.treatment].filter(Boolean).join(" · ")}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
