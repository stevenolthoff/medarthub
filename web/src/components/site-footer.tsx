import Link from "next/link";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { Separator } from "@/components/ui/separator";
import { Dribbble, Facebook, Instagram, Twitter } from "lucide-react";

const footerLinks = {
  "For Artists": [
    { name: "Showcase your work", href: "#" },
    { name: "How to get started", href: "#" },
    { name: "Community guidelines", href: "#" },
  ],
  "Hire Talent": [
    { name: "Find an artist", href: "#" },
    { name: "Post a job", href: "#" },
    { name: "Why hire from us?", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Support", href: "/privacy" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
  Directories: [
    { name: "Artists", href: "#" },
    { name: "Jobs", href: "#" },
    { name: "Tags", href: "#" },
  ],
} as const;

const socialLinks = [
  { name: "Dribbble", icon: Dribbble, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
] as const;

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-foreground">
              Medical Artists
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              The leading destination to discover, hire, and collaborate with medical and scientific creatives shaping the future of healthcare communication.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {section}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-10" />
        <div className="flex flex-col-reverse gap-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Medical Artists. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="cursor-pointer transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="cursor-pointer transition-colors hover:text-foreground">
              Privacy
            </Link>
            <CookiePreferencesButton>Cookies</CookiePreferencesButton>
          </div>
        </div>
      </div>
    </footer>
  );
}
