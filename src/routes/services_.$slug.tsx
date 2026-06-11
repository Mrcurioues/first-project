import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { BookButton } from "@/components/BookButton";
import { getArticleBySlug, listArticles, type Block, type GalleryImg } from "@/lib/content";
import { resolveImage } from "@/lib/image-registry";
import { getServicePrice } from "@/data/services";

export const Route = createFileRoute("/services_/$slug")({
  loader: async ({ params }) => {
    const article = await getArticleBySlug(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: "Service — Awasthi Dental" }] };
    const heroUrl = resolveImage(a.hero_image_key);
    return {
      meta: [
        { title: a.meta_title ?? a.title },
        { name: "description", content: a.meta_description ?? "" },
        { property: "og:title", content: a.meta_title ?? a.title },
        { property: "og:description", content: a.meta_description ?? "" },
        { property: "og:image", content: heroUrl },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: heroUrl },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-bold">Service not found</h1>
      <Link to="/services" className="text-primary hover:underline mt-4 inline-block">← Back to all services</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground mt-2">{error.message}</p>
    </div>
  ),
  component: ServiceArticlePage,
});

function ServiceArticlePage() {
  const { article } = Route.useLoaderData();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const gallery = article.gallery ?? [];

  const close = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length));
  const next = () => setLightbox((i) => (i === null ? null : (i + 1) % gallery.length));

  const { data: allArticles = [] } = useQuery({
    queryKey: ["articles-all"],
    queryFn: listArticles,
  });
  const siblings = allArticles.filter((a) => a.category === article.category && a.slug !== article.slug);

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground py-14">
        <div className="mx-auto max-w-5xl px-6">
          <nav className="text-sm opacity-80 mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/services" className="hover:underline">Services</Link>
            <span className="mx-2">›</span>
            <span>{article.title}</span>
          </nav>
          
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold mb-3">
            <span className="uppercase tracking-widest opacity-85">{article.category}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3.5 py-1 rounded-full backdrop-blur-xs font-bold shadow-sm">
              Standard Rate: {getServicePrice(article.slug)}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight">{article.title}</h1>
          {article.lead && <p className="mt-4 text-lg opacity-90 max-w-3xl">{article.lead}</p>}
        </div>
      </section>

      <article className="py-14">
        <div className="mx-auto max-w-3xl px-6">
          <div className="overflow-hidden rounded-3xl shadow-warm mb-10">
            <img
              src={resolveImage(article.hero_image_key)}
              alt={article.title}
              width={1024}
              height={768}
              loading="lazy"
              className="w-full h-72 object-cover"
            />
          </div>

          <div className="space-y-5">
            {article.body.map((block: Block, i: number) => {
              if (block.type === "h2") {
                return <h2 key={i} className="text-2xl font-display font-bold text-accent mt-8">{block.text}</h2>;
              }
              if (block.type === "ul") {
                return (
                  <ul key={i} className="space-y-2 text-muted-foreground">
                    {block.items.map((it) => (
                      <li key={it} className="flex gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.type === "ol") {
                return (
                  <ol key={i} className="list-decimal pl-6 space-y-2 text-muted-foreground">
                    {block.items.map((it) => <li key={it}>{it}</li>)}
                  </ol>
                );
              }
              return <p key={i} className="text-muted-foreground leading-relaxed">{block.text}</p>;
            })}
          </div>
        </div>

        {gallery.length > 0 && (
          <div className="mx-auto max-w-6xl px-6 mt-14">
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-center text-accent">Treatment Gallery</h2>
            <p className="text-center text-muted-foreground mt-2">Tap any image to zoom in</p>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {gallery.map((img: GalleryImg, i: number) => {
                const url = resolveImage(img.src);
                return (
                  <button
                    key={`${img.src}-${i}`}
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="group text-left rounded-2xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-warm transition-shadow"
                    aria-label={`Open ${img.alt}`}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={url}
                        alt={img.alt}
                        width={1024}
                        height={768}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <figcaption className="p-3 text-sm text-muted-foreground leading-snug">{img.caption}</figcaption>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-4xl px-6 mt-14">
          <div className="rounded-3xl bg-accent text-accent-foreground p-8 lg:p-10 text-center shadow-warm">
            <h3 className="text-2xl lg:text-3xl font-display font-bold">Book Your {article.title} Consultation</h3>
            <p className="mt-2 opacity-90">Talk to our specialist — first consultation is free.</p>
            <BookButton
              service={article.cta_service ?? article.category}
              className="inline-block mt-5 px-6 py-3 rounded-full bg-gradient-warm text-primary-foreground font-semibold shadow-soft"
            >
              Book Free Consultation
            </BookButton>
          </div>
        </div>

        {siblings.length > 0 && (
          <div className="mx-auto max-w-5xl px-6 mt-14">
            <h3 className="text-xl font-display font-bold text-accent">More in {article.category}</h3>
            <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="block p-4 rounded-2xl border border-border bg-card hover:shadow-warm hover:border-primary/40 transition-all"
                >
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{(s.lead ?? "").slice(0, 80)}…</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {lightbox !== null && gallery.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button type="button" onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Close"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous"
            className="absolute left-3 sm:left-6 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next"
            className="absolute right-3 sm:right-6 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center">
            <ChevronRight className="w-6 h-6" />
          </button>
          <figure className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={resolveImage(gallery[lightbox].src)} alt={gallery[lightbox].alt} className="w-full max-h-[78vh] object-contain rounded-xl" />
            <figcaption className="mt-4 text-center text-white/90 text-sm sm:text-base">
              {gallery[lightbox].caption}
              <span className="block mt-1 text-xs text-white/60">{lightbox + 1} / {gallery.length}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
