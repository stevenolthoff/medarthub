import { Metadata } from "next";
import Link from "next/link";
import { HomeGallery } from "@/components/home-gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://medicalartists.co";

  return {
    title: "Medical Artists — Coming Soon",
    description:
      "Preview the Medical Artists platform. Discover medical & scientific illustrators and request early access to showcase your work.",
    keywords: [
      "medical art",
      "scientific illustration",
      "medical illustrators",
      "biomedical visualization",
      "healthcare art",
      "medical animation",
    ],
    openGraph: {
      title: "Medical Artists — Coming Soon",
      description:
        "Preview the Medical Artists platform. Discover medical & scientific illustrators and request early access to showcase your work.",
      type: "website",
      url: baseUrl,
      siteName: "Medical Artists",
    },
    twitter: {
      card: "summary_large_image",
      title: "Medical Artists — Coming Soon",
      description:
        "Preview the Medical Artists platform. Discover medical & scientific illustrators and request early access to showcase your work.",
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

export default function Home() {
  return (
    <>
      <section className="border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:px-8 lg:py-24">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Launching Soon
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Where Medical & Scientific Art Finds Its Audience
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              We&apos;re curating the world&apos;s top medical illustrators,
              animators, and storytellers. Preview the experience and request
              early access to secure your spot.
            </p>
            <div className="mt-8 flex w-full flex-col gap-4">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by specialty (e.g., “3D animation”)"
                  className="h-14 w-full rounded-full border-border bg-background pl-12 pr-16 text-base shadow-sm"
                  disabled
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 size-10 -translate-y-1/2 rounded-full cursor-not-allowed"
                  disabled
                >
                  <Search className="size-5" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="text-sm font-medium text-muted-foreground">
                  Preview tags:
                </span>
                {["Surgical", "Animation", "Editorial", "Medical Device", "Charts"].map(
                  (tag) => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className="cursor-not-allowed rounded-full"
                      disabled
                    >
                      {tag}
                    </Button>
                  ),
                )}
              </div>
            </div>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="cursor-pointer">
                <Link href="/request-access">Request Early Access</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="cursor-pointer">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
          <div className="hidden h-full w-full items-center justify-center rounded-3xl bg-muted/70 p-8 shadow-sm lg:flex">
            <div className="flex flex-col items-center text-center">
              <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-sm">
                Spotlight
              </span>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                Feature-ready Showcase
              </h3>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Soon you&apos;ll browse high-fidelity case studies, motion work,
                and interactive visuals crafted for medicine and science.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <HomeGallery />
      </section>
    </>
  );
}
