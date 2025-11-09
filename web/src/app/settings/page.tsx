"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { RouterOutputs } from '@/lib/server-trpc';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'basic-information', label: 'Basic Information' },
  { id: 'about-me', label: 'About Me' },
] as const;

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
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '');

  const { data: profile, isLoading: isProfileLoading } = trpc.artist.getBySlug.useQuery(
    { slug: user?.artist?.slug! },
    { enabled: !!user?.artist?.slug }
  );

  const updateProfileMutation = trpc.artist.updateProfile.useMutation({
    onSuccess: () => {
      utils.artist.getBySlug.invalidate({ slug: user?.artist?.slug! });
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    }
  });

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isAuthLoading, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.user.name || '');
      setHeadline(profile.headline || '');
      setCompany(profile.company || '');
      setLocation(profile.location || '');
      setWebsiteUrl(profile.websiteUrl || '');
      setAbout(profile.about || '');
    }
  }, [profile]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name,
      headline,
      company,
      location,
      websiteUrl,
      about,
    });
  };

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
        <main className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
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
              </Card>
            </section>
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
              </Card>
            </section>
            <div className="flex justify-end">
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

