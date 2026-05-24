import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { BookingProvider } from "@/components/BookingDialog";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Smile India Dental Clinic — Best Dental Clinic & Dentist in India" },
      { name: "description", content: "Smile India Dental Clinic is India's leading family dental clinic offering world-class, painless treatments, root canals, dental implants, teeth cleaning, and smile makeovers with state-of-the-art technology." },
      { name: "author", content: "Smile India Dental Clinic" },
      { property: "og:title", content: "Smile India Dental Clinic — Best Dental Clinic & Dentist in India" },
      { property: "og:description", content: "Leading family dental clinic in India. Affordable & painless root canals, dental implants, teeth whitening, clear aligners, and braces by expert specialists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@SmileIndiaDental" },
      { name: "twitter:title", content: "Smile India Dental Clinic — Best Dental Clinic & Dentist in India" },
      { name: "twitter:description", content: "Leading family dental clinic in India. Affordable & painless root canals, dental implants, teeth whitening, clear aligners, and braces by expert specialists." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cf920a84-81de-4ad2-bc50-4a0a6a796353/id-preview-c79712f8--48fe5d8e-c30e-4252-a03e-eb3255f2bb9b.lovable.app-1778958638151.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cf920a84-81de-4ad2-bc50-4a0a6a796353/id-preview-c79712f8--48fe5d8e-c30e-4252-a03e-eb3255f2bb9b.lovable.app-1778958638151.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <BookingProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <Toaster richColors position="top-center" />
        </div>
      </BookingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
