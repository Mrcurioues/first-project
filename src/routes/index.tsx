import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero-clinic.jpg";
import { services } from "@/data/services";
import { doctors, testimonials } from "@/data/doctors";
import { Star, ShieldCheck, Award, Heart, Clock, Phone, Eye } from "lucide-react";
import { BookButton } from "@/components/BookButton";
import { DoctorProfileDialog } from "@/components/DoctorProfileDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "True Dental Care by Awasthi Dental Clinic — Best Dental Clinic & Painless Dental Care in Lucknow" },
      { name: "description", content: "True Dental Care by Awasthi Dental Clinic is the best dental clinic in Lucknow, offering painless root canal treatment (RCT), dental implants, clear aligners, braces, teeth whitening, and complete family dental care." },
      { property: "og:title", content: "True Dental Care by Awasthi Dental Clinic — Best Dental Clinic & Painless Dental Care in Lucknow" },
      { property: "og:description", content: "True Dental Care by Awasthi Dental Clinic is the best dental clinic in Lucknow, offering painless root canal treatment (RCT), dental implants, clear aligners, braces, teeth whitening, and complete family dental care." },
    ],
  }),
  component: Index,
});

function Index() {
  const [activeDoctor, setActiveDoctor] = useState<(typeof doctors)[number] | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "name": "True Dental Care by Awasthi Dental Clinic",
    "image": "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cf920a84-81de-4ad2-bc50-4a0a6a796353/id-preview-c79712f8--48fe5d8e-c30e-4252-a03e-eb3255f2bb9b.lovable.app-1778958638151.png",
    "@id": "https://awasthidentalclinic.com",
    "url": "https://awasthidentalclinic.com",
    "telephone": "+919999999999",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "12, MG Road, Connaught Place",
      "addressLocality": "New Delhi",
      "postalCode": "110001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.6304,
      "longitude": 77.2177
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "21:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "10:00",
        "closes": "14:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/dr.pnkjAwasthi",
      "https://www.instagram.com/awasthi_dental_clinic"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* HERO */}
      <section className="relative overflow-hidden pattern-mandala">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5" /> Namaste · Welcome
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Aapki <span className="text-gradient">muskaan</span>,<br/>hamari zimmedari.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              India's trusted family dental clinic — where world-class technology meets warm Indian hospitality. Painless treatments. Honest prices. Lifelong smiles.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookButton className="px-6 py-3 rounded-full bg-gradient-warm text-primary-foreground font-semibold shadow-warm hover:opacity-90">
                Book Free Consultation
              </BookButton>
              <Link to="/services" className="px-6 py-3 rounded-full border-2 border-accent text-accent font-semibold hover:bg-accent hover:text-accent-foreground transition">Explore Services</Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { n: "15+", l: "Years Experience" },
                { n: "20K+", l: "Happy Smiles" },
                { n: "4.9★", l: "Google Rating" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-bold text-accent font-display">{s.n}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-hero rounded-3xl blur-2xl opacity-30" />
            <img src={heroImg} alt="Awasthi Dental Clinic" width={1536} height={1024} className="relative rounded-3xl shadow-warm w-full object-cover aspect-[4/3]" />
            <div className="absolute -bottom-5 -left-5 bg-card rounded-2xl shadow-soft px-5 py-3 flex items-center gap-3 border border-border">
              <ShieldCheck className="w-8 h-8 text-secondary" />
              <div>
                <div className="text-xs text-muted-foreground">Sterilized & Safe</div>
                <div className="text-sm font-semibold">ISO Certified Clinic</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-accent text-accent-foreground">
        <div className="mx-auto max-w-7xl px-6 py-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          {[
            { i: Award, t: "Award-winning Doctors" },
            { i: ShieldCheck, t: "100% Sterile Equipment" },
            { i: Clock, t: "Open All Days · 9AM–9PM" },
            { i: Phone, t: "EMI & Insurance Accepted" },
          ].map(({ i: Icon, t }) => (
            <div key={t} className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-primary-glow" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-20 bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Our Services</span>
            <h2 className="mt-3 text-4xl font-bold">Complete dental care under one roof</h2>
            <p className="mt-4 text-muted-foreground">From routine cleanings to advanced implants — we offer every treatment your family needs.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.category}
                  className="group bg-card rounded-[2rem] border border-border shadow-soft overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm"
                >
                  {/* Top Image Section with Category Overlay */}
                  <div className="relative aspect-[1.4] w-full overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.category}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    
                    <div className="absolute bottom-4 left-5 flex items-center gap-3 text-white">
                      <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[9px] tracking-[0.2em] font-medium text-white/70 uppercase leading-none">
                          Category
                        </div>
                        <div className="text-base font-bold leading-tight mt-1">
                          {cat.category}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-7 flex flex-col flex-1">
                    <h3 className="font-serif text-2xl font-bold leading-snug text-accent">
                      {cat.tagline}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">
                      {cat.summary}
                    </p>

                    <hr className="my-5 border-border/70" />

                    {/* Core Treatments Header */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase leading-none">
                      <span className="text-primary text-base leading-none">•</span> Core Treatments
                    </div>

                    {/* Treatments List with Sparkle Bullets */}
                    <ul className="mt-4 space-y-2.5 flex-1">
                      {cat.items.map((it) => (
                        <li key={it.name} className="flex items-start gap-2.5 text-sm text-foreground/90 font-medium">
                          <span className="text-primary mt-0.5 shrink-0">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                              <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
                            </svg>
                          </span>
                          <span className="leading-snug">{it.name}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Explore Details Button */}
                    <div className="mt-6">
                      <Link
                        to="/services/$slug"
                        params={{ slug: cat.items[0]?.slug ?? "" }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors"
                      >
                        Explore Details <span className="text-base">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="inline-block px-6 py-3 rounded-full bg-accent text-accent-foreground font-semibold hover:opacity-90">View All Services</Link>
          </div>
        </div>
      </section>

      {/* DOCTORS PREVIEW */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Meet Our Doctors</span>
            <h2 className="mt-3 text-4xl font-bold">Experienced. Caring. Trusted.</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {doctors.map((d) => (
              <button
                key={d.name}
                type="button"
                onClick={() => setActiveDoctor(d)}
                className="group text-left"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-soft">
                  <img src={d.image} alt={d.name} loading="lazy" width={768} height={768} className="w-full aspect-square object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent/95 to-transparent p-5 text-accent-foreground">
                    <div className="font-display text-xl font-bold">{d.name}</div>
                    <div className="text-xs opacity-90">{d.role}</div>
                  </div>
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-semibold bg-card/90 text-foreground px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                    <Eye className="w-3.5 h-3.5" /> View profile
                  </span>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">{d.qualifications} · {d.experience}</div>
              </button>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/doctors" className="inline-block px-6 py-3 rounded-full border-2 border-accent text-accent font-semibold hover:bg-accent hover:text-accent-foreground transition">Meet The Full Team</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-gradient-soft pattern-mandala">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Patient Stories</span>
            <h2 className="mt-3 text-4xl font-bold">Smiles we've crafted</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-2xl overflow-hidden border border-border shadow-soft">
                <img src={t.image} alt={t.name} loading="lazy" width={768} height={768} className="w-full aspect-[4/3] object-cover" />
                <div className="p-5">
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="mt-3 text-sm italic text-muted-foreground">"{t.quote}"</p>
                  <div className="mt-4">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.city} · {t.treatment}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl bg-gradient-hero text-primary-foreground p-10 lg:p-14 text-center shadow-warm">
            <h2 className="text-3xl lg:text-4xl font-bold">Ready for your dream smile?</h2>
            <p className="mt-3 opacity-90">Free consultation · No hidden charges · EMI options available</p>
            <BookButton className="inline-block mt-6 px-8 py-3 rounded-full bg-card text-accent font-bold hover:scale-105 transition">
              Book Appointment
            </BookButton>
          </div>
        </div>
      </section>

      <DoctorProfileDialog doctor={activeDoctor} open={!!activeDoctor} onOpenChange={(v) => !v && setActiveDoctor(null)} />
    </>
  );
}
