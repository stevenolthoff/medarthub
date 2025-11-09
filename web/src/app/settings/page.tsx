"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'basic-information', label: 'Basic Information' },
  { id: 'profile-url', label: 'Profile URL' },
  { id: 'about-me', label: 'About Me' },
] as const;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function SettingsNav({ activeSection }: { activeSection: string }) {
  return (
    <nav className="sticky top-24 space-y-1">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={cn(
            'block border-l-2 px-4 py-2 text-sm font-medium transition-colors hover:cursor-pointer',
            activeSection === section.id
              ? 'border-primary text-primary'
              : 'border-muted text-muted-foreground hover:border-primary/60 hover:text-foreground'
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}

export default function SettingsPage() {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [about, setAbout] = useState('');
  const [slug, setSlug] = useState('');
  const [slugFeedback, setSlugFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '');

  const artistSlug = user?.artist?.slug ?? null;

  const { data: profile, isLoading: isProfileLoading } = trpc.artist.getBySlug.useQuery(
    { slug: artistSlug as string },
    { enabled: Boolean(artistSlug) }
  );

  const updateProfileMutation = trpc.artist.updateProfile.useMutation({
    onSuccess: () => {
      const currentSlug = profile?.slug ?? artistSlug;
      if (currentSlug) {
        void utils.artist.getBySlug.invalidate({ slug: currentSlug });
      }
      void utils.auth.me.invalidate();
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    }
  });

  const updateSlugMutation = trpc.artist.updateSlug.useMutation({
    onSuccess: (data) => {
      setSlugFeedback({ type: 'success', message: data.message });
      void utils.auth.me.invalidate();

      if (artistSlug) {
        void utils.artist.getBySlug.invalidate({ slug: artistSlug });
      }
      if (data.slug && data.slug !== artistSlug) {
        void utils.artist.getBySlug.invalidate({ slug: data.slug });
      }
      if (data.slug) {
        setSlug(data.slug);
      }
    },
    onError: (error) => {
      setSlugFeedback({ type: 'error', message: error.message });
    },
  });

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isAuthLoading, router]);

  useEffect(() => {
    if (profile || artistSlug) {
      setName(profile?.user.name || '');
      setHeadline(profile?.headline || '');
      setCompany(profile?.company || '');
      setLocation(profile?.location || '');
      setWebsiteUrl(profile?.websiteUrl || '');
      setAbout(profile?.about || '');
      setSlug(profile?.slug ?? artistSlug ?? '');
      setSlugFeedback(null);
    }
  }, [profile, artistSlug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntries = entries.filter((entry) => entry.isIntersecting);

        if (intersectingEntries.length === 0) {
          return;
        }

        const mostVisible = intersectingEntries.reduce((prev, current) =>
          prev.intersectionRatio > current.intersectionRatio ? prev : current
        );

        setActiveSection(mostVisible.target.id);
      },
      {
        rootMargin: '-45% 0px -35% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    const elements = sections
      .map((section) => (typeof document !== 'undefined' ? document.getElementById(section.id) : null))
      .filter((el): el is HTMLElement => Boolean(el));

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name,
      headline,
      company,
      location,
      websiteUrl,
    });
  };

  const handleAboutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      about,
    });
  };

  const handleSlugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSlugFeedback(null);

    const trimmedSlug = slug.trim();
    const isValid =
      trimmedSlug.length >= 3 &&
      trimmedSlug.length <= 50 &&
      slugRegex.test(trimmedSlug);

    if (!isValid) {
      setSlugFeedback({
        type: 'error',
        message: 'Slug must be 3-50 characters using lowercase letters, numbers, and hyphens (no leading, trailing, or consecutive hyphens).',
      });
      return;
    }

    const currentSlugValue = profile?.slug ?? artistSlug ?? '';
    if (trimmedSlug === currentSlugValue) {
      setSlugFeedback({
        type: 'success',
        message: 'Slug is unchanged.',
      });
      return;
    }

    updateSlugMutation.mutate({
      slug: trimmedSlug,
    });
  };

  const trimmedSlug = slug.trim();
  const isSlugValid =
    trimmedSlug.length >= 3 &&
    trimmedSlug.length <= 50 &&
    slugRegex.test(trimmedSlug);
  const currentSlugValue = profile?.slug ?? artistSlug ?? '';
  const isSlugChanged = trimmedSlug !== currentSlugValue;
  const disableSlugSubmit = updateSlugMutation.isPending || !isSlugValid || !isSlugChanged;

  const isLoading = isAuthLoading || isProfileLoading;

  if (isLoading || !isLoggedIn || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-3 pb-32 sm:px-6 sm:py-12 lg:px-8 lg:pb-40">
      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        <aside className="hidden md:block md:w-1/4 lg:w-1/5">
          <SettingsNav activeSection={activeSection} />
        </aside>
        <main className="flex-1 space-y-8">
          <form onSubmit={handleBasicInfoSubmit}>
            <section id="basic-information" className="scroll-mt-24">
              <Card className="border-0 bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
                <CardHeader className="px-0 pb-2 sm:px-6 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Basic Information</CardTitle>
                  <CardDescription className="hidden sm:block">Update your personal details and professional info.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <FieldGroup className="gap-3 sm:gap-7">
                    <Field>
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="headline">Headline</FieldLabel>
                      <Input
                        id="headline"
                        placeholder="e.g., Senior Designer, Art Director, Student"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="company">Company</FieldLabel>
                      <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="location">Location</FieldLabel>
                      <Input
                        id="location"
                        placeholder="e.g., New York, USA"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="websiteUrl">Website URL</FieldLabel>
                      <Input
                        id="websiteUrl"
                        type="url"
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
                <CardFooter className="flex justify-end px-0 sm:px-6">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Save Basic Info
                  </Button>
                </CardFooter>
              </Card>
            </section>
          </form>

          <form onSubmit={handleSlugSubmit}>
            <section id="profile-url" className="scroll-mt-24">
              <Card className="border-0 bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
                <CardHeader className="px-0 pb-2 sm:px-6 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Profile URL</CardTitle>
                  <CardDescription className="hidden sm:block">
                    Customize the link to your portfolio to match your personal brand.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="slug">Your Slug</FieldLabel>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                          medicalartists.co/
                        </span>
                        <Input
                          id="slug"
                          value={slug}
                          onChange={(e) => {
                            const nextValue = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '-')
                              .replace(/-{2,}/g, '-');
                            setSlug(nextValue);
                            setSlugFeedback(null);
                          }}
                          maxLength={50}
                          className="pl-[150px] sm:pl-[166px]"
                          aria-describedby="slug-description"
                        />
                      </div>
                      <FieldDescription id="slug-description">
                        3-50 characters. Lowercase letters, numbers, and single hyphens only.
                      </FieldDescription>
                      {!slugFeedback && slug.length > 0 && !isSlugValid ? (
                        <FieldError>
                          Slug must use lowercase letters, numbers, and single hyphens. It cannot start or end with a hyphen.
                        </FieldError>
                      ) : null}
                      {slugFeedback && (
                        <div
                          className={cn(
                            'text-sm',
                            slugFeedback.type === 'error' ? 'text-destructive' : 'text-green-600'
                          )}
                          role="status"
                        >
                          {slugFeedback.message}
                        </div>
                      )}
                    </Field>
                  </FieldGroup>
                </CardContent>
                <CardFooter className="flex justify-end px-0 sm:px-6">
                  <Button type="submit" disabled={disableSlugSubmit}>
                    {updateSlugMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Save URL
                  </Button>
                </CardFooter>
              </Card>
            </section>
          </form>

          <form onSubmit={handleAboutSubmit}>
            <section id="about-me" className="scroll-mt-24">
              <Card className="border-0 bg-transparent shadow-none sm:min-h-[420px] sm:border sm:bg-card sm:shadow-sm md:min-h-[480px]">
                <CardHeader className="px-0 pb-2 sm:px-6 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">About Me</CardTitle>
                  <CardDescription className="hidden sm:block">Write a short bio about yourself.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <Field>
                    <FieldLabel htmlFor="about">Description</FieldLabel>
                    <Textarea
                      id="about"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={6}
                      className="min-h-[200px] sm:min-h-[260px] sm:rows-8"
                    />
                    <div className="mt-2 text-right text-sm text-muted-foreground">{about.length} / 2000</div>
                  </Field>
                </CardContent>
                <CardFooter className="flex justify-end px-0 sm:px-6">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Save About
                  </Button>
                </CardFooter>
              </Card>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}

